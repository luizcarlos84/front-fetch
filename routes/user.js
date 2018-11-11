const express = require('express');
const router = express.Router();

const bodyParse = require('body-parser');
const urlencodedParser = bodyParse.urlencoded({extended : true});

const userdb = require('../db/userdb');



//  ------------------------ DEV ------------------------


var dev = (req, res, next) => {
  console.log('Request type:', req.method);
  console.log('Request URL:', req.originalUrl)
  console.log('ID:', req.params);
  next();
}

var logInfo = (req, res, next) => {
  // Realiza o prompt a cada acesso realizado
  console.log( colors.green(Date.now()) + ' acessado local '.yellow + colors.green(req.originalUrl) );
  next();
}

var checkAuthentication = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  }
  else{
    res.redirect('/login?fail=true');
  }
}

var login = (req, res, next) => {
  var body = req.body,
      username = body.username,
      password = body.password;
}

//  ------------------------ Variaveis renderização ------------------------

var dashboard = (req, res) => {
  res.render('user/dashboard', {
    url      : req.originalUrl,
    title    : 'Peer2you' + req.originalUrl,
    username : req.body.userName,
    token    : req.body.token,
  })
};

var config = (req, res) => {
  res.render('user/config', {
    url      : req.originalUrl,
    title    : 'Peer2you' + req.originalUrl,
    username : req.body.userName,
    token    : req.body.token,
  })
};

var wallet = (req, res) => {
  res.render('user/wallet', {
    url      : req.originalUrl,
    title    : 'Peer2you' + req.originalUrl,
    username : req.body.userName,
    token    : req.body.token,
  })
};


//  ------------------------ Router ------------------------
module.exports = function (passport) {
  router.get('/dashboard', dashboard);
  router.get('/config', config);
  router.get('/wallet', wallet);

  router.post('/dashboard', checkAuthentication, dashboard);
  router.post('/config', config);
  router.post('/wallet', wallet);
  return router;
};
