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
    })
    .post(function (req, res) {
    });

// Endpoint: /user/{username}
user.route('/:username').all(function (req, res, next) {
    next();
})
    .get(async function (req, res) {
        const username = req.params.username;

        const user = await User.findOne({ username }).exec();

        if (!user) {
            return res.status(404).json(utils.errorJSON());
        }
        else {
            return res.json(utils.okJSON('user', user));
        }
    });

// Endpoint: /user/{username}/questions
user.route('/:username/questions').all(function (req, res, next) {
    next();
})
    .get(async function (req, res) {
        const username = req.params.username;

        const user = await User.findOne({ username }).exec();

        if (!user) {
            return res.status(404).json(utils.errorJSON());
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
        const username = req.params.username;

        const user = await User.findOne({ username }).exec();

        if (!user) {
            return res.status(404).json(utils.errorJSON());
        }
        else {
            return res.json(utils.okJSON('answers', user.answers));
        }
    });

module.exports = user;
