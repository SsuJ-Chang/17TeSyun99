// const { MongoClient, ServerApiVersion } = require('mongodb');
// const uri = "mongodb+srv://anfer:Anferdb0728@cluster0.nabgq.mongodb.net/?retryWrites=true&w=majority";
// const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

// client.connect(err => {
//     const collection = client.db("17tesyun99").collection("members");
//     collection.find({account:"test@test"}).toArray(function(err, results){
//         console.log("結果勒", results); // output all records
//     });

//     client.close();
// });


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://anfer:Anferdb0728@cluster0.nabgq.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function getData(email){
    try {
        await client.connect();
        const database = client.db("17tesyun99");
        const results = database.collection("members");
        
        const query = { account: email };
        
        const result = await results.findOne(query);
        
        console.log('getData 的結果', result);

        return result;

      } finally {
        await client.close();
      }
}

module.exports = getData;