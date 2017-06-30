// Populates request with a user object if logged in

const { verifySession } = require('../SessionManager');

function middleware(req, res, next) {
    verifySession(req.sessionID, (user) => {
        req.user = user;
        next();
    });
}

module.exports = middleware;
