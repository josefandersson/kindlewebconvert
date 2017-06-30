const forge = require('node-forge');
const crypto = require('crypto');

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

module.exports = { hashTogether:hashTogether, randomString:randomString, log:log };
