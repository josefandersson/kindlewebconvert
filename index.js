#!/home/nebula/.nvm/versions/node/v8.1.2/bin/node

// jshint esversion:6

const express = require('express');
const formparse = require('express-formparse');
const logger = require('morgan');
const path = require('path');
const nodemailer = require('nodemailer');

const server = express();

const sendBook = require('./lib/mailer');

server.set('views', path.join(__dirname, 'views'));
server.set('view engine', 'pug');

server.use(logger('dev'));

server.use(express.static(path.join(__dirname, 'public')));

server.use(formparse.parse({
    encoding: 'utf8',
    keepExtensions: true,
    hash: 'md5',
    multiples: true,
    matching: [ '/upload' ],
}));


server.use('/upload', (req, res, next) => {
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

server.use('/$', (req, res, next) => {
    res.render('index');
});

server.listen(3000, () => {
    console.log('Server started.');
});


function sendBook() {

}
