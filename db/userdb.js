const ObjectId = require('mongodb').ObjectId;
const bcrypt = require('bcrypt');
const mongoClient = require('mongodb').MongoClient;

/* ------------------- Database URL ------------------- */

const url = 'mongodb://localhost:27017/';

/* -------------------Modelo de dados para usuários-------------------

 ver       : 1,
 user      : "string",
 passwd    : "hash",
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
    "wallets"  : [],
    "rate_avg" : -1,
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

createUser = (username, password, email, callback) => {

  // Criptografando senha
  let cryptPasswd = bcrypt.hashSync(password, 10);
  let newUser = user(username, cryptPasswd, email);

  let base = 'users';
  connect(url, base, client => {
    client.db(base).collection("users").insert(newUser, function(err, result){
        callback(err, result)
        client.close();
    });
  })
}



module.exports.findUser = findUser;
module.exports.findUserById = findUserById;
module.exports.createUser = createUser
