var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const mongoose = require('mongoose');
const session = require('express-session');
var passport = require('passport');
var crypto = require('crypto');
const connection = require('./config/database');
const fileUpload = require('express-fileupload');

const Config = connection.models.Config;
var indexRouter = require('./routes/index');
var adminRouter = require('./routes/admin');


const MongoStore = require('connect-mongo')(session);

require('./config/passport');
require('dotenv').config();


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const sessionStore = new MongoStore({ mongooseConnection: connection, collection: 'sessions' })

app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  store: sessionStore,
  cookie: {
      maxAge: 1000 * 60 * 60 * 24 // Equals 1 day (1 day * 24 hr/1 day * 60 min/1 hr * 60 sec/1 min * 1000 ms / 1 sec)
      
  }
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(fileUpload());
app.use(async function(req, res, next) {
  res.locals.config = await Config.findOne()
  next();
});
app.use('/', indexRouter);
app.use('/admin', adminRouter);




// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
