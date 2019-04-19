const express = require('express');
const answers = express.Router();

// Endpoint: /answers/{id}/upvote
answers.route('/:id/upvote').all(function (req, res, next) {
    console.log('/answers/{id}/upvote');
    next();
})
    .post(function (req, res) {
        console.log('POST to /answers/{id}/upvote');
    });

// Endpoint: /answers/{id}/accept
answers.route('/:id/accept').all(function (req, res, next) {
    console.log('/answers/{id}/accept');
    next();
})
    .post(function (req, res) {
        console.log('POST to /answers/{id}/accept');
    });

module.exports = answers;
