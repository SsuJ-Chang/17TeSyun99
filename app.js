// 導入 express
const express = require('express');
const app = express();
const path = require('path');
app.use(express.static('./public')); // 靜態檔案路徑和 middleware

// 建立原生 Node.js http server
const http = require('http');
const { isObject } = require('util');
const server = http.createServer(app);

// MongoDB 連線
// const dbConnect = require('./global-functions');
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://anfer:Anferdb0728@cluster0.nabgq.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

// 解析 body
const bodyParser = require('body-parser');
app.use(bodyParser.json());

// 設定各 API
app.get('/', (req, res)=>{  // 首頁 / 登入畫面
    // 用 JWT 判斷是否已登入
    res.sendFile(path.resolve(__dirname, './views/index.html'));
})

const {getData, insertData} = require('./model');

app.post('/api/signin',async (req, res) => { // API 登入
    const account = req.body.account;
    const password = req.body.password;
    console.log(`登入輸入 acc:${account}, pw:${password}`);

    try{
        let result = await getData(account);
        console.log('從 DB 取得資料', result);
        
        if(result !== null){
            if(password === result.password){
                // 給 JWT
                res.status(200).json({'ok':true, 'nickname':result.nickname});
                console.log(`${account} 登入成功`);
            }else{
                res.status(400).json({"error": true, "message": "帳號或密碼錯誤，請重新輸入。"});
                console.log(`${account} 登入失敗`);
            }
        }else{
            res.status(400).json({"error": true, "message": "帳號或密碼錯誤，請重新輸入。"});
            console.log(`${account} 登入失敗`);
        }
    }catch(error){
        console.log('錯誤！ ', error);
        res.status(500).json({"error": true, "message": "伺服器內部錯誤"});
    }
})

app.post('/api/signup', async (req, res) => { // API 註冊
    const account = req.body.account;
    const password = req.body.password;
    const nickname = req.body.nickname;
    console.log(`註冊輸入 acc:${account}, pw:${password}, nickname:${nickname}`);

    try{
        let result = await getData(account);
        if(result === null){ // 確認是否有重複帳號
            await insertData(account, password, nickname); // 新增資料
            res.status(200).json({'ok':true, 'nickname':nickname});
            console.log(`${account} 註冊成功`);
        }else{
            res.status(400).json({"error": true, "message": "註冊失敗，帳號重複。"});
            console.log(`${account} 註冊失敗`);
        }
    }catch(error){
        console.log('錯誤！ ', error);
        res.status(500).json({"error": true, "message": "伺服器內部錯誤"});
    }
})

app.get('/api/logout', (req, res)=>{ // API 登出
    // 重新設定 JWT 的期限
    res.status(200).json({'ok':true});
    console.log('登出');
})

// 導入 socket.io
const { Server } = require("socket.io");
const { log } = require('console');
const { SocketAddress } = require('net');
const io = new Server(server);


// 伺服器遊戲資訊
let playersInfo = { // 同一局遊戲中所有 玩家players 資訊
    'players':[],
    'sortedPlayers':[],
}
let bulletsInfo = { // 同一局遊戲子彈資訊
    'bullets':[]
}
let talkersInfo = { // 同一局遊戲所有 純聊天者talkers 資訊
    'talkers':[]
}
let maxConcurrentPlayers = 0; // 開機以最高同上玩家
let time = new Date(); // 伺服器時間

const fs = require('fs'); // 引入 File System Module

const getRandom = require('./global-functions');

// 是否暫停
let isPaused = false;

// 子彈 class
class Bullet {
    constructor(x, y , radius, dx, dy, hp, damages){
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.dx = dx;
        this.dy = dy;
        this.hp = hp;
        this.damages = damages;
    }
    move(){
        this.x += this.dx;
        this.y += this.dy;
        this.hp -= this.damages;
    }
}

let isBulletsGenerated = false;

// 子彈設定與行為
function generateBullet(){ // 產生子彈
    if(isPaused === false){
        let bulletNum = getRandom(25, 32);
        for(let i = 0; i < bulletNum; i++){
            // 決定出生位置
            const getBornPos = Math.floor(Math.random() * 4);
            let bulletPosX = 0;
            let bulletPosY = 0;
            let bulletDx = 0;
            let bulletDy = 0;
            // 產生隨機數值
            if(getBornPos === 0){ // canvas 上方
                bulletPosX = getRandom(1, 1200) - getRandom(1, 800);
                bulletPosY = 0 - getRandom(50, 200);
                bulletDx = (getRandom(7, 50) / 10) - (getRandom(9, 50) / 10);
                bulletDy = (getRandom(4, 40) / 10)
            }else if(getBornPos === 1){ // canvas 下方
                bulletPosX = getRandom(1, 1200) - getRandom(1, 800);
                bulletPosY = getRandom(650, 800);
                bulletDx = (getRandom(7, 50) / 10) - (getRandom(9, 50) / 10);
                bulletDy = 0 - (getRandom(6, 40) / 10);
            }else if(getBornPos === 2){ // canvas 左方
                bulletPosX = 0 - getRandom(50, 200);
                bulletPosY = getRandom(1, 800) - getRandom(1, 400);
                bulletDx = (getRandom(7, 50) / 10);
                bulletDy = (getRandom(6, 40) / 10) - (getRandom(8, 40) / 10);
            }else{ // canvas 右方
                bulletPosX = getRandom(1050, 1200)
                bulletPosY = getRandom(1, 800) - getRandom(1, 400);
                bulletDx = 0 - (getRandom(9, 50) / 10);
                bulletDy = (getRandom(6, 40) / 10) - (getRandom(8, 40) / 10);
            }
            let bulletRadius = getRandom(3, 8);
            let bulletHp = getRandom(500, 700);
            let bulletDamages = getRandom(2, 3);
            
            let newBullet = new Bullet(bulletPosX, bulletPosY, bulletRadius, bulletDx, bulletDy, bulletHp, bulletDamages);
            bulletsInfo.bullets.push(newBullet);           
        }
        isBulletsGenerated = true;
        console.log(`子彈總數量: ${bulletsInfo.bullets.length}`);
    }
}

function moveBullet(){  // call 每個子彈移動
    if(isPaused === false){
        bulletsInfo.bullets = bulletsInfo.bullets.filter( bullet => bullet.hp > 0 );
        bulletsInfo.bullets.forEach( bullet => bullet.move() );
    }
}
const tickTime = (Math.floor(Math.random() * 3) + 6)*1000
let startGenerateBullets = setInterval(generateBullet, tickTime); // 間隔時間自動產生子彈
let startMoveBullets = setInterval(moveBullet, 1000/60);  // 呼叫子彈移動 主要是為了讓他會死亡


// 玩家player 資訊是否變動 flag
let isPlayersInfoChanged = false;
// 純聊天者talker 資訊是否變動 flag
let isTalkersInfoChanged = false;

// server 主要更新 每秒 60 次
let serverUpdate = setInterval(mainUpdate, 1000/60);

function mainUpdate(){ // 更新 玩家 與 子彈 資訊
    if(isPlayersInfoChanged === true){ // 如果玩家player 資料有變動才廣播更新
        io.emit('playersInfo', playersInfo);
        // console.log("server 更新玩家資訊", playersInfo.players[0].x, playersInfo.players[0].y);
        isPlayersInfoChanged = false;
    }
    if(isBulletsGenerated === true){ // 如果產生新的子彈才廣播更新
        io.emit('bulletsInfo', bulletsInfo);
        isBulletsGenerated = false;
        // console.log('server 更新子彈資訊');
    }
    if(isTalkersInfoChanged === true){ // 如果純聊天者talker 資料有變動才廣播更新
        io.emit('talkersInfo', talkersInfo);
        isTalkersInfoChanged = false;
    }
}

// 依分數高低排序
function updateLeaderboard(){
    if(playersInfo.players.length > 0){
        playersInfo.players.sort( (player1, player2) => (player2.scores - player1.scores) );
        if(playersInfo.sortedPlayers !== playersInfo.players){
            playersInfo.sortedPlayers = playersInfo.players
            isPlayersInfoChanged = true;
            if(playersInfo.sortedPlayers[0]){
                console.log(`1st ${playersInfo.sortedPlayers[0].name} ${playersInfo.sortedPlayers[0].scores}`);
            }
            if(playersInfo.sortedPlayers[1]){
                console.log(`2nd ${playersInfo.sortedPlayers[1].name} ${playersInfo.sortedPlayers[1].scores}`);
            }
            if(playersInfo.sortedPlayers[2]){
                console.log(`3rd ${playersInfo.sortedPlayers[2].name} ${playersInfo.sortedPlayers[2].scores}`);
            }
            io.emit('playersInfo', playersInfo);
        }
    }
}
let leaderboardInfo = setInterval(updateLeaderboard, 5000);

io.on('connection', (socket) => { // 該 socket 的連線 主要玩家資料來源
    let startGetScore; // 宣告累積分數區域變數 玩家離線時可清除
    console.log(`新的使用者 id=${socket.id}`);
    socket.emit('login', 'ok')
    socket.emit('playersInfo', playersInfo);
    socket.emit('bulletsInfo', bulletsInfo);
    socket.emit('talkersInfo', talkersInfo);

    socket.on('disconnect', () => { // 離線事件 依照 socket.id 過濾(刪除)玩家
        console.log(`使用者離線 id=${socket.id}`);
        clearInterval(startGetScore); // 停止計算分數

        let disconnectPlayer = playersInfo.players.find(player => player.id === socket.id);
        playersInfo.players = playersInfo.players.filter(player => player != disconnectPlayer);
        let disconnectTalker = talkersInfo.talkers.find(talker => talker.id === socket.id);
        talkersInfo.talkers = talkersInfo.talkers.filter(talker => talker != disconnectTalker);
        
        if(disconnectPlayer !== undefined){
            io.emit('playersInfo', playersInfo)
            isPlayersInfoChanged = true;
        }else{
            isTalkersInfoChanged = true;
        }
        let msgInfo = {id: socket.id, msg: "我悄悄的離開..."};
        io.emit('message', msgInfo)
    })

    // 接收 player 資料初始化事件
    socket.on('playerInit', (player) => { // player 初始化資料
        let newPlayer = {'type': 0,'id':socket.id, 'name':player.name, 'color':player.color, 'x':player.x, 'y':player.y, 'hp':player.hp, 'scores':player.scores, 'dx':player.dx, 'dy':player.dy}
        playersInfo.players.push(newPlayer);
        if(playersInfo.players.length > maxConcurrentPlayers){
            maxConcurrentPlayers += 1;
            console.log('Server 最高同上', maxConcurrentPlayers);
            let recordingTime = time.getFullYear() + "/" + (time.getMonth() + 1) + "/" + time.getDate() + " - " + time.getHours( ) + ":" + time.getMinutes() + ":" + time.getSeconds();
            fs.writeFileSync('./server-log.txt', `最高同上玩家 ${maxConcurrentPlayers}    ${recordingTime}`); // 寫入 log
        }
        console.log('新玩家加入 當前玩家', playersInfo.players);
        socket.emit('socketId', socket.id); // 重要！一定要先給 client 才能更新資料給該玩家！
        socket.emit('playersInfo', playersInfo);
        
    })

    // 接收 talker 資料初始化事件
    socket.on('talkerInit', (talker) => { // talker 初始化資料
        let newTalker = {'type': 1, 'id':socket.id, 'name':talker.name, 'color':talker.color }
        talkersInfo.talkers.push(newTalker);
        console.log('新 talker 加入 當前 talkers', talkersInfo.talkers);
        socket.emit('socketId', socket.id); // 重要！一定要先給 client 才能更新資料給該玩家！
        isTalkersInfoChanged = true;
        socket.emit('talkersInfo', talkersInfo);
    })

    socket.on('move', (movePlayer) => { // 玩家鍵盤移動事件
        let updatePlayer = playersInfo.players.find(player => player.id === movePlayer.id)
        if(updatePlayer){
            updatePlayer.x = movePlayer.x;
            updatePlayer.y = movePlayer.y;
            updatePlayer.dx = movePlayer.dx;
            updatePlayer.dy = movePlayer.dy;
            isPlayersInfoChanged = true;
            // console.log(`玩家${updatePlayer.name}座標 (${updatePlayer.x}, ${updatePlayer.y})`);
        }
        // console.log(playersInfo.players[0]);
        // console.log(`dx:${updatePlayer.dx}, dy:${updatePlayer.dy}`);
    })
    
    socket.on('message', (msg) => {
        console.log('後端收到的訊息', msg);
        // let me = playersInfo.players.find(player => player.id === socket.id)
        // msg = `${me.name} 說：${msg}`;
        if(msg === '++'){
            isPaused = true;
        }else if(msg === '--'){
            isPaused = false;
        }
        let msgInfo = {id: socket.id, msg: msg};
        io.emit('message', msgInfo);
    })

    // socket.on('mousemovePage', (movePlayerCursor) => { // 玩家滑鼠移動事件
    //     console.log(movePlayerCursor);
    //     let movePlayer = playersInfo.players.find(player => player.id === socket.id);
    //     console.log('滑鼠移動玩家', movePlayer);
    //     if(movePlayer){
    //         movePlayer.x = movePlayerCursor.x;
    //         movePlayer.y = movePlayerCursor.y;
    //         console.log('新滑鼠移動玩家', movePlayer);
    //         console.log('所有玩家', playersInfo);
    //         socket.emit('playerInfo', playersInfo)
    //     }
    // })

    socket.on('start', () => { // 玩家正式加入遊戲(有 socket.id 後)
        startGetScore = setInterval(getScore, 1000); // 開始計時累積分數
        isPlayersInfoChanged = true;
    })

    function getScore(){ // server 端計算得分
        if(isPaused === false){
            if(socket.id){
                playersInfo.players.find(player => player.id === socket.id).scores += 1;
                isPlayersInfoChanged = true;
            }
        }
    }

    socket.on('hit', (hitPlayer) => { // 玩家碰到子彈或其他玩家
        let updatePlayer = playersInfo.players.find( player => player.id === socket.id);
        updatePlayer.hp = hitPlayer.hp;
        isPlayersInfoChanged = true;
    })
})


let port=3099;
server.listen(port, ()=>{
    console.log(`server listening on port: ${port}`)
})