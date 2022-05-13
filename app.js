const express = require('express');
const app = express();
app.use(express.static(__dirname + '/public'));

const http = require('http');
const { isObject } = require('util');
const server = http.createServer(app);

app.get('/', (req, res)=>{
    res.sendFile(__dirname + '/views/index.html');
})

// 導入 socket.io
const { Server } = require("socket.io");
const { log } = require('console');
const io = new Server(server);


// 伺服器遊戲資訊
let playersInfo = { // 同一局遊戲中所有玩家資訊
    'players':[],
    'leaderboard':[]
}
let bulletesInfo = { // 同一局遊戲子彈資訊
    'bulletes':[]
}

// 隨機亂數 function 可以練習外部引入
function getRandom(min, max){
    return Math.floor(Math.random() * (max - min)) + min;
};

// 子彈 class
class Bullete {
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

let isBulletesGenerated = false;

// 子彈設定與行為
function generateBullete(){ // 產生子彈
    let bulleteNum = getRandom(23, 30);
    for(let i = 0; i < bulleteNum; i++){
        // 決定出生位置
        const getBornPos = Math.floor(Math.random() * 4);
        let bulletePosX = 0;
        let bulletePosY = 0;
        let bulleteDx = 0;
        let bulleteDy = 0;
        // 產生隨機數值
        if(getBornPos === 0){ // canvas 上方
            bulletePosX = getRandom(1, 1200) - getRandom(1, 800);
            bulletePosY = 0 - getRandom(50, 200);
            bulleteDx = (getRandom(7, 50) / 10) - (getRandom(9, 50) / 10);
            bulleteDy = (getRandom(4, 40) / 10)
        }else if(getBornPos === 1){ // canvas 下方
            bulletePosX = getRandom(1, 1200) - getRandom(1, 800);
            bulletePosY = getRandom(650, 800);
            bulleteDx = (getRandom(7, 50) / 10) - (getRandom(9, 50) / 10);
            bulleteDy = 0 - (getRandom(6, 40) / 10);
        }else if(getBornPos === 2){ // canvas 左方
            bulletePosX = 0 - getRandom(50, 200);
            bulletePosY = getRandom(1, 800) - getRandom(1, 400);
            bulleteDx = (getRandom(7, 50) / 10);
            bulleteDy = (getRandom(6, 40) / 10) - (getRandom(8, 40) / 10);
        }else{ // canvas 右方
            bulletePosX = getRandom(1050, 1200)
            bulletePosY = getRandom(1, 800) - getRandom(1, 400);
            bulleteDx = 0 - (getRandom(9, 50) / 10);
            bulleteDy = (getRandom(6, 40) / 10) - (getRandom(8, 40) / 10);
        }
        let bulleteRadius = getRandom(3, 8);
        let bulleteHp = getRandom(500, 700);
        let bulleteDamages = getRandom(2, 3);
        
        let newBullete = new Bullete(bulletePosX, bulletePosY, bulleteRadius, bulleteDx, bulleteDy, bulleteHp, bulleteDamages);
        bulletesInfo.bulletes.push(newBullete);           
    }
    isBulletesGenerated = true;
    console.log(`子彈總數量: ${bulletesInfo.bulletes.length}`);
}

function moveBullete(){  // call 每個子彈移動
    bulletesInfo.bulletes = bulletesInfo.bulletes.filter( bullete => bullete.hp > 0 );
    bulletesInfo.bulletes.forEach( bullete => bullete.move() );
}
const tickTime = (Math.floor(Math.random() * 3) + 6)*1000
// console.log(tickTime);
let startGenerateBulletes = setInterval(generateBullete, tickTime); // 間隔時間自動產生子彈
let startMoveBulletes = setInterval(moveBullete, 1000/60);  // 呼叫子彈移動 主要是為了讓他會死亡


// 玩家資訊是否變動 flag
let isPlayersInfoChanged = false;

// server 主要更新 每秒 30 次
let serverUpdate = setInterval(mainUpdate, 1000/30);

function mainUpdate(){ // 更新 玩家 與 子彈 資訊
    if(isPlayersInfoChanged === true){ // 如果玩家資料有變動才廣播更新
        io.emit('playersInfo', playersInfo);
        // console.log("server 更新玩家資訊", playersInfo.players[0].x, playersInfo.players[0].y);
        isPlayersInfoChanged = false;
    }
    if(isBulletesGenerated === true){ // 如果產生新的子彈才廣播更新
        io.emit('bulletesInfo', bulletesInfo);
        isBulletesGenerated = false;
        // console.log('server 更新子彈資訊');
    }
}

// 更新排行榜



io.on('connection', (socket) => { // 該 socket 的連線 主要玩家資料來源
    let startGetScore; // 宣告累積分數區域變數 玩家離線時可清除
    console.log(`a new player connected id=${socket.id}`);
    socket.emit('login', 'ok')
    isPlayersInfoChanged = true;

    socket.on('disconnect', () => { // 離線事件 依照 socket.id 過濾(刪除)玩家
        console.log(`a player disconnected id=${socket.id}`);
        clearInterval(startGetScore);

        let disconnectPlayer = playersInfo.players.find(player => player.id === socket.id);
        playersInfo.players = playersInfo.players.filter(player => player != disconnectPlayer);
        console.log('有玩家離線 當前玩家', playersInfo.players);
        let msgInfo = {id: socket.id, msg: "掰掰！"};
        io.emit('message', msgInfo)
        socket.emit('playersInfo', playersInfo);
        isPlayersInfoChanged = true;
    })

    // 接收玩家資料初始化事件
    socket.on('playerInit', (player) => { // 玩家初始化資料
        let newPlayer = {'id':socket.id, 'name':player.name, 'color':player.color, 'x':player.x, 'y':player.y, 'hp':player.hp, 'scores':player.scores}
        playersInfo.players.push(newPlayer);
        console.log('新玩家加入 當前玩家', playersInfo.players);
        socket.emit('socketId', socket.id); // 重要！一定要先給 client 才能更新資料給該玩家！
        socket.emit('playersInfo', playersInfo);
        let msgInfo = {id: socket.id, msg: "我來了！"};
        io.emit('message', msgInfo);
    })

    socket.on('move', (movePlayer) => { // 玩家鍵盤移動事件
        let updatePlayer = playersInfo.players.find(player => player.id === movePlayer.id)
        if(updatePlayer){
            updatePlayer.x = movePlayer.x;
            updatePlayer.y = movePlayer.y;
            isPlayersInfoChanged = true;
            // console.log(`玩家${updatePlayer.name}座標 (${updatePlayer.x}, ${updatePlayer.y})`);
        }
        // console.log(playersInfo.players[0]);
    })
    
    socket.on('message', (msg) => {
        console.log('後端收到的訊息', msg);
        // let me = playersInfo.players.find(player => player.id === socket.id)
        // msg = `${me.name} 說：${msg}`;
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
        // startGenerateBulletes = setInterval(generateBullete, 5000); // 間隔時間自動產生子彈
        // startMoveBulletes = setInterval(moveBullete, 1000/60);  // 呼叫子彈移動
        startGetScore = setInterval(getScore, 1000); // 開始計時累積分數
        isPlayersInfoChanged = true;
    })

    socket.on('stop', () => { // 玩家死亡結束
        let msgInfo = {id: socket.id, msg: "我死了！可惡！"};
        io.emit('message', msgInfo)
        clearInterval(startGetScore);
        isPlayersInfoChanged = true;
    })

    function getScore(){ // server 端計算得分
        if(socket.id){
            playersInfo.players.find(player => player.id === socket.id).scores += 1;
            isPlayersInfoChanged = true;
        }
    }

})


let port=3099;
server.listen(port, ()=>{
    console.log(`server listening on port: ${port}`)
})