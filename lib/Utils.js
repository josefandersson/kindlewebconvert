const forge = require('node-forge');
const crypto = require('crypto');
const fs = require('fs');

function removeFile(path, callback) {
    fs.unlink(path, err => {
        if (err) {
            log('removeFile: fs error', error);
            callback(false);
        } else {
            callback(true);
        }
    });
}

function copyFile(sourcePath, targetPath, callback) {
    let finished = false;

    let read = fs.createReadStream(sourcePath);
    let write = fs.createWriteStream(targetPath);

    read.on('error', err => {
        done(err);
    });
    write.on('error', err => {
        done(err);
    });
    write.on('close', ex => {
        done();
    });

    read.pipe(write);

    function done(error) {
        if (!finished) {
            if (error) {
                log('copyFile: fs error', error);
                callback(false);
            } else {
                callback(true);
            }
            finished = true;
        }
    }
}

function hashTogether(a, b) {
    const sha256_md = forge.md.sha256.create();
    sha256_md.update(a + b);
    return sha256_md.digest().toHex();
}

function randomString() {
    return crypto.randomBytes(32).toString('hex');
}

function log() {
    console.log.apply(console.log, ['[LOG]', ...arguments]);
}

function mongoSaveCallback(err) {
    if (err) {
        log('mongoSaveCallback: MongoDB error', err);
    }
}

module.exports = { copyFile:copyFile, removeFile:removeFile, hashTogether:hashTogether, randomString:randomString, log:log, mongoSaveCallback:mongoSaveCallback };
