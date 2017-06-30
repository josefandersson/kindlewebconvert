const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const { log, hashTogether } = require('./Utils');
const config = require('../config.json');

mongoose.connect(config.mongoDBURL, err => {
    if (err) {
        log('Could not connect to MongoDB', err);
    } else {
        log('Connected to MongoDB.');
    }
});

/*
username
password
salt

mail
kindle_mail
*/
const userSchema = new Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    salt:     { type: String, required: true },
});

userSchema.virtual('matchingPassword').get(function() {
    return plainPassword => {
        if (this.password === hashTogether(plainPassword, this.salt)) {
            return true;
        } else {
            return false;
        }
    };
});


const sessionSchema = new Schema({
    session_id:  { type: String, unique: true },
    user:        { type: Schema.Types.ObjectId, ref: 'user' },
    last_active: { type: Date, default: Date.now, index: { expires: 60 * 60 * 24 * 2 }},
});

sessionSchema.pre("save", function(next) {
    this.last_active = new Date();
    next();
});


const User = mongoose.model('user', userSchema);
const Session = mongoose.model('user_session', sessionSchema);


module.exports = { mongoose:mongoose, User:User, Session:Session };
