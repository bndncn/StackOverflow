const express = require('express');
const utils = require('../utils/service-utils');

const search = express.Router();

function getTimeStamp() {
    return Math.round((new Date()).getTime() / 1000);
}

// Endpoint: /search
search.post('/', function (req, res) {
    console.log('Searching');

    /* validate timestamp */
    let timestamp = req.body.timestamp;
    if (!req.body.timestamp) {
        timestamp = getTimeStamp();
    } else if (req.body.timestamp < 0) {
        // maybe edge case of timestamp greater than current time.
        return res.json({
            status: "error",
            error: 'negative timestamp'
        });
    } else {
	console.log('timestamp given = ' + timestamp);
    }

    /* validate limit */
    let limit = req.body.limit;
    if (!req.body.limit) {
        limit = 25;
    } else if (req.body.limit < 0 || req.body.limit > 100) {
        return res.json({
            status: "error",
            error: 'bad limit'
        });
    }

    /* validate accepted */
    let accepted = req.body.accepted;
    if (!req.body.accepted) {
        accepted = false;
    }

    const requestBody = {
        timestamp,
        limit,
        accepted
    };

    if (req.body.q) {
        requestBody.q = req.body.q;
    }

    request({
        url: service.createFullURL('search'),
        method: "POST",
        json: requestBody
    }).then(body => {
        console.log('search success');
        res.json({
            status: "OK",
            questions: body.questions
        });
    }).catch(error => {
        console.log('error: ', error);
        res.json({
            status: "error",
            error: error
        });
    });
});

module.exports = search;


