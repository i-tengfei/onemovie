var CONFIG = global.CONFIG = require('./config');
if(process.env.NODE_ENV){
    require('onetool').mix(CONFIG, require('./config.' + process.env.NODE_ENV));
}

require('./database');

var express = require('express'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    passport = require('passport'),
    session = require('express-session'),
    MongoStore = require('connect-mongo')(session),
    OneUserStrategy = require('passport-oneuser').Strategy;

var SESSION = CONFIG.SESSION,
    store = SESSION.PERSISTENCE ?
    new MongoStore({url: SESSION.DATABASE, collection: SESSION.COLLECTION}) :
    new session.MemoryStore({reapInterval: 5 * 60 * 1000});

var app = express();

app.listen(CONFIG.PORT);
app.engine('jade', require('jade').__express);

app.use('/public/lib', express.static(__dirname + '/bower_components'));
app.use('/public', express.static(__dirname + '/public'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(session({store: store, secret: SESSION.SECRET, resave: true, saveUninitialized: true}));
app.use(passport.initialize());
app.use(passport.session());

require('./router')(app, passport);

app.get('*', function(req, res){
    res.status(404).end();
});

passport.serializeUser(function(user, done) {
    done(null, user);
});
passport.deserializeUser(function(user, done) {
    done(null, user);
});
var AUTH = CONFIG.AUTH;
passport.use(new OneUserStrategy({
        clientID: AUTH.CLIENT_ID,
        clientSecret: AUTH.CLIENT_SECRET,
        authorizationURL: AUTH.AUTHORIZATION_URL,
        tokenURL: AUTH.TOKEN_URL,
        userProfileURL: AUTH.USER_PROFILE_URL,
        callbackURL: AUTH.CALLBACK_URL,
        passReqToCallback: true
    }, function(req, accessToken, refreshToken, profile, done) {
        profile.token = accessToken;
        done(null, profile);
    }
));
