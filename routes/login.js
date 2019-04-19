const express = require('express');
const login = express.Router();

// Endpoint: /login
login.post('/', async function (req, res) {
    console.log('POST on login');

    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        console.log('bad input on login');
        return res.json({
            status: "error",
            error: 'bad input'
        });
    }

    const verifiedRequestBody = {
        username: username
    };


    /* make sure user verified, this is a temporary hack for MS1 til I have time to learn/implement real sessions */
    const verified = await request({
        url: service.createFullURL('verified'),
        method: "POST",
        json: verifiedRequestBody
    }).then(body => {
        console.log('body: ', body);
        return body.verified;
    }).catch(error => {
        console.log('error: ', error);
    });

    if (!verified) {
        return res.json({
            status: "error",
            error: 'please verify your account'
        });
    }

    const requestBody = {
        username: username,
        password: password
    };

    request({
        url: service.createFullURL('login'),
        method: "POST",
        json: requestBody
    }).then(body => {
        console.log('body: ', body);
        res.cookie('cookieID', body.cookieID);
        res.cookie('username', username);
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
module.exports = login;
