const {MongoClient} = require('mongodb');
const URI = process.env.DB_URI;
const dbName = process.env.DB_NAME;


let client = null;

const connect = (callback) => {
  if (!client) {
    client = new MongoClient(URI, { useUnifiedTopology: true });
    client.connect((err) => {
      if (err) {
        client = null;
        callback(err);
      } else {
        callback();
      }
    })  
 } else {
   callback();
 }
}

const db = () => client.db(dbName);

const close = () => {
  if (client) {
    client.close();
    client = null;
  }
}

module.exports = {
  connect, db, close
}
