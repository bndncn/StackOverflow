const express = require('express');
const User = require('../models/user');
const utils = require('../utils/service-utils');

const logout = express.Router();

// Endpoint: /logout
logout.post('/', async function (req, res) {
    console.log('\n\nPOST on logout');

    if (!req.cookies || !req.cookies.cookieID) {
        console.log('No cookies on logout');
        return res.status(400).json(utils.errorJSON('Missing cookies'));
    }

    const sessionResult = await User.findById(req.cookies.cookieID).exec();

    if (!sessionResult) {
        console.log('User with this sessionID does not exist.');
        return res.status(400).json(utils.errorJSON('User with this sessionID does not exist.'));
    }

    console.log(res.cookie.cookieInfo);
    console.log(JSON.parse(res.cookie.cookieInfo).username);
    console.log(JSON.parse(res.cookie.cookieInfo).cookieID);
    console.log(JSON.parse(res.cookie.cookieInfo).verified);
    res.clearCookie('cookieInfo');

    return res.json(utils.okJSON());
});

module.exports = logout;
