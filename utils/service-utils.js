const User = require('../models/user');

async function ensureUserVerified(res, req) {
    if (req.cookies.cookieID) {
        User.findById(req.cookies.cookieID)
            .lean()
            .exec()
            .then(user => {
                // Do nothing
                return user != undefined;
            })
            .catch(err => {
                return res.status(400).json(errorJSON('Please verify your account'));
            })
    }
    else if (req.body.username) {
        User.findOne({ username: req.body.username })
            .lean()
            .exec()
            .then(user => {
                // Do nothing
                return user != undefined;
            })
            .catch(err => {
                return res.status(400).json(errorJSON('Please verify your account'));
            })
    }
    else {
        return res.status(400).json(errorJSON('Please verify your account'));
    }
}

function getTimeStamp() {
    return Math.round((new Date()).getTime() / 1000);
}

function okJSON(...args) {
    const baseJSON = { status: 'OK' };

    let i = 0;
    while (i < args.length) {
        const key = args[i++];
        const val = args[i++];
        baseJSON[key] = val;
    }

    return baseJSON;
}

function errorJSON(errMsg) {
    if (errMsg === undefined)
        return { status: 'error' };
    else
        return { status: 'error', error: errMsg };
}

module.exports.ensureUserVerified = ensureUserVerified;
module.exports.getTimeStamp = getTimeStamp;
module.exports.okJSON = okJSON;
module.exports.errorJSON = errorJSON;