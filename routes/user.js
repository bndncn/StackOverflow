const express = require('express');
const user = express.Router();

// Endpoint: /user
user.route('/').all(function (req, res, next) {
    console.log('/user');
    next();
})
    .get(function (req, res) {
        console.log('GET to /user');
    })
    .post(function (req, res) {
        console.log('POST to /user');
    });

// Endpoint: /user/{username}
user.route('/:username').all(function (req, res, next) {
    console.log('/user/{username}');
    next();
})
    .get(function (req, res) {
        console.log('GET to /user/{username}');
        const username = req.params.username;
        
        request({
            url: service.createFullURL('user/' + username),
            method: "GET",
            json: true
        }).then(body => {
            console.log('Getting user data');
            res.json({
                status: "OK",
                user: body.user
            });
        }).catch(error => {
            console.log('error: ', error);
            res.json({
                status: "error",
            });
        });
    });

// Endpoint: /user/{username}/questions
user.route('/:username/questions').all(function (req, res, next) {
    console.log('/user/{username}/questions');
    next();
})
    .get(function (req, res) {
        console.log('GET to /user/{username}/questions');
        const username = req.params.username;
        
        request({
            url: service.createFullURL('user/' + username + '/questions'),
            method: "GET",
            json: true
        }).then(body => {
            console.log('Getting user data');
            res.json({
                status: "OK",
                questions: body.questions
            });
        }).catch(error => {
            console.log('error: ', error);
            res.json({
                status: "error",
            });
        });
    });

// Endpoint: /user/{username}/answers
user.route('/:username/answers').all(function (req, res, next) {
    console.log('/user/{username}/answers');
    next();
})
    .get(function (req, res) {
        console.log('GET to /user/{username}/answers');
        const username = req.params.username;
        
        request({
            url: service.createFullURL('user/' + username + '/answers'),
            method: "GET",
            json: true
        }).then(body => {
            console.log('Getting user data');
            res.json({
                status: "OK",
                answers: body.answers
            });
        }).catch(error => {
            console.log('error: ', error);
            res.json({
                status: "error",
            });
        });
    });

module.exports = user;
