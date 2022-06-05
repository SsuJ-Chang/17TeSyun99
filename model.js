require('dotenv').config() // 使用 dotenv 引入環境變數
// 連線至 MongoDB
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nabgq.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function getData(email){ // 取得會員資料 function
  try {
      await client.connect();
      const database = client.db(`${process.env.DB_DB}`);
      const members = database.collection(`${process.env.DB_COLLECTION}`);
      
      const query = { account: email };
      const result = await members.findOne(query);
      // console.log('getData 的結果', result);

      return result;

  } finally {
    await client.close();
  }
}

async function insertData(email, password, nickname){ // 插入新的會員資料 function
  try {
    await client.connect();
    const database = client.db(`${process.env.DB_DB}`);
    const members = database.collection(`${process.env.DB_COLLECTION}`);
    // create a document to insert
    const doc = {
      account: `${email}`,
      password: `${password}`,
      nickname: `${nickname}`,
      best_record: 0
    }
    const result = await members.insertOne(doc);
    console.log(`成功新增一筆資料 id: ${result.insertedId}`);
  } finally {
    await client.close();
  }
}

module.exports = {getData, insertData};
