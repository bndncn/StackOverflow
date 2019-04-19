const express = require('express');
const logout = express.Router();

// Endpoint: /logout
logout.post('/', function (req, res) {
    console.log('POST on logout');

    if (!req.cookies || !req.cookies.cookieID || !req.cookies.username) {
        console.log('bad input on logout');
        return res.json({
            status: "error",
            error: "Missing cookie"
        });
    }

    const requestBody = {
        cookieID: req.cookies.cookieID,
        username: req.cookies.username
    };

    request({
        url: service.createFullURL('logout'),
        method: "POST",
        json: requestBody
    }).then(body => {
        console.log('body: ', body);
        res.clearCookie('cookieID');
        res.clearCookie('username');
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

module.exports = logout;
