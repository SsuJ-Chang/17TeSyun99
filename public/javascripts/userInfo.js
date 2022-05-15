let socket = io();

// 玩家資訊
let userName = document.getElementById('userName-input');
let me = {'type':0, 'id':'', 'name':'', 'color':'#111111', 'x':x, 'y':y, 'hp':100, 'scores':0, "dx":0, "dy":0} // 要同步的自身玩家資訊

// 連線進入開啟「起始畫面」選單
socket.on('login', ()=>{
    document.getElementById('play-menu').classList.remove('hidden');
})

// 點擊 開始特訓 後關閉上層menu並傳送 player 初始化資訊給後端
document.getElementById('play-button').addEventListener('click', function(e) {
    e.preventDefault();
    if (userName.value) {
        me.type = 0;
        console.log('輸入名稱', userName.value);
        me.name = userName.value;
        let color = "111111";
        while(color === "111111"){
            color = Math.floor(Math.random()*16777215).toString(16); // 隨機顏色
        };
        me.color = `#${color}`;

    console.log('登入玩家資訊', me);
    document.getElementById('play-menu').classList.add('hidden');
    document.getElementById('my-scores-title').classList.remove('hidden');
    socket.emit('playerInit', me);

    }
});

function start(){ // 正式開始
    // setInterval( getScore, 1000);
    socket.emit('start', 'start');
    console.log("開始!!!!")
}

// 接收 me socket.id 才正式開始
socket.on('socketId', (id) => {
    me.id = id;
    if(me.type === 0){
        start();
    }
});

// 點擊 純聊天 後關閉上層menu並傳送 talker 初始化資訊給後端
document.getElementById('talk-button').addEventListener('click', function(e) {
    e.preventDefault();
    if (userName.value) {
        me.type = 1;
        console.log('輸入名稱', userName.value);
        me.name = userName.value;
        me.color = '#fff';

    console.log('登入純聊天者資訊', me);
    document.getElementById('play-menu').classList.add('hidden');
    socket.emit('talkerInit', me);

    }
});