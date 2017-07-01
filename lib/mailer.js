const nodemailer = require('nodemailer');

const { log } = require('./Utils');

const transporter = nodemailer.createTransport({
    host: 'mail.gmx.com',
    port: 587,
    secure: false,
    auth: {
        user: 'stdoutkindle@gmx.com',
        pass: 'MyPass123!'
    }
});

function sendBook(callback, {
    from='KindleWebconvert<stdoutkindle@gmx.com>',
    to,
    subject='Ebook from KindleWebconvert',
    text='Attached is an ebook uploaded to KindleWebconvert.',
    attachments,
}) {
    transporter.sendMail(arguments[1], (err, suc) => {
        if (err) {
            log('sendBook: nodemailer error', err);
            callback(false);
        }
        if (suc) {
            log('Sent book to', to);
            callback(true);
        }
    });
}

module.exports = sendBook;
