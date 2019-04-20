const express = require('express');
const validator = require('validator');
const utils = require('../utils/service-utils');

const User = require('../models/user');
const Question = require('../models/question');
const Answer = require('../models/answer');
const Media = require('../models/media');

const questions = express.Router();

function getTimeStamp() {
    return Math.round((new Date()).getTime() / 1000);
}

// Endpoint: /questions
questions.route('/').all(function (req, res, next) {
    console.log('/questions');
    next();
})
    .get(function (req, res) {
        console.log('GET to /questions');
    })
    .post(function (req, res) {
        console.log('POST to /questions');
    });

// Endpoint: /questions/add
questions.route('/add').all(function (req, res, next) {
    console.log('/questions/add');
    next();
})
    .post(async function (req, res) {
        console.log('POST to /questions/add');

        if (!req.body || !req.body.title || !req.body.body || !req.body.tags) {
            console.log('Bad input on /questions/add');
            return res.status(400).json(utils.errorJSON('Bad input on /questions/add'));
        }
        if (!req.cookies.cookieID) {
            console.log('Not logged in');
            return res.status(400).json(utils.errorJSON('Not logged in'));
        }

        const title = req.body.title;
        const body = req.body.body;
        const tags = req.body.tags;
        const user_id = req.cookies.cookieID;
        const media = req.body.media;

        if (!utils.userVerified(req)) {
            return res.status(400).json(utils.errorJSON('Please verify your account'));
        }

        const timestamp = getTimeStamp();
        const id = mongoose.Types.ObjectId();
        console.log('user = ' + user_id);
    
        const question = {
            _id: id,
            user_id,
            title,
            body,
            tags,
            score: 0,
            timestamp,
            view_count: 0,
            answers: [],
            media: []
        };

        if (media) {

            for (let i = 0; i < media.length; i++) {
                const mediaResult = await Media.findById(media[i]).exec();

                if (!mediaResult || mediaResult.used) {
                    return res.status(400).json(utils.errorJSON('Media id not found / already used'));
                }

                // Add media id to question's media list
                question.media.push(mongoose.Types.ObjectId(media[i]));
            }
            
            // If all media ids aren't used and exist
            for (let i = 0; i < media.length; i++) {
                // Set media to used
                mediaResult.used = true;
                mediaResult.save();
            }
        }
    
        const data = new Question(question);
        data.save();
    
        // Add question reference to question asker
        const usernameResult = await User.findById(user_id).exec();
        usernameResult.questions.push(id);
        usernameResult.save();
    
        res.json(utils.okJSON('id', id));

    });

// Endpoint: /questions/{id}
questions.route('/:id').all(function (req, res, next) {
    console.log('/questions/{id}');
    console.log('id: ' + req.params.id);
    if (!req.params.id || !validator.isMongoId(req.params.id)) {
        console.log('bad input on /questions/{id}');
        return res.json({
            status: "error",
            error: 'bad input'
        });
    }
    next();
})
    .get(function (req, res) {
        console.log('GET to /questions/{id}');

        const requestBody = {
            client_IP: req.ip,
            cookieID: req.cookies.cookieID
        };

        console.log('client_IP = ' + req.ip);

        request({
            url: service.createFullURL('questions/' + req.params.id),
            method: "POST",
            json: requestBody
        }).then(body => {
            console.log('body: ', body);
            res.json({
                status: "OK",
                question: body.question
            });
        }).catch(error => {
            console.log('error: ', error);
            res.json({
                status: "error",
                error: error
            });
        });
    })
    .delete(function (req, res) {
        console.log('DELETE to /questions/{id}');
        
        const requestBody = {
            cookieID: req.cookies.cookieID
        };

        request({
            url: service.createFullURL('questions/' + req.params.id),
            method: "DELETE",
            json: requestBody
        }).then(body => {
            console.log('body: ', body);
            res.sendStatus(200);
        }).catch(error => {
            console.log('error: ', error);
            res.sendStatus(400);
        });
    });

// Endpoint: /questions/{id}/answers
questions.route('/:id/answers').all(function (req, res, next) {
    console.log('/questions/{id}/answers');
    console.log('id: ' + req.params.id);

    if (!req.params.id || !validator.isMongoId(req.params.id)) {
        console.log('bad input on /questions/{id}/answers');
        return res.json({
            status: "error",
            error: 'bad input'
        });
    }

    next();
})
    .get(function (req, res) {
        console.log('GET to /questions/{id}/answers');

        request({
            url: service.createFullURL('questions/' + req.params.id + '/answers'),
            method: "GET",
            json: true
        }).then(body => {
            console.log('body: ', body);
            res.json({
                status: "OK",
                answers: body.answers
            });
        }).catch(error => {
            console.log('error: ', error);
            res.json({
                status: "error",
                error: error
            });
        });
    });

// Endpoint: /questions/{id}/upvote
questions.route('/:id/upvote').all(function (req, res, next) {
    console.log('/questions/{id}/upvote');
    console.log('id: ' + req.params.id);

    if (!req.params.id || !validator.isMongoId(req.params.id)) {
        console.log('bad input on /:id/upvote');
        return res.json({
            status: "error",
            error: 'bad input'
        });
    }

    next();
})
    .post(function (req, res) {
        console.log('POST to /questions/{id}/upvote');
    });

// Endpoint: /questions/{id}/answers/add
questions.route('/:id/answers/add').all(function (req, res, next) {
    console.log('/questions/{id}/answers/add');
    console.log('id: ' + req.params.id);

    if (!req.params.id || !validator.isMongoId(req.params.id)) {
        console.log('bad input on /questions/{id}/answers/add');
        return res.json({
            status: "error",
            error: 'bad input'
        });
    }

    next();
})
    .post(async function (req, res) {
        console.log('POST to /questions/{id}/answers/add');
        if (!req.cookies.cookieID || !req.cookies.username) {
            console.log('not logged in');
            return res.json({
                status: "error",
                error: "Not logged in"
            });
        }


        const verifiedRequestBody = {
            cookieID: req.cookies.cookieID
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
            body: req.body.body,
            media: req.body.media,
            cookieID: req.cookies.cookieID,
            username: req.cookies.username
        };

        request({
            url: service.createFullURL('questions/' + req.params.id + '/answers/add'),
            method: "POST",
            json: requestBody
        }).then(body => {
            console.log('body: ', body);
            console.log('POST question answer success');
            res.json({
                status: "OK",
                id: body.id
            });
        }).catch(error => {
            console.log('error: ', error);
            res.json({
                status: "error",
                error: error
            });
        });
    });

module.exports = questions;

