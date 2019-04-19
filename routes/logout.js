const express = require('express');
const utils = require('../utils/service-utils');

const logout = express.Router();

// Endpoint: /logout
logout.post('/', async function (req, res) {
    console.log('POST on logout');

    if (!req.cookies || !req.cookies.cookieID || !req.cookies.username) {
        console.log('No cookies on logout');
        return res.status(400).json(utils.errorJSON('Missing cookies'));
    }

    const sessionResult = await User.findById(req.cookies.cookieID).exec();

    if (!sessionResult) {
        console.log('User with this sessionID does not exist.');
        return res.status(400).json(utils.errorJSON('User with this sessionID does not exist.'));
    }

    console.log('User found for cookie');

    res.clearCookie('cookieID');
    res.clearCookie('username');
    return res.json(utils.okJSON());
});

module.exports = logout;
