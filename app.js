var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);

var allVisibleRouter = require('./routes/allVisible');
var userVisibleRouter = require('./routes/userVisible');
var adminVisibleRouter = require('./routes/adminVisible');

var config = require('./configuration');

var app = express();

var server = require('http').Server(app);


var mysql = require('mysql')
 
var optionsMySQL = require('./credentials').optionsMySQL;
 
var sessionStore = new MySQLStore(optionsMySQL);
var sessionMiddleware=session({
    key: 'session_cookie_namezeze',
    secret: 'session_cookie_secretzaza',
    store: sessionStore,
    resave: false,
    saveUninitialized: false
});

app.use(sessionMiddleware);

var io = require("./controllers/sockets.js")(server, sessionMiddleware);
app.io = io;


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    req.msgs = [];
    next();
});

app.use(config.PATH, allVisibleRouter);

app.use(config.PATH, userVisibleRouter);

// app.use(config.PATH, adminVisibleRouter);


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
