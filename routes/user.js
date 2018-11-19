const express = require('express');
const router = express.Router();

const bodyParse = require('body-parser');
const urlencodedParser = bodyParse.urlencoded({extended : true});

const control = require('./control');


//  ------------------------ Variaveis renderização ------------------------

var dashboard = (req, res) => {

  control.findwalletDashboard(req, res, (err, doc) => {

    res.render('user/dashboard', {
      url      : req.originalUrl,
      title    : 'Peer2you' + req.originalUrl,
      username : req.user.username,
      token    : req.user._id,
      email    : req.user.email,
      wallets  : req.user.wallets,
      rate_avg : req.user.rate_avg,
      rate     : req.user.rate,
      exchange : doc
    })
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

var code = (req, res) => {

  control.findCodeById(req, res, (err, doc) => {
    if(typeof(doc) != 'undefined'){
      res.render('user/code', {
        url      : req.originalUrl,
        title    : 'Peer2you' + req.originalUrl,
        username : req.user.username,
        token    : req.user._id,
        code     : doc
      })
    }
    else{
      res.render('user/code', {
        url      : req.originalUrl,
        title    : 'Peer2you' + req.originalUrl,
        username : req.user.username,
        token    : req.user._id
      })
    }
  })



};


//  ------------------------ Router ------------------------
module.exports = function (passport) {
  router.get('*', control.loggedIn, control.isAuth );
  router.get('/dashboard', dashboard);
  router.get('/config', config);
  router.get('/code', code)

  router.post('/code', control.insertCode, (req, res) => {
    res.redirect('code');
  });

  return router;
};
