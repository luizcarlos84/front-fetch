const express = require('express');
const router = express.Router();

const bodyParse = require('body-parser');
const urlencodedParser = bodyParse.urlencoded({extended : true});

const control = require('./control');


//  ------------------------ Variaveis renderização ------------------------

var dashboard = (req, res) => {

  control.findwalletDashboard(req, res, (err, doc) => {



    if (doc) {

      let bal = 0;
      let exc = 0;

      doc.forEach(element => {
        bal += element.balance;
        exc += element.n_tx;
      })

      if(bal.toFixed(0) == 0){
        textbal = 'Analisando'

      }
      else if(bal.toFixed(0) > 70){
        textbal = 'Holder'
      }
      else if(bal.toFixed(0) > 30){
        textbal = 'Moderado'
      }
      else{
        textbal = 'Conservador'
      }


      datas = {
        url      : req.originalUrl,
        title    : 'Peer2you' + req.originalUrl,
        username : req.user.username,
        token    : req.user._id,
        email    : req.user.email,
        wallets  : req.user.wallets,
        rate_avg : req.user.rate_avg,
        rate     : req.user.rate,
        score    : req.user.score.score,
        exchange : exc,
        balance  : bal * Math.pow(10, -8 ),
        textbal  : textbal
      }
    }
    else {
      datas = {
        url      : req.originalUrl,
        title    : 'Peer2you' + req.originalUrl,
        username : req.user.username,
        token    : req.user._id,
        email    : req.user.email,
        wallets  : req.user.wallets,
        rate_avg : req.user.rate_avg,
        rate     : req.user.rate,
        score    : 0,
        exchange : 0,
        balance  : 0,
        textbal  : 'Analisando'
      }
    }
    res.render('user/dashboard', datas )
  })
};

var config = (req, res) => {

  res.render('user/config', {
    url      : req.originalUrl,
    title    : 'Peer2you' + req.originalUrl,
    submit   : 'Atualizar',
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
    if(doc){
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
  router.get('/dashboard/update', control.clearScoreHolder, control.scoreHolder, (req, res) => {
    res.redirect('/user/dashboard')
  })

  router.post('/code', control.insertCode, (req, res) => {
    res.redirect('code');
  });

  router.post('/config', control.updatePasswd, (req, res) => {
    res.redirect('user/config');
  });


  return router;
};
