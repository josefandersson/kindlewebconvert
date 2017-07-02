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

const { log } = require('./lib/Utils');
const { queueBook, getQueuedBooksFor } = require('./lib/BookManager');
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
    hash: 'md5',
    //multiples: true,
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

server.use(['/?','/me/?','/configure/?','/register/?','/login/?','/upload/?'], require('./lib/middleware/loggeduser'));

server.post('/upload', (req, res, next) => {
    queueBook(req.body.books, req.user, success => {
        if (success) {
            res.send('Your book is being converted and sent to your kindle. Current status can be seen on your user page.');
        } else {
            res.send('Something went wrong. Please try again.');
        }
    });
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

server.post('/configure/?', (req, res, next) => {
    if (req.user) {
        req.user.kindle_email = req.body.kindle_email;
        req.user.save(err => {
            if (err) {
                log('MongoDB error', err);
            } else {
                log('Configured user', req.user.username);
            }
            res.redirect('/me');
        });
    } else {
        res.redirect('/login');
    }
});

server.get('/upload/?', (req, res, next) => {
    if (req.user) {
        res.render('upload');
    } else {
        res.redirect('/login');
    }
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
        getQueuedBooksFor(req.user, queuedBooks => {
            res.render('me', { user:req.user, books:queuedBooks });
        });
    } else {
        res.redirect('/login');
    }
});

server.listen(3000, () => {
    log('Web server started.');
});
