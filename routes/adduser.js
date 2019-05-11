const express = require('express');
const crypto = require('crypto');
const CryptoJS = require("crypto-js");
const mongoose = require('mongoose');

const User = require('../models/user');
const utils = require('../utils/service-utils');
const mail = require('../utils/mail');

const adduser = express.Router();

// Endpoint: /adduser
adduser.post('/', async function (req, res) {
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;

    if (!username || !email || !password) {
        return res.status(400).json(utils.errorJSON('Bad input'));
    }

    const credentialsTaken = await User.findOne({
        $or: [
            { username: username },
            { email: email }
        ]
    }).exec();

    if (credentialsTaken) {
        return res.status(400).json(utils.errorJSON('Account credentials already used'));
    }

    const key = crypto.randomBytes(16).toString('hex');
    const hash = CryptoJS.AES.encrypt(req.body.password, key);

    mail.emailKey(email, key);

    const user = {
        _id: mongoose.Types.ObjectId(),
        username: username,
        hash: hash,
        email: email,
        key: key,
        verified: false,
        reputation: 1,
        questions: [],
        answers: []
    };

    const data = new User(user);
    await data.save();
    return res.json(utils.okJSON());
});

module.exports = adduser;