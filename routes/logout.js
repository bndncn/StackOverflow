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

<<<<<<< HEAD

    console.log('cookieID before clearCookie ' + req.cookies.cookieID);
    res.clearCookie('cookieID');
    console.log('cookieID after clearCookie ' + req.cookies.cookieID);

    // console.log('username before clearCookie ' + req.cookies.username);
    // res.clearCookie('username');
    // console.log('username after clearCookie ' + req.cookies.username);

    // console.log('verified before clearCookie ' + req.cookies.verified);
    // res.clearCookie('verified');
    // console.log('verified after clearCookie ' + req.cookies.verified);
=======
    console.log(res.cookie.cookieInfo);
    console.log(JSON.parse(res.cookie.cookieInfo).username);
    console.log(JSON.parse(res.cookie.cookieInfo).cookieID);
    console.log(JSON.parse(res.cookie.cookieInfo).verified);
    res.clearCookie('cookieInfo');
>>>>>>> 766452af962da2c4972dd9af1755c619a60a5138

    return res.json(utils.okJSON());
});

module.exports = logout;
