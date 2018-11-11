const ObjectId = require('mongodb').ObjectId;
const bcrypt = require('bcrypt');

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

/* -------------------Consulta de dados para usuários------------------- */


findUser = (username, callback) => {
  global.db.collection("users").findOne({"username": username}, function(err, doc){
      callback(err, doc);
  });
}

findUserById = (id, callback) => {
  global.db.collection("users").findOne({_id: ObjectId(id) }, function(err, doc) {
      callback(err, doc);
  });
}

createUser = (username, password, email, callback) => {
  const cryptPasswd = bcrypt.hashSync(password, 10);
  let newUser = user(username, cryptPasswd, email);

  global.db.collection("users").insert(newUser, function(err, result){
      callback(err, result)
  });
}



module.exports.findUser = findUser;
module.exports.findUserById = findUserById;
module.exports.createUser = createUser
