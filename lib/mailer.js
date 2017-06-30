
// jshint esversion:6

const nodemailer = require('nodemailer');

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
    attachments
}) {
    transporter.sendMail(arguments[1], (err, suc) => {
        if (err) {
            console.log('error');
            callback(false);
        }
        if (suc) {
            console.log('Success!');
            callback(true);
        }
    });
}

module.exports = sendBook;
