#!/home/nebula/.nvm/versions/node/v8.1.2/bin/node

// jshint esversion:6

const express = require('express');
const formparse = require('express-formparse');
const logger = require('morgan');
const path = require('path');
const bodyParser = require('body-parser');
const expressSession = require('express-session');
const MongoStore = require('connect-mongo')(expressSession);

const server = express();

const sendBook = require('./lib/mailer');
const { log } = require('./lib/Utils');
const { createUser, getUser, loginUser } = require('./lib/UserManager');

const config = require('./config.json');

server.set('views', path.join(__dirname, 'views'));
server.set('view engine', 'pug');

server.use(logger('dev'));
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: false }));

server.use(express.static(path.join(__dirname, 'public')));

server.use(formparse.parse({
    keepExtensions: true,
    // hash: 'md5',
    multiples: true,
    matching: [ '/upload' ],
}));

server.use(expressSession({
    name: 'expressSession',
    saveUninitialized: true,
    resave: true,
    secret: 'j15cxYqJjiu3Zu9L1L8A',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    store: new MongoStore({
        url: config.mongoDBURL,
        ttl: 7 * 24 * 60 * 60 * 1000,
    })
}));

server.use(['/','/register','/login','/upload'], require('./lib/middleware/loggeduser'));

server.post('/upload', (req, res, next) => {
    if (!req.body.books.length) {
        req.body.books = [ req.body.books ];
    }

    for (let i = 0; i < req.body.books.length; i++) {
        file = req.body.books[i];
        sendBook(()=>{}, {
            to:'josefandman@gmail.com',
            attachments: [
                {
                    filename: file.name,
                    path: file.path
                }
            ]
        });
    }

    res.send('-');
});

server.post('/register/?', (req, res, next) => {
    createUser(req.body.username, req.body.password, success => {
        if (success) {
            log('Created account', req.body.username);
            res.redirect('/login');
        } else {
            log('Could not create account:', req.body.username);
            res.render('register');
        }
    });
});

server.post('/login/?', (req, res, next) => {
    loginUser(req.body.username, req.body.password, req.sessionID, success => {
        if (success) {
            log('Account logged in', req.body.username);
            res.redirect('/me');
        } else {
            log('Failed to login', req.body.username);
            res.render('login');
        }
    });
});

server.get('/register/?', (req, res, next) => {
    if (req.user) {
        res.redirect('/me');
    } else {
        res.render('register');
    }
});

server.get('/login/?', (req, res, next) => {
    if (req.user) {
        res.redirect('/me');
    } else {
        res.render('login');
    }
});

server.use('/$', (req, res, next) => {
    res.render('index');
});

server.use('/me/?', (req, res, next) => {
    if (req.user) {
        res.render('me', { user:req.user });
    } else {
        res.redirect('/login');
    }
});

server.listen(3000, () => {
    log('Web server started.');
});
