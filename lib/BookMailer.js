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

function sendBook(opt, callback) {
    transporter.sendMail({
        from: opt.from ? opt.from : 'KindleWebConvert<stdoutkindle@gmx.com>',
        to: opt.to,
        subject: opt.subject ? opt.from : 'Ebook from KindleWebconvert',
        text: opt.text ? opt.text : 'Attached is an e-book uploaded to KindleWebConvert.\n\nIf this e-mail was not meant for you, simply ignore this e-mail and it\'s content.',
        attachments: opt.attachments,
    }, (err, success) => {
        if (err) {
            log('sendBook: nodemailer error', err);
            callback(false);
        }
        if (success) {
            log('Sent book to', opt.to);
            callback(true);
        }
    });
}

module.exports = { sendBook:sendBook };
