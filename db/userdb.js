const ObjectId = require('mongodb').ObjectId;
const bcrypt = require('bcrypt');
const mongoClient = require('mongodb').MongoClient;

const control = require('../routes/control');

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
    "score"    : {
      "score"     : 0,
      "timestamp" : 0
    },
    "wallets"  : [],
    "rate_avg" : 0,
    "rate"     : []
  }
};

const codeGen = (id, code) => {
  let date = Date.now()
  return {
    "ver"      : 1,
    "user"     : id,
    "code"     : code,
    "timestamp": date,
    "active"   : true
  }
}

const pending = (idUser, wallet) => {
  let date = Date.now()
  return{
    "_idUser"  : idUser,
    "wallet"   : wallet,
    "timestamp": date
  }
}

/* -------------------conexão de dados para usuários------------------- */


/**
 * Conexão com o banco de dados.
 */

connect = (url, base, callback) => {

  return mongoClient.connect(url, { useNewUrlParser: true }, (err, client) => {
   if(err)
     return console.log('error:',err);
   console.log('Conectado ao banco');
   callback(client);
 });
}

/* -------------------Consulta de dados para usuários------------------- */

// Encontra o usuaŕio através do username
findUser = (username, callback) => {

  let base = 'users';
  connect(url, base, client => {
    client.db(base).collection("users").findOne({"username": username}, function(err, doc){
        callback(err, doc);
        client.close();
    })
  })
}

// Encontra o usuário através do ID
findUserById = (id, callback) => {

  let base = 'users';
  connect(url, base, client => {
    client.db(base).collection("users").findOne({_id: ObjectId(id) }, function(err, doc) {
        callback(err, doc);
        client.close();
    })
  })
}

// insere um novo usuário no sistema
insertUser = (username, password, email, callback) => {

  // Criptografando senha
  let cryptPasswd = bcrypt.hashSync(password, 10);
  let newUser = user(username, cryptPasswd, email);

  let base = 'users';
  connect(url, base, client => {
    client.db(base).collection("users").insert( newUser, function(err, doc){
        callback(err, doc)
        client.close();
    });
  })
}

// Encontra o usuário através do ID e atualiza a senha
updatePasswd = (id, password, callback) => {

  let cryptPasswd = bcrypt.hashSync(password, 10);
  let base = 'users';
  let update = {$set: { "passwd": cryptPasswd }}

  connect(url, base, client => {
    client.db(base).collection("users").findOneAndUpdate({_id: ObjectId(id) }, update, {}, function(err, doc) {
        callback(err, doc);
        client.close();
    })
  })
}

// Encontra o usuário através do ID e atualiza
updateUser = (id, update) => {

  let base = 'users';

  connect(url, base, client => {
    client.db(base).collection("users").findOneAndUpdate({_id: ObjectId(id) }, update, {}, function(err, doc) {
        client.close();
    })
  })
}

// Insere uma nova carteira ao usuário
insertWallet = (id, wallet, callback) => {

  let base = 'users';
  connect(url, base, client => {
    client.db(base).collection("users").updateOne(
      {_id: ObjectId(id) },
      { $push: { wallets: wallet } },
      function(err, doc){
        callback(err, doc)
        client.close();
    });
  })
}

// Retorno das carteiras para o score
findWalletScore = (query, callback) => {

  let base = 'wallet';
  connect(url, base, client => {
    client.db(base).collection("wallet").find( query, {projection: {
      _id    : 1,
      hash160: 1,
      owner  : 1,
      balance: 1,
      score  : 1
    }}).toArray((err, doc) => {
      callback(err,doc);
      client.close();
    })
  });
}


// Retorna as informações da carteira desde que o usuário seja dono.
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

// Retorna as informações da carteira desde que o usuário seja dono.
removeWalletUser = (id, wallet, callback) => {

  let base = 'users';
  connect(url, base, client => {
    client.db(base).collection("users").findOneAndUpdate(
      {
        _id: {$eq : ObjectId(id)}
      }, {
        $pullAll: {
          wallets: [ wallet ]
        }
      },
      function(err, doc){
        callback(err, doc);
        client.close();
    })
  })
}

// Retornar uma carteira não proprietaria
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

// retorna as informações completa da carteira
findWalletInfo = (wallet, callback) => {

  let base = 'wallet';
  connect(url, base, client => {
    client.db(base).collection("wallet").findOne({"_id": wallet}, function(err, doc){
        callback(err, doc);
        client.close();
    })
  })
}

// Retorna as informações das carteiras para exibição
findwalletDashboard = (array, callback) => {

  let base = 'wallet';
  connect(url, base, client => {
    client.db(base).collection("wallet").find({"_id": {$in: array}}, {
        projection:{
          "_id"    : 0,
          "balance": 1,
          "n_tx"   : 1,
        }
      }).toArray((err, doc) => {
        callback(err, doc);
        client.close();
    })
  })
}

// encontra e retorna um codigo ativo
findCode= (code, callback) => {

  let base = 'users';
  connect(url, base, client => {
    client.db(base).collection("code").findOne({ $and: [{
          "code"  : code
        },{
          "active": true
        }
      ]}, {
        projection:{
          "_id"   : 0,
          "code"  : 1,
          "user"  : 1
        }
      }, (err, doc) => {
        client.db(base).collection("users").findOne({_id: doc.user }, {
            projection:{
              "_id"      : 0,
              "username" : 1,
              "score"    : 1
            }
          }, (err, doc) => {
            callback(err, doc);
            client.close();
        })
    })
  })
}

// Lista os códigos gerados aos proprietarios
findCodeById= (id, callback) => {

  let base = 'users';
  connect(url, base, client => {
    client.db(base).collection("code").find({
      "user": id
    }, {
      projection:{
        "_id"      : 0,
        "code"     : 1,
        "timestamp": 1,
        "active"   : 1
      }
    }).toArray((err, doc) => {
        callback(err, doc);
        client.close();
    })
  })
}

// Insere o codigo dentro da collection code
insertCode = (id, callback) => {

  let codeOk = true,
      code = control.codeGen();

  // do {
  //   // gera um codigo aletório
  //   code = control.codeGen()
  //
  //   findCode(code, (err, doc) => {
  //     if(doc == null)
  //       codeOk = false;
  //   })
  //
  //   // Teste
  //   console.log('Codigo:', code, 'doc', doc);
  //
  // } while (codeOk);

  // instancia de um novo codigo
  let newCode = codeGen(id, code);

  let base = 'users';
  connect(url, base, client => {
    client.db(base).collection("code").insert( newCode, function(err, doc){
        callback(err, doc)
        client.close();
    });
  })
}

insertPending = ( idUser, wallet) => {

  let pend = pending( idUser, wallet);

  let base = 'wallet';
  connect(url, base, client => {
    client.db(base).collection("pending").insertOne( pend, function(err, doc){
        client.close();
    });
  });
}

var clearScoreHolder = ( id, array) => {

  let update = {
    $pullAll: {
      "score.exchange": array
    } }

  let base = 'users';
  connect(url, base, client => {
    client.db(base).collection("users").findOneAndUpdate({_id: ObjectId(id) }, update, {}, function(err, doc) {
        client.close();
    })
  })

}

module.exports.findUser = findUser;
module.exports.findUserById = findUserById;
module.exports.insertUser = insertUser
module.exports.updatePasswd = updatePasswd;
module.exports.updateUser = updateUser;

module.exports.findWalletScore = findWalletScore;
module.exports.removeWalletUser = removeWalletUser;
module.exports.findWalletAllUser = findWalletAllUser;
module.exports.findWalletUser = findWalletUser;
module.exports.insertWallet = insertWallet;
module.exports.findWalletInfo = findWalletInfo;
module.exports.findwalletDashboard = findwalletDashboard;

module.exports.findCode = findCode;
module.exports.findCodeById = findCodeById;
module.exports.insertCode = insertCode;

module.exports.insertPending = insertPending;
module.exports.clearScoreHolder = clearScoreHolder;
