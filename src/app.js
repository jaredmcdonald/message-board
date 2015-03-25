let express = require('express')
,   path = require('path')
,   favicon = require('serve-favicon')
,   logger = require('morgan')
,   cookieParser = require('cookie-parser')
,   compression = require('compression')
,   cachify = require('connect-cachify')
,   session = require('express-session')
,   bodyParser = require('body-parser')
,   mongoose = require('mongoose')
,   materializedPlugin = require('mongoose-materialized')
,   models = require('./models')(mongoose, materializedPlugin)
,   controllers = require('./controllers')(models)
,   apiRoutes = require('./routes/api')(controllers)
,   htmlRoutes = require('./routes/html')

,   app = express();

// view engine setup
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(compression());
app.use(cachify.setup({}, {
    production : app.get('env') !== 'development',
    root: path.join(__dirname, '../public')
}));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
  resave : false,
  saveUninitialized: false,
  secret : process.env.SECRET || 'some_placeholder_secret_for_development_only'
}));
app.use(express.static(path.join(__dirname, '../public')));

// HTML
app.use('/', htmlRoutes);

// API
const baseApiPath = '/api/v1';
app.use(`${baseApiPath}/comment`, apiRoutes.comment);
app.use(`${baseApiPath}/user`   , apiRoutes.user);

// DB
mongoose.connect(process.env.MONGODB_URI || process.env.MONGOLAB_URI || 'localhost/messageboard');

// catch 404 and forward to error handler
app.use((req, res, next) => {
    let err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use((err, req, res, next) => {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;
