const { randomString, hashTogether, log } = require('./Utils');
const { mongoose, User, Session } = require('./MongooseConnection');

function verifySession(sessionId, callback) {
    if (sessionId) {
        Session.findOne({ session_id: sessionId }).populate('user').exec((err, row) => {
            if (err) {
                log('verifySession: MongoDB error', err);
                callback(false);
            } else {
                if (row) {
                    row.save();
                    callback(row.user);
                } else {
                    callback(null);
                }
            }
        });
    } else {
        callback(null);
    }
}

function associateSession(sessionId, user, callback) {
    new Session({ session_id:sessionId, user:user }).save((err) => {
        if (err) {
            log('associateSession: MongoDB error', err);
            callback(false);
        } else {
            callback(true);
        }
    });
}

module.exports = { verifySession:verifySession, associateSession:associateSession };
