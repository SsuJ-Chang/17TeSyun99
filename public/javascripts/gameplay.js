let players = []; // 所有玩家
let bulletes = []; // 所有子彈

function calculateDistance(playerX, playerY, bulleteX, bulleteY){ // 計算子彈和球的距離
    // let distance = ((playerX-bulleteX)**2+(playerY-bulleteY)**2)**0.5
    let distance = Math.sqrt((playerX-bulleteX)**2+(playerY-bulleteY)**2)
    return distance
}

function drawBulete(x, y, radius) { // 畫子彈
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI*2); // x, y 座標的繪圖起始位置即為子彈的位置
    ctx.fill();
    ctx.closePath();
}

function updateMyScores(){ // 顯示分數
    document.getElementById('my-scores').innerHTML="";
    document.getElementById('my-scores').innerHTML=me.scores;
}

// 接收 server 傳來的同步資訊

socket.on('playersInfo', (playersInfo)=>{ // 更新玩家資訊
    // console.log('收到的資料', playersInfo.players);
    players = playersInfo.players;
    if(me.id !== ""){
        me = players.filter(player => player.id === me.id)[0] // 更新資料給 me
        console.log(`${me.name}, 位置:(${me.x}, ${me.y}), 分數:${me.scores}`);
        updateMyScores();
    }
    console.log("現在所有玩家資訊", players);
})


socket.on('bulletesInfo', (bulletesInfo) => { // 更新子彈資運
    bulletes = bulletesInfo.bulletes;
    // console.log('全部的子彈', bulletes);
})



function gameOverB(bullete){
    if(bullete && me.id){ // 子彈與 me 必須還存在
        // console.log(calculateDistance(me.x, me.y, bullete.x, bullete.y))
        if(calculateDistance(me.x, me.y, bullete.x, bullete.y) <= ballRadius+bullete.radius){
            socket.emit('stop', 'stop');
            document.location.reload();
            clearInterval(renderInterval);
            alert(`你死了，存活了 ${me.scores} 秒。`);
        }
    }
}
function gameOverP(player){
    if(player && me.id){ // 其他玩家與 me 必須還存在
        if(calculateDistance(me.x, me.y, player.x, player.y) <= ballRadius * 2){
            socket.emit('stop', 'stop');
            document.location.reload();
            clearInterval(renderInterval);
            alert(`你死了，存活了 ${me.scores} 秒。`);
        }
    }
}

function draw(){ // 作為 render 的手段 以 圖 的座標位置為 render 位置 並將碰撞計算在內
    ctx.clearRect(0, 0, canvas.width, canvas.height); // 清除 canvas
    // drawBall();
    players.forEach( player => drawBall(player.x, player.y, player.color) );
    players.forEach( player => drawName(player.name, player.x, player.y) );
    bulletes.forEach( bullete => drawBulete(bullete.x, bullete.y, bullete.radius) );

    // 計算子彈和 me 的是否碰撞 有則結束遊戲
    bulletes.forEach( bullete => gameOverB(bullete) );

    // 計算其他玩家和 me 的是否碰撞 有則結束遊戲
    let others = players.filter( player => player.id !== me.id); 
    others.forEach( player => gameOverP(player) );

    // 用鍵盤操控玩家球的移動距離與限制(碰撞)
    if(rightPressed) {
        x += 4;
        if (x + ballRadius > canvas.width){
            x = canvas.width - ballRadius;
        }
    }
    if(leftPressed) {
        x -= 4;
        if (x < ballRadius){
            x = ballRadius;
        }
    }
    if(upPressed) {
        y -= 4;
        if (y < ballRadius){
            y = ballRadius;
        }
    }
    if(downPressed) {
        y += 4;
        if (y + ballRadius > canvas.height){
            y = canvas.height - ballRadius;
        }
    }

    if(x !== me.x || y !== me.y){
        me.x = x;
        me.y = y;
        socket.emit('move', me);
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
