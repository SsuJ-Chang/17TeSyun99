let players = []; // 所有玩家player
let sortedPlayers = []; // 分數由高至低排序後的玩家player
let bulletes = []; // 所有子彈
let talkers = []; // 所有純聊天者talker
let isPaused = false; // 是否暫停

function drawPause(){
    ctx.fillStyle = "rgba(0, 205, 205, 0.8)";
    ctx.font = "bold 48px sans-serif";
    ctx.fillText("- 遊戲暫停 -", 400, 300);
}

function calculateDistance(playerX, playerY, bulleteX, bulleteY){ // 計算子彈和球的距離
    let distance = Math.sqrt((playerX-bulleteX)**2+(playerY-bulleteY)**2)
    return distance
}

function drawBulete(x, y, radius) { // 畫子彈
    ctx.beginPath();
    let radialgradient = ctx.createRadialGradient(x, y, 0.5, x, y, radius); // 設定漸層
    radialgradient.addColorStop(0, '#fff');
    radialgradient.addColorStop(1, 'rgba(255, 50, 0 , 0.9)');
    ctx.arc(x, y, radius, 0, Math.PI*2); // x, y 座標的繪圖起始位置即為子彈的位置
    ctx.fillStyle = radialgradient;
    ctx.fill();
    ctx.closePath();
}

function updateMyScores(){ // 顯示我的分數
    document.getElementById('my-scores').innerHTML = "";
    document.getElementById('my-scores').innerHTML = me.scores;
}

function updateLeaderboard(){ // 更新排行
    document.getElementById('first-place-name').innerHTML = "";
    document.getElementById('first-place-scores').innerHTML = "";
    document.getElementById('second-place-name').innerHTML = "";
    document.getElementById('second-place-scores').innerHTML = "";
    document.getElementById('third-place-name').innerHTML = "";
    document.getElementById('third-place-scores').innerHTML = "";
    if(sortedPlayers[0]){
        document.getElementById('first-place-name').innerHTML = sortedPlayers[0].name;
        document.getElementById('first-place-scores').innerHTML = sortedPlayers[0].scores;
    }
    if(sortedPlayers[1]){
        document.getElementById('second-place-name').innerHTML = sortedPlayers[1].name;
        document.getElementById('second-place-scores').innerHTML = sortedPlayers[1].scores;
    }
    if(sortedPlayers[2]){
        document.getElementById('third-place-name').innerHTML = sortedPlayers[2].name;
        document.getElementById('third-place-scores').innerHTML = sortedPlayers[2].scores;
    }
}

// 接收 server 傳來的同步資訊
socket.on('playersInfo', (playersInfo)=>{ // 更新所有玩家資訊 包含排行
    // console.log('收到的資料', playersInfo.players);
    players = playersInfo.players.filter( player => player.hp > 0 );
    sortedPlayers = playersInfo.sortedPlayers.filter( player => player.hp > 0 );
    if(me.id !== "" && me.type === 0){
        me.scores = players.filter(player => player.id === me.id)[0].scores // 更新資料給 me
        updateMyScores();
    }
    updateLeaderboard();
    // console.log("現在所有玩家資訊", players);
})

socket.on('bulletesInfo', (bulletesInfo) => { // 更新子彈資訊
    bulletes = bulletesInfo.bulletes;
    // console.log('全部的子彈', bulletes);
})

socket.on('talkersInfo', (talkersInfo) => { // 更新所有純聊天者資訊
    talkers = talkersInfo.talkers;
    // console.log("現在所有純聊天者資訊", talkers);
})


function checkHitByBullete(bullete){ // 判定是否碰到子彈
    if(bullete && me.id && me.type === 0){ // 子彈與 me 必須還存在
        // console.log(calculateDistance(me.x, me.y, bullete.x, bullete.y))
        if(calculateDistance(me.x, me.y, bullete.x, bullete.y) < ballRadius+bullete.radius){
            me.hp -= 100; // 扣 hp
            socket.emit('hit', me);
            socket.disconnect();
            // 顯示結束視窗
            document.getElementById('alert-window').classList.remove('hidden');
            let alertTitle = generateText('特訓結束');
            document.getElementById('alert-window-title').appendChild(alertTitle);
            let hitMsg = generateText(`你被子彈打中了，存活了 ${me.scores} 秒。`);
            document.getElementById('alert-window-message').appendChild(hitMsg);
        }
    }
}
function checkHitByPlayer(player){ // 判定是否碰到其他玩家
    if(player && me.id && me.type === 0){ // 其他玩家與 me 必須還存在
        if(calculateDistance(me.x, me.y, player.x, player.y) < ballRadius * 2){
            me.hp -= 100; // 扣 hp
            socket.emit('hit', me);
            socket.disconnect()
            // 顯示結束視窗
            document.getElementById('alert-window').classList.remove('hidden');
            let alertTitle = generateText('特訓結束');
            document.getElementById('alert-window-title').appendChild(alertTitle);
            let hitMsg = generateText(`你撞到別人了，存活了 ${me.scores} 秒。`);
            document.getElementById('alert-window-message').appendChild(hitMsg);
        }
    }
}

// 玩家狀態：移動方向是否變化、座標與移動量
let isDirectionChanged = false;
let lastX = 0;
let lastY = 0;
let lastDx = 0;
let lastDy = 0;

// 指定背景圖片物件
let backgroundImg = new Image();
backgroundImg.src = '/images/stars02.png';

function draw(){ // 作為 render 的手段 以 圖 的座標位置為 render 位置 並將碰撞計算在內
    ctx.clearRect(0, 0, canvas.width, canvas.height); // 清除 canvas
    ctx.drawImage(backgroundImg, 0, 0); // render 背景圖
    
    isDirectionChanged = false;
    lastX = me.x;
    lastY = me.y;

    // 如果使用者是玩家就 render 自己
    if(me.type === 0 && me.hp > 0){
        if(isInvincible === true){
            drawInvincible(me.x, me.y);
        }
        drawBall(me.x, me.y, me.color);
        drawName(me.name, me.x, me.y);
    }
    // 過濾 自己 取得 其他活著的玩家
    let others = players.filter( player => player.id !== me.id && player.hp > 0); 
    // render 其他玩家
    others.forEach( player => drawBall(player.x, player.y, player.color) );
    others.forEach( player => drawName(player.name, player.x, player.y) );
    // 移動其他玩家
    for(let i=0;i<=others.length;i++){
        if(others[i]){
            others[i].x += others[i].dx;
            others[i].y += others[i].dy;
        }
    }

    // render 子彈
    bulletes.forEach( bullete => drawBulete(bullete.x, bullete.y, bullete.radius) );
    // 移動子彈
    if(isPaused === false){
        for(let i=0;i<=bulletes.length;i++){
            if(bulletes[i]){
                bulletes[i].x += bulletes[i].dx;
                bulletes[i].y += bulletes[i].dy;
            }
        }
    }

    // 計算子彈和 me 的是否碰撞 有則結束遊戲
    if(isInvincible === false && me.hp > 0){
        bulletes.forEach( bullete => checkHitByBullete(bullete) );
    }

    // 計算其他玩家和 me 的是否碰撞 有則結束遊戲
    if(isInvincible === false && me.hp > 0){
        others.forEach( player => checkHitByPlayer(player) );
    }

    // 用鍵盤操控玩家球的移動距離與限制(碰撞)
    if(rightPressed) {
        x += 2;
        me.dx = 2;
        if (x + ballRadius > canvas.width){
            x = canvas.width - ballRadius;
            me.dx = 0;
        }
    }
    if(leftPressed) {
        x -= 2;
        me.dx = -2;
        if (x < ballRadius){
            x = ballRadius;
            me.dx = 0;
        }
    }
    if(upPressed) {
        y -= 2;
        me.dy = -2;
        if (y < ballRadius){
            y = ballRadius;
            me.dy = 0;
        }
    }
    if(downPressed) {
        y += 2;
        me.dy = 2;
        if (y + ballRadius > canvas.height){
            y = canvas.height - ballRadius;
            me.dy = 0;
        }
    }

    me.x = x;
    me.y = y;
    
    // 座標是否改變
    if(lastX === me.x){
        me.dx = 0;
    }else{
        isDirectionChanged = true;
    }
    if(lastY === me.y){
        me.dy = 0;
    }else{
        isDirectionChanged = true;
    }

    // 位移量是否改變
    if(me.dx !== lastDx){
        lastDx = me.dx;
        isDirectionChanged = true;
    }
    if(me.dy !== lastDy){
        lastDy = me.dy;
        isDirectionChanged = true;
    }

    if(isDirectionChanged === true){
        socket.emit('move', me);
    }
    
    if(isPaused === true){
        drawPause();
    }
    // 監聽滑鼠位置
    // window.addEventListener('mousemove', (e) => {
    //     if(e.pageX > me.x){
    //         x += 0.001;
    //         if (me.x + ballRadius > canvas.width){
    //             me.x = canvas.width - ballRadius;
    //         }
    //         me.x = x;
    //     }else if(e.pageX < me.x){
    //         x -= 0.001;
    //         if (me.x < ballRadius){
    //             me.x = ballRadius;
    //         }
    //         me.x = x;
    //     }else{
    //         me.x === me.x;
    //     }
    //     if(e.pageY > me.y){
    //         y += 0.001;
    //         if (me.y + ballRadius > canvas.height){
    //             me.y = canvas.height - ballRadius;
    //         }
    //         me.y = y;
    //     }else if(e.pageY < me.y){
    //         y -= 0.001;
    //         if (me.y < ballRadius){
    //             me.y = ballRadius;
    //         }
    //         me.y = y;
    //     }else{
    //         me.y === me.y;
    //     }
    //     socket.emit('move', me);
    // })


}
let renderInterval = setInterval(draw, 1000/60) // 用間隔時間達到動畫效果 60FPS 永不間斷
