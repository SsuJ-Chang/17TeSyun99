document.getElementById('switch-signup').addEventListener('click', () => { // 切換成註冊 UI
    document.getElementById('signin').classList.add('hidden');
    document.getElementById('signup').classList.remove('hidden');     
})
document.getElementById('switch-signin').addEventListener('click', () => { // 切換成登入 UI
    document.getElementById('signup').classList.add('hidden');
    document.getElementById('signin').classList.remove('hidden');     
})

function clearInput(selector){  // 清空 input
    let input=document.querySelectorAll(selector);
    for(let i=0;i<input.length;i++){
        input[i].value="";
    }
}

document.getElementById('signin-btn').addEventListener('click', () => { // 登入
    let account=document.getElementById("signin-acc").value;
    let pw=document.getElementById("signin-pw").value;
    fetch("/api/signin", {
        method:"POST",
        body: JSON.stringify({
            "account": `${account}`,
            "password": `${pw}`
          }),
        headers: {
            "Content-type": "application/json"
        }
    }).then((response)=>{
        return response.json();
    }).then((data)=>{
        if(data['ok']){
            document.getElementById('signin').classList.add('hidden');
            document.getElementById('enter-btn').classList.remove('hidden');
            document.getElementById('member-info').classList.remove('hidden');
        }else{
            document.getElementById('alert-window').classList.remove('hidden');
            let alertTitle = generateText('錯誤');
            document.getElementById('alert-window-title').innerHTML="";
            document.getElementById('alert-window-title').appendChild(alertTitle);
            let alertMsg = generateText(`${data['message']}`);
            document.getElementById('alert-window-message').innerHTML="";
            document.getElementById('alert-window-message').appendChild(alertMsg);
        }
    }).catch((error)=>{
        console.log(error);
    })
    clearInput('.input');
})

document.getElementById('signup-btn').addEventListener('click', () => { // 註冊
    let account=document.getElementById("signup-acc").value;
    let pw=document.getElementById("signup-pw").value;
    let nickname=document.getElementById("signup-nickname").value;
    let valid=0;
    if(/^[\w.-]+@[\w.-]+\.[A-Za-z]{2,6}$/i.test(account)){
        valid++;
    }else{
        document.getElementById('alert-window').classList.remove('hidden');
        let alertTitle = generateText('錯誤');
        document.getElementById('alert-window-title').innerHTML="";
        document.getElementById('alert-window-title').appendChild(alertTitle);
        let alertMsg = generateText(`請依格式輸入電子信箱。`);
        document.getElementById('alert-window-message').innerHTML="";
        document.getElementById('alert-window-message').appendChild(alertMsg);
    }
    if(/[0-9a-zA-Z]{4,12}$/i.test(pw)){
        valid++;
    }else{
        document.getElementById('alert-window').classList.remove('hidden');
        let alertTitle = generateText('錯誤');
        document.getElementById('alert-window-title').innerHTML="";
        document.getElementById('alert-window-title').appendChild(alertTitle);
        let alertMsg = generateText(`請依格式輸入密碼。`);
        document.getElementById('alert-window-message').innerHTML="";
        document.getElementById('alert-window-message').appendChild(alertMsg);
    }
    if(/^[\u4E00-\u9FA50-9A-Za-z_]{1,8}$/i.test(nickname)){
        valid++;
    }else{
        document.getElementById('alert-window').classList.remove('hidden');
        let alertTitle = generateText('錯誤');
        document.getElementById('alert-window-title').innerHTML="";
        document.getElementById('alert-window-title').appendChild(alertTitle);
        let alertMsg = generateText(`請依格式輸入暱稱。`);
        document.getElementById('alert-window-message').innerHTML="";
        document.getElementById('alert-window-message').appendChild(alertMsg);
    }
    // if(valid===3){
    //     fetch("/api/user", {
    //         method:"POST",
    //         body: JSON.stringify({
    //             "account": `${account}`,
    //             "password": `${pw}`,
    //             "nickname": `${nickname}`
    //           }),
    //         headers: {
    //             "Content-type": "application/json"
    //         }
    //     }).then((response)=>{
    //         return response.json();
    //     }).then((data)=>{
    //         if(data['ok']){
    //             console.log("註冊成功");
    //         }else{
    //             console.log("註冊失敗");
    //         }
    //     }).catch((error)=>{
    //         console.log(error);
    //     })
    //     clearInput(".input");
    // }
})
