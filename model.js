require('dotenv').config() // 使用 dotenv 引入環境變數
// 連線至 MongoDB
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nabgq.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function getData(email){ // 取得會員資料 function
    try {
        await client.connect();
        const database = client.db("17tesyun99");
        const results = database.collection("members");
        
        const query = { account: email };
        const result = await results.findOne(query);
        // console.log('getData 的結果', result);

        return result;

    } finally {
      await client.close();
    }
}

module.exports = getData;