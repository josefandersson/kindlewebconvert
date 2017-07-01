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
    username:     { type: String, required: true, unique: true },
    password:     { type: String, required: true },
    salt:         { type: String, required: true },
    email:        { type: String },
    kindle_email: { type: String },
    last_sent:    { type: Date },
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


const bookSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'user', required: true },
    name: { type: String, required: true },
    extension: { type: String, required: true },
    hash: { type: String, required: true },
    sent: { type: Number, default: 0 },
});

bookSchema.virtual('filePath').get(function() {
    return path.join(__dirname, 'books', this.hash + '.' + this.extension);
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
const Book = mongoose.model('book', bookSchema);
const Session = mongoose.model('user_session', sessionSchema);


module.exports = { mongoose:mongoose, User:User, Book:Book, Session:Session };
