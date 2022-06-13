const express = require('express');
const router = express.Router();

// 導入必要 module
const {getData, insertData} = require('./model');
require('dotenv').config()
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
router.use(bodyParser.json());

router.get('/api/member', (req, res) => { // API 取得會員狀態
    const cookie = req.headers.cookie;
    console.log('all cookie: ', cookie);
    if(cookie.includes('JWT=')){
        try{
            const value = cookie.split('JWT=')[1].split(';')[0];
            console.log('JWT value', value);
            const token = jwt.verify(value, process.env.TOKEN_SECRET)
            console.log('JWT結果', token.nickname);
            res.status(200).json({'ok':true, 'nickname':token.nickname});
        }catch(error){
            console.log('錯誤！ ', error);
            res.status(500).json({"error": true, "message": "伺服器內部錯誤"});
        }
    }else{
        res.status(200).json({'ok':false});
    }
})

router.post('/api/signin',async (req, res) => { // API 登入
    const account = req.body.account;
    const password = req.body.password;
    console.log(`登入輸入 acc: ${account}, pw: ${password}`);

    try{
        let result = await getData(account);
        console.log('從 DB 取得資料', result);
        
        if(result !== null){
            if(password === result.password){
                // 給 JWT 並設置在 cookie
                const nickname = result.nickname;
                const token = jwt.sign({ nickname }, process.env.TOKEN_SECRET, { expiresIn: '600s' });
                res.cookie('JWT', token, { maxAge: 600000, httpOnly: true});

                res.status(200).json({'ok':true, 'nickname':result.nickname});
                console.log(`${account} 登入成功`);
            }else{
                res.status(400).json({"error": true, "message": "帳號或密碼錯誤，請重新輸入。"});
                console.log(`${account} 登入失敗`);
            }
        }else{
            res.status(400).json({"error": true, "message": "帳號或密碼錯誤，請重新輸入。"});
            console.log(`${account} 登入失敗`);
        }
    }catch(error){
        console.log('錯誤！ ', error);
        res.status(500).json({"error": true, "message": "伺服器內部錯誤"});
    }
})

router.post('/api/signup', async (req, res) => { // API 註冊
    const account = req.body.account;
    const password = req.body.password;
    const nickname = req.body.nickname;
    console.log(`註冊輸入 acc:${account}, pw:${password}, nickname:${nickname}`);

    try{
        let result = await getData(account);
        if(result === null){ // 確認是否有重複帳號
            await insertData(account, password, nickname); // 新增資料
            res.status(200).json({'ok':true, 'nickname':nickname});
            console.log(`${account} 註冊成功`);
        }else{
            res.status(400).json({"error": true, "message": "註冊失敗，帳號重複。"});
            console.log(`${account} 註冊失敗`);
        }
    }catch(error){
        console.log('錯誤！ ', error);
        res.status(500).json({"error": true, "message": "伺服器內部錯誤"});
    }
})

router.get('/api/logout', (req, res)=>{ // API 登出
    // 清除 cookie
    res.clearCookie('JWT');

    res.status(200).json({'ok':true});
    console.log('登出');
})

module.exports = router;