document.addEventListener('keydown', (e) => { // 按下 Enter 自動進入聊天輸入框
    if(e.key == "Enter") {
        if(document.querySelector("#chat-input").className === "hidden"){
            document.querySelector("#chat-input").classList.remove("hidden");
        }
        document.querySelector("#chat-input").focus();
    }
})

document.querySelector('#chat-btn').addEventListener('click', (e) => {
    e.preventDefault();
    if (document.querySelector("#chat-input").value) {
        let msg = document.querySelector("#chat-input").value;
        console.log('說的話', msg);
        socket.emit('message', msg);
        document.querySelector("#chat-input").value = "";
        document.querySelector("#chat-input").blur(); // 離開聊天輸入框
        document.querySelector("#chat-input").classList.add("hidden");
    }
})

socket.on('message', (msgInfo) => {
    let messenger = players.find( player => player.id === msgInfo.id )
    let message = document.createElement('li');
    message.style.color = '#00ff00';
    if(messenger.color){
        message.style.color = `${messenger.color}`;
    }
    message.textContent = `${messenger.name} 說：${msgInfo.msg}`;
    document.querySelector('ul').appendChild(message);
    // if(document.querySelector('#chatroom').className === "hidden"){
    //     document.querySelector('#chatroom').classList.remove('hidden');
    // }
})

document.querySelector('#temp').addEventListener('click', (e) => {
    e.preventDefault();
    if(document.querySelector("#chat-input").className === "hidden"){
        document.querySelector("#chat-input").classList.remove("hidden");
    }
    document.querySelector("#chat-input").focus();
})