const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const logger = require('morgan');

const session = require('express-session')
const passport = require('passport');


// Express Start
var app = express();

// Variáveis estaticas
const fontAwesome = '/node_modules/@fortawesome/fontawesome-free';
const bootstrap = '/node_modules/bootstrap/dist';
const jQuery = '/node_modules/jquery/dist';
const popper = '/node_modules/popper.js/dist';

// Configuração a localização das views do pug
app.set('views', './views');
app.set('view engine', 'pug');


// app.use
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Arquivos estáticos - Statics
app.use(express.static(path.join(__dirname, 'public'))); // arquivos como imagens, js e css customizados
app.use( '/jquery', express.static(__dirname + jQuery)); // redirect JS jQuery
app.use( '/popper', express.static(__dirname + popper)); // redirect JS popper
app.use( '/js', express.static(__dirname + bootstrap + '/js')); // redirect bootstrap JS
app.use( '/js', express.static(__dirname + fontAwesome + '/js')); // redirect JS fontawesome
app.use( '/css', express.static(__dirname + bootstrap + '/css')); // redirect CSS bootstrap
app.use( '/css', express.static(__dirname + fontAwesome + '/css')); // redirect CSS fontawesome


// passport
require('./routes/passport')(passport);
app.use(session({
  secret : '123',//configure um segredo seu aqui
  maxAge : 60000, //60000 == 1 minuto
  expires: new Date(Date.now() + 60000),
  resave : false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// Router
var indexRouter = require('./routes/index')(passport);
var userRouter = require('./routes/user')(passport);

app.use('/', indexRouter);
app.use('/user', userRouter);

// Manter no fim Manipulação de erros - Error Handler
app.use((req, res, next) => {
  res.status(404);

  res.render('error/404');
});

app.use((err, req, res, next) => {
  res.status(500);

  res.render('error/500', {error : err,});
});


module.exports = app;
