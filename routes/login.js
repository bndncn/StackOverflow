const express = require('express');
const CryptoJS = require("crypto-js");
const utils = require('../utils/service-utils');
const User = require('../models/user');

const login = express.Router();

function validPassword(password, hash, key) {
    const bytes = CryptoJS.AES.decrypt(hash, key);
    const decryptedPassword = bytes.toString(CryptoJS.enc.Utf8);

    return decryptedPassword === password;
}

// Endpoint: /login
login.post('/', async function (req, res) {
    // console.log('POST on login');

    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        // console.log('Bad input on login');
        return res.status(400).json(utils.errorJSON('Bad input'));
    }

    const usernameResult = await User.findOne({ username }).exec();

    if (!usernameResult) {
        // console.log(username + ' does not exist.');
        return res.status(400).json(utils.errorJSON(username + ' does not exist.'));
    }

    if (validPassword(password, usernameResult.hash.toString(), usernameResult.key)) {
        if (!usernameResult.verified) {
            // console.log('Please verify your account');
            return res.status(400).json(utils.errorJSON('Please verify your account'));
        }
        // console.log('Logging in');

        // res.cookie('username', username);
        res.cookie('cookieID', usernameResult._id);
        res.cookie('verified', true);
        return res.json(utils.okJSON());
    }
    else {
        console.log('incorrect credentials\n');
        return res.status(400).json(utils.errorJSON('Incorrect credentials'));
    }
});
module.exports = login;
