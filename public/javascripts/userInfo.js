// const domain = "http://52.7.185.223:3099";
const domain = "http://localhost:3099";
const socket = io(`${domain}`, {'transports': ['websocket', "polling"]}); // 直接指定以 websocket 連線
// const socket = io(); // 一般連線 會先以 http 為主

// 玩家資訊
let userName = document.getElementById('username-input');
let me = {'type':0, 'id':'', 'name':'', 'color':'#111111', 'x':x, 'y':y, 'hp':100, 'scores':0, "dx":0, "dy":0} // 要同步的自身玩家資訊
let isInvincible = true; // 是否無敵
function cancelInvincible(){
    isInvincible = false;
}


// 連線進入開啟「起始畫面」選單
socket.on('login', ()=>{
    document.getElementById('play-menu').classList.remove('hidden');
})

// 點擊 開始特訓 後關閉上層menu並傳送 player 初始化資訊給後端
document.getElementById('play-button').addEventListener('click', function(e) {
    e.preventDefault();
    if (userName.value) {
        if(/^[\u4E00-\u9FD50-9A-Za-z_]{1,8}$/i.test(userName.value)){ // 檢查輸入格式是否正確
            me.type = 0;
            x = getRandom(100, 900);
            me.x = x;
            y = getRandom(100, 500);
            me.y = y;
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
            document.getElementById('leaderboard').classList.remove('hidden');
            socket.emit('playerInit', me);
        }else{
            document.location.reload();
            alert("請輸入 1 至 8 個文字");
            return;
        }
    }
});

function start(){ // 正式開始
    let invincible = setTimeout(cancelInvincible ,5000);
    socket.emit('start', 'start');
    // console.log("開始!!!!")
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
        if(/^[\u4E00-\u9FD50-9A-Za-z_]{1,8}$/i.test(userName.value)){
            me.type = 1;
            console.log('輸入名稱', userName.value);
            me.name = userName.value;
            me.color = '#aaa';
            console.log('登入純聊天者資訊', me);
            document.getElementById('play-menu').classList.add('hidden');
            document.getElementById('leaderboard').classList.remove('hidden');
            socket.emit('talkerInit', me);
        }else{
            document.location.reload();
            alert("請輸入 1 至 8 個文字");
            return;
        }
    }
});