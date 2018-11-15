const ObjectId = require('mongodb').ObjectId;
const bcrypt = require('bcrypt');
const mongoClient = require('mongodb').MongoClient;

/* ------------------- Database URL ------------------- */

const url = 'mongodb://localhost:27017/';

/* -------------------Modelo de dados para usuários-------------------

 ver       : 1,
 user      : "string",
 passwd    : "hash",
 score     : var
 wallet    : ["string"],
 rate_avg  : "var",
 rate      :
 */

const user = (username, passwd, email) => {
  return {
    "ver"      : 1,
    "username" : username,
    "email"    : email,
    "passwd"   : passwd,
    "score"    : 0,
    "wallets"  : [],
    "rate_avg" : 0,
    "rate"     : []
  }
};


/* -------------------conexão de dados para usuários------------------- */


/**
 * Conexão com o banco de dados.
 */

connect = (url, base, callback) => {
  return mongoClient.connect(url, { useNewUrlParser: true }, (err, client) => {
   if(err)
     return console.log(err);
   console.log('Conectado ao banco');
   callback(client);
 });
}

/* -------------------Consulta de dados para usuários------------------- */

findUser = (username, callback) => {

  let base = 'users';
  connect(url, base, client => {
    client.db(base).collection("users").findOne({"username": username}, function(err, doc){
        callback(err, doc);
        client.close();
    })
  })
}

findUserById = (id, callback) => {

  let base = 'users';
  connect(url, base, client => {
    client.db(base).collection("users").findOne({_id: ObjectId(id) }, function(err, doc) {
        callback(err, doc);
        client.close();
    })
  })
}

insertUser = (username, password, email, callback) => {

  // Criptografando senha
  let cryptPasswd = bcrypt.hashSync(password, 10);
  let newUser = user(username, cryptPasswd, email);

  let base = 'users';
  connect(url, base, client => {
    client.db(base).collection("users").insert( newUser, function(err, result){
        callback(err, result)
        client.close();
    });
  })
}

insertWallet = (id, wallet, callback) => {

  let base = 'users';
  connect(url, base, client => {
    client.db(base).collection("users").updateOne(
      {_id: ObjectId(id) },
      { $push: { wallets: wallet } },
      function(err, result){
        callback(err, result)
        client.close();
    });
  })
}

findWalletUser = (id, wallet, callback) => {

  let base = 'users';
  connect(url, base, client => {
    client.db(base).collection("users").findOne(
      { $and: [{
        _id: ObjectId(id)
      },
      {
        wallets: { $eq: wallet }
      }] },
      function(err, doc){
        callback(err, doc);
        client.close();
    })
  })
}

findWalletAllUser = (id, wallet, callback) => {

  let base = 'users';
  connect(url, base, client => {
    client.db(base).collection("users").findOne(
      {
        wallets: { $eq: wallet }
      },
      function(err, doc){
        callback(err, doc);
        client.close();
    })
  })
}

findWalletInfo = (wallet, callback) => {

  let base = 'wallet';
  connect(url, base, client => {
    client.db(base).collection("wallet").findOne({"_id": wallet}, function(err, doc){
        callback(err, doc);
        client.close();
    })
  })
}

module.exports.findUser = findUser;
module.exports.findUserById = findUserById;
module.exports.insertUser = insertUser

module.exports.findWalletAllUser = findWalletAllUser;
module.exports.findWalletUser = findWalletUser;
module.exports.insertWallet = insertWallet;
module.exports.findWalletInfo = findWalletInfo;
