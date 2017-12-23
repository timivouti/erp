var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var exphbs = require('express-handlebars');
var expressValidator = require('express-validator');
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var mysql = require('mysql2');


mongoose.connect('mongodb://userfordb:ZwLsjAkNBy74wBPV@login-shard-00-00-rdmk1.mongodb.net:27017,login-shard-00-01-rdmk1.mongodb.net:27017,login-shard-00-02-rdmk1.mongodb.net:27017/test?ssl=true&replicaSet=login-shard-0&authSource=admin', {
        useMongoClient: true
});

var db = mongoose.connection;


var routes = require('./routes/index');
var users = require('./routes/users');
var settings = require('./routes/settings');
var sales = require('./routes/sales');

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs({defaultLayout:'layout'}));
app.set('view engine', 'handlebars');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));
app.use(cookieParser());
app.use(methodOverride('_method'));


app.use(methodOverride('X-HTTP-Method-Override'));

app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(expressValidator({
    errorFormatter: function(param, msg, value) {
        var namespace = param.split('.')
        , root = namespace.shift()
        , formParam = root;

        while(namespace.length) {
            formParam += '[' + namespace.shigt() + ']';
        }
        return {
            param : formParam,
            msg : msg,
            value : value
        };
    }
}));

app.use(flash());

app.use(function (req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    next();
});

app.use('/', routes);
app.use('/settings', settings);
app.use('/users', users);
app.use('/sales', sales);

app.set('port', (process.env.PORT || 3000));

app.listen(app.get('port'), function() {
    console.log('Server started on port ' + app.get('port'));
});