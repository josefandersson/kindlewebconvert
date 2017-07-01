const config = require('../config.json');
const { randomString, hashTogether, log } = require('./Utils');
const { mongoose, User, Session } = require('./MongooseConnection');
const { associateSession } = require('./SessionManager');

function createUser(username, password, callback) {
    let salt = randomString();
    let user = new User({ username:username, password:hashTogether(password, salt), salt:salt });
    user.save(function(err) {
        if (err) {
            if (err.code !== 11000) {
                log('createUser: MongoDB error', err);
            }
            callback(false);
        } else {
            callback(true);
        }
    });
}

function getUser(userId, callback) {
    User.findOne({ _id:userId }).exec((err, user) => {
        if (err) {
            log('getUser: MongoDB error', err);
            callback(false);
        } else {
            callback(user);
        }
    });
}

function loginUser(username, password, sessionId, callback) {
    User.findOne({ username:username }).exec((err, user) => {
        if (err) {
            log('loginUser: MongoDB error', err);
        } else {
            if (user) {
                if (user.matchingPassword(password)) {
                    associateSession(sessionId, user, success => {
                        callback(success);
                    });
                } else {
                    callback(false);
                }
            } else {
                callback(false);
            }
        }
    });
}

module.exports = { createUser:createUser, getUser:getUser, loginUser:loginUser };
