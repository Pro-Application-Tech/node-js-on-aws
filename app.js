// app.js

// require('dotenv').config() must always be the first line in app.js so that the environment variables
// are loaded before anything else
require('dotenv').config();
require('./database/connect').connect();

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var authenticationRouter = require('./routes/authentication');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const decodeJWTMiddleware = require('./middleware/decodeJWTMiddleware.js');

app.use('/', indexRouter);
// We only need to apply decodeJWTMiddleware for the /users router.
// If we need to only apply it to an individual route from a router, then decodeJWTMiddleware needs to be placed
// before "(req, res) => {" in the route definition
app.use('/users', decodeJWTMiddleware, usersRouter);
app.use('/authentication', authenticationRouter);

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
