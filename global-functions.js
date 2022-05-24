// 隨機亂數 function 可以練習外部引入
function getRandom(min, max){
    return Math.floor(Math.random() * (max - min)) + min;
};

module.exports = getRandom;