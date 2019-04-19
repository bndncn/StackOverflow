const User = require('../models/user');

function checkVerified(req) {
    if (req.body.cookieID) {
        User.findById(req.body.cookieID)
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

module.exports.checkVerified = checkVerified;