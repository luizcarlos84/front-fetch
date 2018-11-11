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

isLogin = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login?fail=true');
}

//  ------------------------ Variaveis renderização ------------------------

var test = (req, res) => {
  res.send(req.session);
  // res.send(req.body);
}

var test2 = (req, res) => {
  // res.send(req.session);
  res.send(req.body);
}


var index = (req, res) => {
  res.render('index', {
    url      : req.originalUrl,
    title     : 'Peer2you',
    jumbotron : 'Procurando criptomoedas?',
    subtitle  : 'Conhecemos as pessoas certas! Cuidamos das informações e você do mais importante: seu dinheiro',
    more      : 'Saiba Mais'
  });
};

var register = (req, res) => {
  res.render('register', {
    url      : req.originalUrl,
    title    : 'Peer2you' + req.originalUrl,
    username : 'Usuário',
    email    : 'Email',
    password : 'Senha',
    check    : 'Lembre-me',
    submit   : 'Registrar'
  });
};

var login = (req, res) => {
  if(req.query.fail){
    res.render('login', {
      url      : req.originalUrl,
      title    : 'Peer2you' + req.originalUrl,
      username : 'Usuário',
      email    : 'Email',
      password : 'Senha',
      check    : 'Lembre-me',
      submit   : 'Entrar',
      message  : 'Usuário e/ou senha incorretos!'
    });
  }
  else{
    res.render('login', {
      url      : req.originalUrl,
      title    : 'Peer2you' + req.originalUrl,
      username : 'Usuário',
      email    : 'Email',
      password : 'Senha',
      check    : 'Lembre-me',
      submit   : 'Entrar',
      message  : null
    });
  }
};

var logout = (req, res) => {
  req.logout();
  res.redirect('/login');
}


var registerPost = (req, res, next) => {
  userdb.createUser(req.body.InputUserName, req.body.InputPassword, req.body.InputEmail, (err, result) => {
    if(err) res.redirect('/register?fail=true');
    res.redirect('/login');
  })
};

var donePOST = (req, res) => {

  res.render('done', {
    url      : req.originalUrl,
    title    : 'Peer2you' + req.originalUrl,
    username : req.body.InputUserName,
    email    : req.body.InputEmail,
    password : req.body.InputPassword,
    token    : req.body.token,
  });
};

//  ------------------------ Router ------------------------

module.exports = function (passport) {
  router.get('/test', test );
  router.get('/test2', test2 );
  router.get('/', index );
  router.get('/register', register );
  router.get('/login', login );
  router.get('/logout', logout );


  router.post('/register', registerPost);
  router.post('/done', urlencodedParser, donePOST );
  router.post('/login',
    passport.authenticate('local', {
      successRedirect: '/user/dashboard',
      failureRedirect: '/login?fail=true'
    })
  );

  return router;
};
