const express = require('express');
const multer = require('multer');
const addmedia = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Endpoint: /addmedia
addmedia.post('/', function (req, res) {
    console.log('Adding media file');

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
        return res.status(400).json({
            status: "error",
            error: 'please verify your account'
        });
    }
});

module.exports = addmedia;

