const express = require('express');
const router = express.Router();

const bodyParse = require('body-parser');
const urlencodedParser = bodyParse.urlencoded({extended : true});

const control = require('./control');


//  ------------------------ Variaveis renderização ------------------------

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

var createCode = (req, res) => {
  res.render('user/createcode', {
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
  router.get('*', control.loggedIn, control.isAuth );
  router.get('/dashboard', dashboard);
  router.get('/config', config);
  router.get('/createcode', createCode);

  return router;
};
