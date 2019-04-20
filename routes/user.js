const express = require('express');
const utils = require('../utils/service-utils');
const User = require('../models/user');

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
    .get(async function (req, res) {
        console.log('GET to /user/{username}');
        const username = req.params.username;

        const user = await User.findOne({ username }).exec();
    
        if (!user) {
            console.log(username + ' does not exist.');
            return res.status(404).json(utils.errorJSON(username + ' does not exist.'));
        }
        else {
            return res.json(utils.okJSON('user', user));
        }
    });

// Endpoint: /user/{username}/questions
user.route('/:username/questions').all(function (req, res, next) {
    console.log('/user/{username}/questions');
    next();
})
    .get(async function (req, res) {
        console.log('GET to /user/{username}/questions');
        const username = req.params.username;

        const user = await User.findOne({ username }).exec();
    
        if (!user) {
            console.log(username + ' does not exist.');
            return res.status(404).json(utils.errorJSON(username + ' does not exist.'));
        }
        else {
            return res.json(utils.okJSON('questions', user.questions));
        }
    });

// Endpoint: /user/{username}/answers
user.route('/:username/answers').all(function (req, res, next) {
    console.log('/user/{username}/answers');
    next();
})
    .get(async function (req, res) {
        console.log('GET to /user/{username}/answers');
        const username = req.params.username;

        const user = await User.findOne({ username }).exec();
    
        if (!user) {
            console.log(username + ' does not exist.');
            return res.status(404).json(utils.errorJSON(username + ' does not exist.'));
        }
        else {
            return res.json(utils.okJSON('answers', user.answers));
        }
    });

module.exports = user;
