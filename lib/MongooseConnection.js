const path = require('path');
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


const userSchema = new Schema({
    username:     { type: String, unique: true },
    password:     { type: String },
    salt:         { type: String },
    email:        { type: String, unique: true },
    kindle_email: { type: String, unique: true },
    registered:   { type: Boolean },
    format:       { type: String, default:'mobi' },
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


const queuedBookSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'user', required: true },
    name: { type: String, required: true },
    sourcePath: { type: String, required: true },
    failed: { type: Boolean, default: false },
    stage: { type: Number, default: 0 }, //0=uploaded/added to db,1=converted,2=sent to kindle
    done: { type: Date },
    createdAt: { type: Date, default: Date.now },
});

queuedBookSchema.virtual('convertedPath').get(function() {
    let format = 'mobi';
    if (this.user.format) {
        format = this.user.format;
    }
    return path.join(__dirname, '../books', this._id + '.' + format);
});

queuedBookSchema.virtual('asAttachmentObject').get(function() {
    return { filename:this.name + '.mobi', path:this.convertedPath };
});

queuedBookSchema.virtual('isSuccess').get(function() {
    if (this.failed === false && this.done !== null && this.stage === 2) {
        return true;
    } else {
        return false;
    }
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
const QueuedBook = mongoose.model('queuedBook', queuedBookSchema);
const Session = mongoose.model('user_session', sessionSchema);


module.exports = { mongoose:mongoose, User:User, QueuedBook:QueuedBook, Session:Session };
