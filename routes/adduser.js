const express = require('express');
const adduser = express.Router();

// Endpoint: /adduser
adduser.post('/', function (req, res) {
    console.log('POST on adduser');
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;

    if (!username || !email || !password) {
        console.log('bad input on addUser');
        return res.json({
            status: "error",
            error: 'bad input'
        });
    }

    const requestBody = {
        username: username,
        email: email,
        password: password
    };

    request({
        url: service.createFullURL('adduser'),
        method: "POST",
        json: requestBody
    }).then(body => {
        console.log('body: ', body);
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


module.exports = adduser;
