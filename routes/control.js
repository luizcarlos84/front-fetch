const express = require('express');
const router = express.Router();
const ObjectId = require('mongodb').ObjectId;


const bodyParse = require('body-parser');
const urlencodedParser = bodyParse.urlencoded({extended : true});

const userdb = require('../db/userdb');


//  ------------------------ Variaveis Controle ------------------------

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

var walletExist = (req, res, next) => {
  userdb.findWalletUser(req.user._id, req.body.InputWallet, (err, result) => {
    if(err) res.redirect('wallet?error=true');
    if(result == null) next()
    else res.redirect('wallet?AlreadyOwn=true');
  })
}

var walletHaveOwn = (req, res, next) => {
  userdb.findWalletAllUser(req.user._id, req.body.InputWallet, (err, result) => {
    if(err) res.redirect('wallet?error=true');
    if(result == null) next();
    else{
      if (typeof(result._id) == 'object'){
        console.log(result._id, ObjectId(req.user._id), Object.is(result._id, ObjectId(req.user._id)));
        if(Object.is(result._id, req.user._id))
          res.redirect('wallet?AlreadyOwn=true');
        else {
          res.redirect('wallet?haveUser=true');
        }
      }
    }
  })
}

var walletInfo = (req, res, next) => {
  userdb.findWalletInfo(req.params.walletId, (err, result) =>{
    if(err) res.redirect('wallet?error=true');
    if(result == null) res.redirect('wallet?noExist=true');
    else res.json(result); // Como manipular o JSON??
  });

}

module.exports.isAuth = isAuth;
module.exports.loggedIn = loggedIn;
module.exports.insertWallet = insertWallet;
module.exports.registerPost = registerPost;
module.exports.walletHaveOwn = walletHaveOwn;
module.exports.walletExist = walletExist;
module.exports.walletInfo = walletInfo;
