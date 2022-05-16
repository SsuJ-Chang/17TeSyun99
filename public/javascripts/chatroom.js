document.addEventListener('keydown', (e) => { // 按下 Enter 自動進入聊天輸入框
    if(e.key == "Enter") {
        if(document.querySelector("#chat-input").className === "hidden"){
            document.querySelector("#chat-input").classList.remove("hidden");
            document.querySelector("#chat-input").focus();
            document.querySelector('#chat-window').classList.remove('hidden');
            isChatWindowShow = true;
        }
    }
})

document.querySelector('#chat-btn').addEventListener('click', (e) => {
    e.preventDefault();
    if(document.querySelector("#chat-input").value){
        let msg = document.querySelector("#chat-input").value;
        console.log('我說的話', msg);
        socket.emit('message', msg);
        document.querySelector("#chat-input").value = "";
        document.querySelector("#chat-input").blur(); // 離開聊天輸入框
        document.querySelector("#chat-input").classList.add("hidden");
    }
})

let isChatWindowShow = false; // 聊天室窗是否開啟

function hideChatroom(){
    document.querySelector("#chat-window").classList.add("hidden");
    isChatWindowShow = false;
}

let showChatWindow;

socket.on('message', (msgInfo) => {
    let messenger;
    if(players.find( player => player.id === msgInfo.id )){
        messenger = players.find( player => player.id === msgInfo.id );
    }else{
        messenger = talkers.find( talker => talker.id === msgInfo.id );
    }
    
    if(messenger){
        if(msgInfo.msg === 'qwerttt'){
            isPaused = true;
        }else if(msgInfo.msg === 'asdfggg'){
            isPaused = false;
        }else{
            let message = document.createElement('li');
            message.style.color = `${messenger.color}`;
            if(messenger.type === 0){
                message.textContent = ` ${messenger.name} 說：${msgInfo.msg}`;
            }else{
                message.textContent = ` [吃瓜群眾] ${messenger.name} 說：${msgInfo.msg}`;
            }
            document.querySelector('ul').appendChild(message);
            // scrollbar 到最底部
            document.querySelector('#chat-window').scrollTop = document.querySelector('#chat-window').scrollHeight;
            
            if(isChatWindowShow === false){ // 顯示聊天視窗
                document.querySelector('#chat-window').classList.remove('hidden');
                showChatWindow = setTimeout(hideChatroom, 5000)
                isChatWindowShow = true;
            }else{ // 已經顯示視窗 重置顯示 setTimeout
                clearTimeout(showChatWindow);
                showChatWindow = setTimeout(hideChatroom, 5000)
            }
            
        }
    };
    // if(document.querySelector('#chat-window').className === "hidden"){
    //     document.querySelector('#chat-window').classList.remove('hidden');
    // }
})

// document.querySelector('#temp').addEventListener('click', (e) => {
//     e.preventDefault();
//     if(document.querySelector("#chat-input").className === "hidden"){
//         document.querySelector("#chat-input").classList.remove("hidden");
//     }
//     document.querySelector("#chat-input").focus();
// })