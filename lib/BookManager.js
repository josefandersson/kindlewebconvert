const fs = require('fs');
const path = require('path');
const exec = require('child_process').exec;

const { log, mongoSaveCallback, removeFile } = require('./Utils');
const { QueuedBook } = require('./MongooseConnection');
const { sendBook } = require('./BookMailer');

function convertBook(sourcePath, targetPath, callback) {
    exec(`ebook-convert ${sourcePath} ${targetPath}`, (err, stdout, stderr) => {
        if (err) {
            log('convertBook: cmd error', err);
            callback(false);
        } else {
            if (stdout.indexOf('saved') > -1) {
                log('Converted book to', targetPath);
                callback(true);
            } else {
                log('convertBook: ebook-convert could not convert book to', targetPath);
                callback(false);
            }
        }
    });
}

function getQueuedBooksFor(user, callback) {
    QueuedBook.find({ user:user }).sort('-createdAt').exec((err, rows) => {
        if (err) {
            log('getQueuedBooksFor: MongoDB error', err);
            callback(false);
        } else {
            callback(rows);
        }
    });
}

// put book in queue for convert and mailing
function queueBook(bookFile, user, callback) {
    let [,name] = /^(.*)\.[a-zA-Z0-9]*$/.exec(bookFile.name);

    let queuedBook = new QueuedBook({ user:user, name:name, sourcePath:bookFile.path });
    queuedBook.save(err => {
        if (err) {
            log('queueBook: MongoDB error', err);
            callback(false);
        } else {
            log('Starting convertion on book for user', user.username);
            callback(true);

            convertBook(queuedBook.sourcePath, queuedBook.convertedPath, success => {
                if (success) {
                    log('Converted book for user', user.username);

                    sendBook({ to:user.kindle_email, attachments:[queuedBook.asAttachmentObject] }, success => {
                        if (success) {
                            log('Sent book to user', user.username);

                            removeFile(queueBook.convertedPath, success => {
                                if (success) {
                                    log('Removed a processed book file for user', user.username);
                                } else {
                                    log('Failed to remove a book file.');
                                }
                            });
                        } else {
                            log('Failed to send book to user', user.username);
                            queuedBook.failed = true;
                        }
                        queuedBook.stage = 2;
                        queuedBook.done = new Date();
                        queuedBook.save(mongoSaveCallback);
                    });
                } else {
                    log('Failed to convert book for user', user.username);
                    queuedBook.failed = true;
                }
                queuedBook.stage = 1;
                queuedBook.save(mongoSaveCallback);
            });

        }
    });
}

module.exports = { convertBook:convertBook, queueBook:queueBook, getQueuedBooksFor:getQueuedBooksFor };
