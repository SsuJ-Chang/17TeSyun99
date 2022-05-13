let socket = io();

// 玩家資訊
let playerName = document.getElementById('playerName-input');
let me = {'id':'', 'name':'', 'color':'#111111', 'x':x, 'y':y, 'hp':100, 'scores':0, "dx":0, "dy":0} // 要同步的自身玩家資訊

// 連線進入開啟「起始畫面」選單
socket.on('login', ()=>{
    document.getElementById('play-menu').classList.remove('hidden');
})

// 點擊開始後關閉視窗並傳送玩家初始化資訊給後端
document.getElementById('play-button').addEventListener('click', function(e) {
    e.preventDefault();
    if (playerName.value) {
        console.log('輸入名稱', playerName.value);
        me.name = playerName.value;
        let color = "111111";
        while(color === "111111"){
            color = Math.floor(Math.random()*16777215).toString(16); // 隨機顏色
        };
        me.color = `#${color}`;


    console.log('登入玩家資訊', me);
    document.getElementById('play-menu').classList.add('hidden');
    socket.emit('playerInit', me);


    }
});

function start(){ // 正式開始
    // setInterval( getScore, 1000);
    socket.emit('start', 'start');
    console.log("開始!!!!")
}

// function getScore(){ // client 端計算分數
//     me.scores += 1;
//     socket.emit('updateScore', me);
// }

// 接收 me socket.id 才正式開始
socket.on('socketId', (id) => {
    me.id = id;
    start();
})