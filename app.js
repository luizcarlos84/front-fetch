var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');

var app = express();

const fontAwesome = '/node_modules/@fortawesome/fontawesome-free';
const bootstrap = '/node_modules/bootstrap/dist';
const jQuery = '/node_modules/jquery/dist';
const popper = '/node_modules/popper.js/dist';

app.set('views', './views');
app.set('view engine', 'pug');

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

// Routes
app.use('/', indexRouter);

// Manter no fim Manipulação de erros - Error Handle
app.use((req, res, next) => {
  res.status(404);

  res.render('error/404');
});

app.use((err, req, res, next) => {
  res.status(500);

  res.render('error/500', {error : err,});
});


module.exports = app;
