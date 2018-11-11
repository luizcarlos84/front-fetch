const localStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const userdb = require('../db/userdb');

module.exports = function (passport) {

  passport.serializeUser(function(user, done){
    console.log('serializeUser');
    done(null,user._id);
  });

  passport.deserializeUser(function(id, done){
      userdb.findUserById(id, function(err,user){
        console.log('deserializeUser');
          done(err, user);
      });
  });

  passport.use(
    new localStrategy({
      usernameField: 'InputUserName',
      passwordField: 'InputPassword'
    }, function(username, password, done) {
      console.log(username,password);
      userdb.findUser(username, function(err, user){
        if (err) { return done(err) }

        // usuário inexistente
        if (!user) { return done(null, false) }

        // comparando as senhas
        bcrypt.compare(password, user.passwd, (err, isValid) => {
          if (err) { return done(err) }
          if (!isValid) { return done(null, false) }
          return done(null, user)
        })
      })
    }
  ));
}
