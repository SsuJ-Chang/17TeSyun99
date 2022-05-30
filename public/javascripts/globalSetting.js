// render 畫布
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
// canvas.width = window.innerWidth;
// canvas.height = window.innerHeight;
canvas.width = "1000";
canvas.height = "600";

// 隨機亂數 function 可以練習外部引入
function getRandom(min, max){
    return Math.floor(Math.random() * (max - min)) + min;
};

// 點擊警告視窗確認按鈕
document.getElementById('alert-window-confirm-btn').addEventListener('click', () => {
    document.location.reload();
})

// 產生文字節點
function generateText(string){
    return document.createTextNode(string);
}