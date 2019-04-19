const User = require('../models/user');

function userVerified(req) {
    if (req.cookies.cookieID) {
        User.findById(req.cookies.cookieID)
            .lean()
            .exec()
            .then(user => {
                return true;
            })
            .catch(err => {
                return false;
            })
    } 
    else if (req.body.username) {
        User.findOne({ username: req.body.username })
            .lean()
            .exec()
            .then(user => {
                return true;
            })
            .catch(err => {
                return false;
            })
    } 
    else {
        return false;
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
    return { status: 'error', error: errMsg };
}

module.exports.userVerified = userVerified;
module.exports.okJSON = okJSON;
module.exports.errorJSON = errorJSON;