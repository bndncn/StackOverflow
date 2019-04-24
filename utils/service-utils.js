const User = require('../models/user');

async function ensureUserVerified(res, req) {
    if (req.cookies.cookieID) {
        const userResult = await User.findById(req.cookies.cookieID)
            .lean()
            .exec();
        return userResult != undefined;
    }
    else if (req.body.username) {
        console.log('cookie id missing from user ' + req.body.username);
        const userResult = await User.findOne({ username: req.body.username })
            .lean()
            .exec();
        return userResult != undefined;
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