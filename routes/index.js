const express = require('express');
const router = express.Router();

const bodyParse = require('body-parser');
const urlencodedParser = bodyParse.urlencoded({extended : true});

const control = require('./control');

//  ------------------------ DEV ------------------------

var test = (req, res) => {
  res.send(req.session);
  // res.send(req.body);
}

var test2 = (req, res) => {
  // res.send(req.session);
  res.send(req.user);
}

var test3 = (req, res) => {
  // res.send(req.session);
  res.send(res.locals);
}

//  ------------------------ Variaveis renderização ------------------------

var logout = (req, res) => {
  req.logout();
  res.redirect('/');
}

var index = (req, res) => {
  res.render('index', {
    url       : req.originalUrl,
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

var done = (req, res) => {

  res.render('done', {
    url      : req.originalUrl,
    title    : 'Peer2you' + req.originalUrl,
    username : req.body.InputUserName,
    email    : req.body.InputEmail,
    password : req.body.InputPassword,
    token    : req.body.token
  });
};

//  ------------------------ Router ------------------------

module.exports = (passport) => {
  router.get('*', control.loggedIn);
  router.get('/test', test );
  router.get('/test2', test2 );
  router.get('/test3', test3 );


  router.get('/', index );
  router.get('/register', register );
  router.get('/login', login );
  router.get('/logout', logout );


  router.post('/register', control.registerPost);
  router.post('/done', urlencodedParser, done );
  router.post('/login',
    passport.authenticate('local', {
      successRedirect: '/user/dashboard',
      failureRedirect: '/login?fail=true'
    })
  );

  return router;
};
