var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var classPanicRouteur = require('./routes/classPanic');

var app = express();

var server = require('http').Server(app);

var io = require("./controllers/sockets.js")(server);
app.io           = io;

var mysql = require('mysql')
 
var optionsSessionMySQL = require('./credentials').optionsSessionMySQL;
 
var sessionStore = new MySQLStore(optionsSessionMySQL);
var sessionMiddleware=session({
    key: 'session_cookie_namezeze',
    secret: 'session_cookie_secretzaza',
    store: sessionStore,
    resave: false,
    saveUninitialized: false
});

app.use(sessionMiddleware);

//io.of("/admin").use(function(socket, next) {
//    sessionMiddleware(socket.request, socket.request.res, next);
//});

io.use(function(socket, next) {
    sessionMiddleware(socket.request, socket.request.res, next);
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use('/', indexRouter);
app.use('/classPanic', usersRouter);
app.use(function (req, res, next) {
    if(req.session) {
	if(req.session.user) {
	    console.log("accepted");
	    next();
	}
	else {
	    console.log("refused");
	    res.redirect('/classPanic');
	}
    }
    else {
	console.log("refused");
	res.redirect('/classPanic');
    }
});
app.use('/classPanic', classPanicRouteur);



app.get("/test-session", function(req,res,next) {
    res.writeHead(200, {"Content-Type": "text/html"});
    res.write('<!DOCTYPE html>'+
	      '<html>'+
	      '    <head>'+
	      '        <meta charset="utf-8" />'+
	      '        <title>Ma page Node.js !</title>'+
	      '    </head>'+ 
	      '    <body>'+
	      '      <form method="post"> <input name="pe"><input type = "submit"></form>Voici un paragraphe <strong>HTML</strong> !</p>');
    if(req.session.name) {
	res.write('Your name is '+req.session.name);
    }
    else {
	res.write('Give your name !');
    }
    res.write('    </body>'+
	      '</html>');
    res.end();
});

app.post("/test-session", function(req,res,next) {
    if(req.body.pe!="") {
	req.session.name=req.body.pe
    }
    res.writeHead(200, {"Content-Type": "text/html"});
    res.write('<!DOCTYPE html>'+
	      '<html>'+
	      '    <head>'+
	      '        <meta charset="utf-8" />'+
	      '        <title>Ma page Node.js !</title>'+
	      '    </head>'+ 
	      '    <body>'+
	      '      <form method="post"> <input name="pe"><input type = "submit"></form>Voici un paragraphe <strong>HTML</strong> !</p>');
    if(req.session.name) {
	res.write('Your name is '+req.session.name);
    }
    else {
	res.write('Give your name !');
	console.log(req.body);
    }
    res.write('    </body>'+
	      '</html>');
    res.end();
});




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
