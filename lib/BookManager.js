const fs = require('fs');
const path = require('path');

const { log, copyFile } = require('./Utils');
const { Book } = require('./MongooseConnection');

function addBook(bookFile, user, callback) {
    userHasBook(user, bookFile, hasBook => {
        if (hasBook) {
            log('User', user.username, 'tried to add already existing book.');
            callback(-1);
        } else {
            let ext = /\.([a-zA-Z0-9]*)/.exec(bookFile.path)[1];

            copyFile(bookFile.path, path.join(__dirname, '../books', bookFile.hash + '.' + ext), success => {
                if (success) {
                    log('Put file in book folder as', bookFile.hash + '.' + ext);

                    let book = new Book({ name:bookFile.name, hash:bookFile.hash, extension:ext, user:user });
                    book.save(err => {
                        if (err) {
                            log('addBook: MongoDB error', err);
                            callback(-2);
                        } else {
                            log('Added book', bookFile.name);
                            callback(true);
                        }
                    });

                } else {
                    callback(-2);
                }
            });
        }
    });


}

function userHasBook(user, bookFile, callback) {
    Book.findOne({ user:user, hash:bookFile.hash }).exec((err, book) => {
        if (err) {
            log('userHasBook: MongoDB error', err);
            callback(null);
        } else {
            log(book);
            if (book) {
                callback(true);
            } else {
                callback(false);
            }
        }
    });
}

function getBooksFor(user, callback) {
    Book.find({ user:user }).exec((err, rows) => {
        if (err) {
            log('getBooksFor: MongoDB error', err);
            callback(false);
        } else {
            callback(rows);
        }
    });
}

module.exports = { addBook:addBook, getBooksFor:getBooksFor };
