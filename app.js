var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var materializedPlugin = require('mongoose-materialized');
var models = require('./models')(mongoose, materializedPlugin);
var apiRoutes = require('./routes/api')(models);
var htmlRoutes = require('./routes/html');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
  resave : false,
  saveUninitialized: false,
  secret : process.env.SECRET || 'some_placeholder_secret_for_development_only'
}));
app.use(express.static(path.join(__dirname, 'public')));

// HTML
app.use('/', htmlRoutes);

// API
var baseApiPath = '/api/v1';
app.use(baseApiPath + '/comment', apiRoutes.comment);
app.use(baseApiPath + '/user'   , apiRoutes.user);

// DB
mongoose.connect(process.env.MONGODB_HOST || 'localhost/messageboard');

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
