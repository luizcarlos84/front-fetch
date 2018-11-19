const express = require('express');
const router = express.Router();
const ObjectId = require('mongodb').ObjectId;


const bodyParse = require('body-parser');
const urlencodedParser = bodyParse.urlencoded({extended : true});

const userdb = require('../db/userdb');


//  ------------------------ Variaveis Controle ------------------------

// Gera um novo codigo aleatório
codeGen = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    let pass = ''
    for(let i = 0; i < 9; i++)
      pass += chars.charAt(Math.random() * 61)
    return pass
}


// Verifica se o usuário realizou login
isAuth = (req, res, next) => {
  if(req.user)
     return next();
  else
     res.redirect('/login')
}

// Verificar se existe login ativo e informa na varivel local
var loggedIn = (req, res, next) => {

  res.locals.loggedIn = (req.user) ? true : false;
  next();
}

// Cria o usuário na tela de registro
var registerPost = (req, res, next) => {

  userdb.insertUser(req.body.InputUserName, req.body.InputPassword, req.body.InputEmail, (err, result) => {
    if(err) res.redirect('/register?fail=true');
    res.redirect('/login');
  })
};

// Insere novas carteiras no usuario
var insertWallet = (req, res, next) => {

  userdb.insertWallet(req.user._id, req.body.InputWallet, (err, result) => {
    if(err) res.redirect('wallet?fail=true');
    res.redirect('wallet');
  })
}

// Verifica se a carteira existe
var walletHaveOwn = (req, res, next) => {

  userdb.findWalletAllUser(req.user._id, req.body.InputWallet, (err, result) => {
    if(err)
      res.redirect('wallet?error=true');
    else {
      if(result == null)
        next();

      else{
        if (typeof(result._id) == 'object'){

          if( Object.is(JSON.stringify(result._id), JSON.stringify(req.user._id)) )
            res.redirect('wallet?AlreadyOwn=true');

          else
            res.redirect('wallet?haveUser=true');

        }
      }
    }
  })
}

// retorna as informações se existir
var walletInfo = (req, res, callback) => {

  if(req.method == 'GET'){
    if(req.params.walletId){
      userdb.findWalletInfo(req.params.walletId, (err, doc) =>{
        if(err)
          res.redirect('?error=true');

        else{
          if(doc == null)
            res.redirect('?noExist=true');

          else
            callback(doc);
        }
      });
    }
  }
}

var findwalletDashboard = (req, res, callback) => {

  userdb.findwalletDashboard(req.user.wallets, (err, doc) => {
    console.log(err, doc);

    let exchange = 0;
    doc.forEach( element => {
      exchange += element.n_tx;
    })
    callback(err, exchange);
  })
}

// Cria um código busca sem login
var insertCode = (req, res, next) => {

  userdb.insertCode(req.user._id, (err, result) => {
    if(err) res.redirect('?fail=true');
    next();
  })
}

// Busca por um codigo gerado por algum usuário
var findCode = (req, res, callback) => {

  if(req.method == 'GET'){
    userdb.findCode(req.params.inputCode, (err, doc) => {
      if(err) res.redirect('/profile?fail=true');
      callback(err, doc);
    })
  }
  else if (req.method == 'POST'){
    userdb.findCode(req.body.InputCode, (err, doc) => {
      if(err) res.redirect('/profile?fail=true');
      callback(err, doc);
    })
  }

}

// Encontra codigos gerados pelo usuário
var findCodeById = (req, res, callback) => {

  // Testar a busca
  userdb.findCodeById(req.user._id, (err, doc) => {
    callback(err, doc);
  })
}

module.exports.isAuth = isAuth;
module.exports.loggedIn = loggedIn;
module.exports.codeGen = codeGen;

module.exports.insertWallet = insertWallet;
module.exports.registerPost = registerPost;
module.exports.walletHaveOwn = walletHaveOwn;
module.exports.walletInfo = walletInfo;
module.exports.findwalletDashboard = findwalletDashboard;

module.exports.findCode = findCode;
module.exports.findCodeById = findCodeById;
module.exports.insertCode = insertCode;
