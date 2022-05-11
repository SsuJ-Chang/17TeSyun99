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
    constructor(x, y , radius, dx, dy, hp, damages, creator){
        // this.id = id;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.dx = dx;
        this.dy = dy;
        this.hp = hp;
        this.damages = damages;
        this.creator = creator;
    }
    move(){
        this.x += this.dx;
        this.y += this.dy;
        this.hp -= this.damages;
    }
}

// 子彈設定與行為
function generateBullete(){ // 產生子彈
    
    let bulleteNum = getRandom(10, 15);
    for(let i = 0; i < bulleteNum; i++){
        let bulletePosX = getRandom(1, 1200) - getRandom(1, 800);
        let bulletePosY = getRandom(1, 800) - getRandom(1, 400);
        let bulleteRadius = getRandom(3, 8);
        let bulleteDx = (getRandom(7, 50) / 15) - (getRandom(9, 50) / 13);
        let bulleteDy = (getRandom(4, 40) / 15) - (getRandom(6, 40) / 13);
        let bulleteHp = getRandom(350, 600);
        let bulleteDamages = getRandom(1, 3);
        
        let newBullete = new Bullete(bulletePosX, bulletePosY, bulleteRadius, bulleteDx, bulleteDy, bulleteHp, bulleteDamages);
        bulletesInfo.bulletes.push(newBullete);           
    }

    console.log(`子彈總數量: ${bulletesInfo.bulletes.length}`);
}

function moveBullete(){  // call 每個子彈移動
    bulletesInfo.bulletes = bulletesInfo.bulletes.filter( bullete => bullete.hp > 0 );
    bulletesInfo.bulletes.forEach( bullete => bullete.move() );
}

let startGenerateBulletes = setInterval(generateBullete, 4000); // 間隔時間自動產生子彈
let startMoveBulletes = setInterval(moveBullete, 1000/60);  // 呼叫子彈移動


// 玩家資訊是否變動 flag
let isPlayersInfoChanged = false;

// server 主要更新 每秒 60 次
let serverUpdate = setInterval(mainUpdate, 1000/60);

function mainUpdate(){ // 更新 玩家 與 子彈 資訊
    if(isPlayersInfoChanged === true){ // 如果玩家資料有變動才廣播更新
        io.emit('playersInfo', playersInfo);
        // console.log("server 更新玩家資訊");
        isPlayersInfoChanged = false;
    }
    if(bulletesInfo.bulletes !== []){ // 如果有子彈才廣播更新
        io.emit('bulletesInfo', bulletesInfo);
        // console.log('server 更新子彈資訊');
    }
}

// 更新排行榜



io.on('connection', (socket) => { // 該 socket 的連線 主要玩家資料來源
    // let startGenerateBulletes; // 宣告產生子彈區域變數 玩家離線時可清除
    // let startMoveBulletes; // 宣告移動子彈區域變數 玩家離線時可清除
    let startGetScore; // 宣告累積分數區域變數 玩家離線時可清除
    console.log(`a new player connected id=${socket.id}`);
    socket.emit('login', 'ok')

    socket.on('disconnect', () => { // 離線事件 依照 socket.id 過濾(刪除)玩家
        console.log(`a player disconnected id=${socket.id}`);
        
        // clearInterval(startGenerateBulletes);
        clearInterval(startGetScore);

        let disconnectPlayer = playersInfo.players.find(player => player.id === socket.id);
        playersInfo.players = playersInfo.players.filter(player => player != disconnectPlayer);
        console.log('有玩家離線 當前玩家', playersInfo.players);
        let msgInfo = {id: socket.id, msg: "掰掰！"};
        io.emit('message', msgInfo)
        socket.emit('playersInfo', playersInfo);
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
            // socket.emit('playersInfo', playersInfo);
        }
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
    })

    socket.on('stop', () => { // 玩家死亡結束
        let msgInfo = {id: socket.id, msg: "我死了！可惡！"};
        io.emit('message', msgInfo)
        // clearInterval(startGenerateBulletes);
        clearInterval(startGetScore);
    })

    function getScore(){ // server 端計算得分
        if(socket.id){
            playersInfo.players.find(player => player.id === socket.id).scores += 1;
            isPlayersInfoChanged = true;
            // socket.emit('playersInfo', playersInfo);
        }
    }

    // // 子彈設定與行為
    // function generateBullete(){ // 產生子彈
    //     if(socket.id){
    //         let bulleteNum = getRandom(10, 15);
    //         for(let i = 0; i < bulleteNum; i++){
    //             let bulletePosX = getRandom(1, 1200) - getRandom(1, 800);
    //             let bulletePosY = getRandom(1, 800) - getRandom(1, 400);
    //             let bulleteRadius = getRandom(3, 8);
    //             let bulleteDx = (getRandom(7, 50) / 15) - (getRandom(9, 50) / 13);
    //             let bulleteDy = (getRandom(4, 40) / 15) - (getRandom(6, 40) / 13);
    //             let bulleteHp = getRandom(350, 600);
    //             let bulleteDamages = getRandom(1, 3);
    //             let bulleteCreator = playersInfo.players.find( player => player.id === socket.id ).id;
                
    //             let newBullete = new Bullete(bulletePosX, bulletePosY, bulleteRadius, bulleteDx, bulleteDy, bulleteHp, bulleteDamages, bulleteCreator);
    //             bulletesInfo.bulletes.push(newBullete);           
    //         }
    //     } 
    //     console.log(`子彈總數量: ${bulletesInfo.bulletes.length}`);
    // }

    // function moveBullete(){  // call 每個子彈移動 global
    //     if(socket.id){
    //         let creatorBulletes =  bulletesInfo.bulletes.filter( bullete => bullete.hp > 0 && bullete.creator === socket.id ); // 過濾該玩家產生的子彈 避免呼叫到其他子彈移動
    //         // console.log(`${socket.id} 的子彈`, creatorBulletes);

    //         bulletesInfo.bulletes = bulletesInfo.bulletes.filter( bullete => bullete.hp > 0 );

    //         // 呼叫該玩家的子彈移動 並過濾(刪除)hp <=0 的子彈並更新所有子彈 Array 給所有玩家
    //         creatorBulletes.forEach( bullete => bullete.move() );
    //         // bulletesInfo.bulletes = bulletesInfo.bulletes.filter( bullete => bullete.hp > 0 );
    //         io.emit('bulletesInfo', bulletesInfo);
    //     }
    // }
})


let port=3099;
server.listen(port, ()=>{
    console.log(`server listening on port: ${port}`)
})