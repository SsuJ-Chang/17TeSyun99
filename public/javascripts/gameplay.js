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
socket.on('playersInfo', (playersInfo)=>{ // 更新其他玩家資訊
    // console.log('收到的資料', playersInfo.players);
    players = playersInfo.players;
    if(me.id !== ""){
        me.scores = players.filter(player => player.id === me.id)[0].scores // 更新資料給 me
        // console.log(`${me.name}, 位置:(${me.x}, ${me.y}), 分數:${me.scores}`);
        updateMyScores();
    }
    // console.log("現在所有玩家資訊", players);
})


socket.on('bulletesInfo', (bulletesInfo) => { // 更新子彈資訊
    bulletes = bulletesInfo.bulletes;
    // console.log('全部的子彈', bulletes);
})

function checkHitByBullete(bullete){ // 判定是否碰到子彈
    if(bullete && me.id){ // 子彈與 me 必須還存在
        // console.log(calculateDistance(me.x, me.y, bullete.x, bullete.y))
        if(calculateDistance(me.x, me.y, bullete.x, bullete.y) <= ballRadius+bullete.radius){
            
            socket.emit('stop', 'stop');
            document.location.reload();
            alert(`你死了，存活了 ${me.scores} 秒。`);
            // clearInterval(renderInterval);
        }
    }
}
function checkHitByPlayer(player){ // 判定是否碰到其他玩家
    if(player && me.id){ // 其他玩家與 me 必須還存在
        if(calculateDistance(me.x, me.y, player.x, player.y) <= ballRadius * 2){
            
            socket.emit('stop', 'stop');
            document.location.reload();
            alert(`你死了，存活了 ${me.scores} 秒。`);
            // clearInterval(renderInterval);
        }
    }
}

let isDirectionChanged = false;
let lastX = 0;
let lastY = 0;
let lastDx = 0;
let lastDy = 0;

function draw(){ // 作為 render 的手段 以 圖 的座標位置為 render 位置 並將碰撞計算在內
    ctx.clearRect(0, 0, canvas.width, canvas.height); // 清除 canvas
    isDirectionChanged = false;
    lastX = me.x;
    lastY = me.y;

    // render 自己
    drawBall(me.x, me.y, me.color);
    drawName(me.name, me.x, me.y);

    let others = players.filter( player => player.id !== me.id); 
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
    for(let i=0;i<=bulletes.length;i++){
        if(bulletes[i]){
            bulletes[i].x += bulletes[i].dx;
            bulletes[i].y += bulletes[i].dy;
        }
    }

    // 計算子彈和 me 的是否碰撞 有則結束遊戲
    bulletes.forEach( bullete => checkHitByBullete(bullete) );

    // 計算其他玩家和 me 的是否碰撞 有則結束遊戲
    others.forEach( player => checkHitByPlayer(player) );

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

    if(lastX === me.x){
        dx = 0;
        isDirectionChanged = true;
    }
    if(lastY === me.y){
        dy = 0;
        isDirectionChanged = true;
    }

    me.x = x;
    me.y = y;
    
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
