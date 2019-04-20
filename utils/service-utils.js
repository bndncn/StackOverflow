const User = require('../models/user');

function ensureUserVerified(res, req) {
    if (req.cookies.cookieID) {
        User.findById(req.cookies.cookieID)
            .lean()
            .exec()
            .then(user => {
                // Do nothing
            })
            .catch(err => {
                return res.status(400).json(utils.errorJSON('Please verify your account'));
            })
    } 
    else if (req.body.username) {
        User.findOne({ username: req.body.username })
            .lean()
            .exec()
            .then(user => {
                // Do nothing
            })
            .catch(err => {
                return res.status(400).json(utils.errorJSON('Please verify your account'));
            })
    } 
    else {
        return res.status(400).json(utils.errorJSON('Please verify your account'));
    }
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
module.exports.okJSON = okJSON;
module.exports.errorJSON = errorJSON;