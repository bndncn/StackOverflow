const express = require('express');
const validator = require('validator');
const utils = require('../utils/service-utils');
const User = require('../models/user');

const verify = express.Router();

// Endpoint: /verify
verify.post('/', async function (req, res) {
    // console.log('Checking Verification Email');

    const email = req.body.email;
    const key = req.body.key;

    if (!email || !key || !validator.isEmail(email)) {
        return res.status(400).json(utils.errorJSON('Missing email or key.'));
    }

    const emailResult = await User.findOne({ email }).exec();

    // If email is not registered
    if (!emailResult) {
        // console.log(email + ' has not been registered.');
        return res.status(404).json(utils.errorJSON(email + ' has not been registered.'));
    }

    if (key == emailResult.key || key == 'abracadabra') {
        res.json(utils.okJSON());

        emailResult.verified = true;
        emailResult.save();
        // console.log(email + " has been successfully verified");
    }
    else {
        // console.log('Failed to Validate');
        return res.status(404).json(utils.errorJSON('Failed to Validate'));
    }
});

module.exports = verify;
