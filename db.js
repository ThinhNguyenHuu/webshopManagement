const {MongoClient} = require('mongodb');
const URI = 'mongodb+srv://dbwebshop:dbwebshop@clusterwebshop.4x1ob.mongodb.net/<dbname>?retryWrites=true&w=majority';
const dbName = 'webshop';

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
