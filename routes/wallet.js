const express = require('express');
const router = express.Router();

const bodyParse = require('body-parser');
const urlencodedParser = bodyParse.urlencoded({extended : true});

const control = require('./control');


//  ------------------------ Variaveis renderização ------------------------

var wallet = (req, res) => {
  res.render('user/wallet', {
    url      : req.originalUrl,
    title    : 'Peer2you' + req.originalUrl,
    username : req.user.username,
    token    : req.user._id,
    wallets  : req.user.wallets,
  })
};

var myWallet = (req, res) => {
  res.render('user/mywallet', {
    url      : req.originalUrl,
    title    : 'Peer2you' + req.originalUrl,
    username : req.user.username,
    token    : req.user._id,
    wallet   : req.params.walletId,
  })
}

module.exports = function (passport) {
  router.get('*', control.loggedIn, control.isAuth );
  router.get('/', wallet);
  router.get('/:walletId', control.walletInfo, myWallet)

  router.post('/', control.walletHaveOwn, control.walletExist, control.insertWallet, wallet )

  return router;
};
