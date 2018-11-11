const express = require('express');
const router = express.Router();

const bodyParse = require('body-parser');
const urlencodedParser = bodyParse.urlencoded({extended : true});

const userdb = require('../db/userdb');

//  ------------------------ Variaveis renderização ------------------------

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

var dashboard = (req, res) => {
  res.render('user/dashboard', {
    url      : req.originalUrl,
    title    : 'Peer2you' + req.originalUrl,
    username : req.user.username,
    token    : req.user._id,
    email    : req.user.email,
    wallets  : req.user.wallets,
    rateavg  : req.user.rate_avg,
    rate     : req.user.rate,
  })
};

var config = (req, res) => {
  res.render('user/config', {
    url      : req.originalUrl,
    title    : 'Peer2you' + req.originalUrl,
    username : req.user.username,
    token    : req.user._id,
    email    : req.user.email,
    wallets  : req.user.wallets,
    rateavg  : req.user.rate_avg,
    rate     : req.user.rate,
  })
};

var wallet = (req, res) => {
  res.render('user/wallet', {
    url      : req.originalUrl,
    title    : 'Peer2you' + req.originalUrl,
    username : req.user.username,
    token    : req.user._id,
    email    : req.user.email,
    wallets  : req.user.wallets,
    rateavg  : req.user.rate_avg,
    rate     : req.user.rate,
  })
};


//  ------------------------ Router ------------------------
module.exports = function (passport) {
  router.get('*', loggedIn, isAuth );
  router.get('/dashboard', dashboard);
  router.get('/config', config);
  router.get('/wallet', wallet);

  return router;
};
