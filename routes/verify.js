const express = require('express');
const validator = require('validator');
const verify = express.Router();

// Endpoint: /verify
verify.post('/', function (req, res) {
    console.log('Checking Verification Email');

    if (!req.body.email || !req.body.key || !validator.isEmail(req.body.email)) {
        return res.json({
            status: "error",
            error: 'missing email or key'
        });
    }

    const email = req.body.email;
    const key = req.body.key;

    const requestBody = {
        email,
        key
    };

    request({
        url: service.createFullURL('verify'),
        method: "POST",
        json: requestBody
    }).then(body => {
        console.log('body:', body);
        res.json({
            status: "OK"
        });
    }).catch(error => {
        console.log('error: ', error);
        res.json({
            status: "error",
            error: error
        });
    });
});

module.exports = verify;
