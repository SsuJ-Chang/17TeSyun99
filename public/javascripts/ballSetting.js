// 球的位置
let x = getRandom(100, 900);
let y = getRandom(100, 500);

// 碰撞尺寸 同等於 球的半徑
let ballRadius = 15;

function drawBall(x, y, color) { // 畫球
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI*2); // x, y 座標的繪圖起始位置即為圖的位置
    ctx.fillStyle = color;
    ctx.fill();
    ctx.closePath();
}
function drawName(name, x, y) { //  畫跟著球的名字
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.font = "bold 20px sans-serif";
    ctx.fillText(name, x-15, y-20);
}


// 設定鍵盤按鍵按壓狀態 預設為 false
let rightPressed = false;
let leftPressed = false;
let upPressed = false;
let downPressed = false;
document.addEventListener("keydown", keyDownHandler, false); // keydown 事件判斷
document.addEventListener("keyup", keyUpHandler, false); // keyup 事件判斷
function keyDownHandler(e) {
    // console.log(e.key);
    if(e.key == "Right" || e.key == "ArrowRight" || e.key == "d" || e.key == "D") {
        rightPressed = true;
    }
    else if(e.key == "Left" || e.key == "ArrowLeft" || e.key == "a" || e.key == "A") {
        leftPressed = true;
    }
    else if(e.key == "Up" || e.key == "ArrowUp" || e.key == "w" || e.key == "W") {
        upPressed = true;
    }
    else if(e.key == "Down" || e.key == "ArrowDown" || e.key == "s" || e.key == "S") {
        downPressed = true;
    }
}

function keyUpHandler(e) {
    // console.log(e.key);
    if(e.key == "Right" || e.key == "ArrowRight"  || e.key == "d" || e.key == "D") {
        rightPressed = false;
    }
    else if(e.key == "Left" || e.key == "ArrowLeft" || e.key == "a" || e.key == "A") {
        leftPressed = false;
    }
    else if(e.key == "Up" || e.key == "ArrowUp" || e.key == "w" || e.key == "W") {
        upPressed = false;
    }
    else if(e.key == "Down" || e.key == "ArrowDown" || e.key == "s" || e.key == "S") {
        downPressed = false;
    }
}