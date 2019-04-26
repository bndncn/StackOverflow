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
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(400).json(utils.errorJSON('Bad input'));
    }

    const usernameResult = await User.findOne({ username }).exec();

    if (!usernameResult) {
        return res.status(400).json(utils.errorJSON(username + ' does not exist.'));
    }

    if (validPassword(password, usernameResult.hash.toString(), usernameResult.key)) {
        if (!usernameResult.verified) {
            return res.status(400).json(utils.errorJSON('Please verify your account'));
        }

        res.cookie('cookieID', usernameResult._id);
        return res.json(utils.okJSON());
    }
    else {
        console.log('incorrect credentials\n');
        return res.status(400).json(utils.errorJSON('Incorrect credentials'));
    }
});
module.exports = login;
