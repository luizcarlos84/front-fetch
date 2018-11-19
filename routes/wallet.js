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

  control.walletInfo(req, res, (doc) => {
    res.render('user/mywallet', {
      url      : req.originalUrl,
      title    : 'Peer2you' + req.originalUrl,
      username : req.user.username,
      token    : req.user._id,
      wallet   : req.params.walletId,
      hash160  : doc.hash160,
      confirmed: doc.confirmed,
      orphan   : doc.orphan,
      miner    : doc.miner,
      pool     : doc.pool,
      n_tx     : doc.n_tx,
      txs      : doc.txs,
    })
  })
}

module.exports = function (passport) {
  router.get('*', control.loggedIn, control.isAuth );
  router.get('/', wallet);
  router.get('/:walletId', myWallet)

  router.post('/', control.walletHaveOwn, control.insertWallet, wallet )

  return router;
};
