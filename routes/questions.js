const express = require('express');
const mongoose = require('mongoose');
const validator = require('validator');
const utils = require('../utils/service-utils');

const User = require('../models/user');
const Question = require('../models/question');
const Answer = require('../models/answer');
const Media = require('../models/media');

const questions = express.Router();

async function checkValidMedia(media, res, item) {
    if (media) {

        for (let i = 0; i < media.length; i++) {
            const mediaResult = await Media.findById(media[i]).exec();

            if (!mediaResult || mediaResult.used) {
                return res.status(400).json(utils.errorJSON('Media id not found / already used'));
            }

            // Add media id to question's or answer's media list
            item.media.push(mongoose.Types.ObjectId(media[i]));
        }
        
        // If all media ids aren't used and exist
        for (let i = 0; i < media.length; i++) {
            // Set media to used
            mediaResult.used = true;
            mediaResult.save();
        }
    }
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

        utils.ensureUserVerified(res, req);

        const title = req.body.title;
        const body = req.body.body;
        const tags = req.body.tags;
        const user_id = req.cookies.cookieID;
        const media = req.body.media;
        const timestamp = utils.getTimeStamp();
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
            upvote_user_ids: {},
            answers: [],
            media: []
        };

        checkValidMedia(media, res, question);
    
        const data = new Question(question);
        data.save();
    
        // Add question reference to question asker
        const usernameResult = await User.findById(user_id).exec();
        usernameResult.questions.push(id);
        usernameResult.save();
    
        return res.json(utils.okJSON('id', id));
    });

// Endpoint: /questions/{id}
questions.route('/:id').all(function (req, res, next) {
    console.log('/questions/{id}');

    if (!req.params.id || !validator.isMongoId(req.params.id)) {
        console.log('bad input on /questions/{id}');
        return res.status(400).json(utils.errorJSON('Bad input'));
    }
    next();
})
    .get(async function (req, res) {
        console.log('GET to /questions/{id}');

        const question = await Question.findById(req.params.id).exec();

        if (!question) {
            return res.status(404).json(utils.errorJSON('Question not found'));
        }

        const cookieID = req.cookies.cookieID;
        const clientIP = req.ip;

        // not a fan of this at all, for sure will refactor this whole function to a real query
        const user_viewed = cookieID &&
            question.view_user_id.indexOf(mongoose.Types.ObjectId(cookieID)) >= 0;
        const ip_viewed = clientIP && question.view_IP.includes(clientIP);

        // if previously viewed
        const already_viewed = user_viewed || ip_viewed;

        console.log('already_viewed = ' + already_viewed);

        question.populate({
            path: 'user_id',
            select: '-_id username reputation',
            options: {
                lean: true
            }
        })
        .execPopulate()
        .then(populatedQuestion => {
            if (!already_viewed) {
                populatedQuestion.view_count += 1;
                if (cookieID) {
                    question.view_user_id.push(cookieID);
                } 
                else {
                    question.view_IP.push(clientIP);
                }
                question.save();
            }

            // return 1 rep if below 1
            const rep = populatedQuestion.user_id.reputation >= 1 ? populatedQuestion.user_id.reputation : 1;
            res.json({
                status: 'OK',
                question: {
                    id: populatedQuestion.id,
                    user: {
                        username: populatedQuestion.user_id.username,
                        reputation: rep
                    },
                    title: populatedQuestion.title,
                    body: populatedQuestion.body,
                    score: populatedQuestion.score,
                    view_count: populatedQuestion.view_count,
                    answer_count: populatedQuestion.answer_count,
                    timestamp: populatedQuestion.timestamp,
                    media: populatedQuestion.media,
                    tags: populatedQuestion.tags,
                    accepted_answer_id: populatedQuestion.accepted_answer_id
                }
            });
        }).catch(err => {
            res.status(404).json(utils.errorJSON(err));
        });
    })
    .delete(async function (req, res) {
        console.log('DELETE to /questions/{id}');

        const user_id = req.cookies.cookieID;
        const question = await Question.findOne({
            _id: req.params.id,
            user_id
        }).exec();
    
        if (!question) {
            console.log('Question not found / question not asked by user');
            return res.sendStatus(404);
        }
        else {
            // Find question asker
            const asker = await User.findById(question.user_id).exec();
    
            // Delete each question's media
            if (question.media.length > 0) {
                question.media.forEach((media_id) => {
                    Media.findByIdAndRemove(media_id).exec();
                });
            }
    
            // Subtract deleted question's score from asker's reputation
            asker.reputation = (asker.reputation - question.score >= 1) ? asker.reputation - question.score : 1;
    
            // Delete question reference from asker's questions
            asker.questions = asker.questions.filter(e => e.toString() !== req.params.id.toString());
            asker.save();   
    
            // For each answer: delete media, subtract score from answerer's reputation, and delete answer
            if (question.answers.length > 0) {
                question.answers.forEach(async (answer_id) => {
                    const answer = await Answer.findById(answer_id).exec();
    
                    // Delete each answer's media
                    if (answer.media.length > 0) {
                        answer.media.forEach((media_id) => {
                            Media.findByIdAndRemove(media_id).exec();
                        });
                    }
    
                    // Find question answerer
                    const answerer = await User.findById(answer.user_id).exec();
    
                    // Subtract deleted answer's score from answerer's reputation
                    answerer.reputation = (answerer.reputation - answer.score >= 1) ? answerer.reputation - answer.score : 1;
    
                    // Delete answer reference from answerer's answers
                    answerer.answers = answerer.answers.filter(e => e.toString() !== answer_id.toString());
    
                    answerer.save();
    
                    // Delete answer
                    Answer.findByIdAndRemove(answer_id).exec();
                });
            }
    
            // Delete question
            Question.findByIdAndRemove(req.params.id).exec();   
            res.sendStatus(200);    
        }});

// Endpoint: /questions/{id}/answers
questions.route('/:id/answers').all(function (req, res, next) {
    console.log('/questions/{id}/answers');
    console.log('id: ' + req.params.id);

    if (!req.params.id || !validator.isMongoId(req.params.id)) {
        console.log('Bad input on /questions/{id}/answers');
        return res.status(400).json(utils.errorJSON('Bad input'));
    }

    next();
})
    .get(function (req, res) {
        console.log('GET to /questions/{id}/answers');

        Question.findById(req.params.id)
            .populate('answers')
            .exec()
            .then(questions => {
                res.json(utils.okJSON('answers', questions.answers));
            }).catch(err => {
                res.status(404).json(utils.errorJSON(err));
            });
    });

// Endpoint: /questions/{id}/upvote
questions.route('/:id/upvote').all(function (req, res, next) {
    console.log('/questions/{id}/upvote');
    console.log('id: ' + req.params.id);

    if (!req.params.id || !validator.isMongoId(req.params.id)) {
        console.log('Bad input on /questions/:id/upvote');
        return res.status(400).json(utils.errorJSON());
    }

    next();
})
    .post(function (req, res) {
        console.log('POST to /questions/{id}/upvote');

        let upvote = req.body.upvote;
        const cookieID = req.cookies.cookieID;

        if (upvote === undefined) {
            upvote = true;
        }

        if (!cookieID) {
            console.log('Not logged in');
            return res.status(400).json(utils.errorJSON());
        }

        utils.ensureUserVerified(res, req);

        Question.findById(req.params.id)
        .exec()
        .then(question => {
            if (!question) {
                return res.status(404).json(utils.errorJSON());
            }
            
            User.findById(question.user_id)
                .exec()
                .then(user => {
                    if (!user) {
                        return res.status(404).json(utils.errorJSON());
                    }
                    const voter_user_id = cookieID.toString();
                    const new_vote_type = upvote;
                    const existing_vote = question.vote_user_ids.get(voter_user_id);
                    let score_delta;
                    let rep_delta;
                    let updated_reputation;

                    // if a new vote
                    if (existing_vote == undefined) {
                        score_delta = new_vote_type == true ? 1 : -1;
                        console.log('new vote with val = %d', score_delta);
                        rep_delta = score_delta;
                    } 
                    else if (existing_vote.vote_type == false) {
                        console.log('previous downvote');
                        // previous downvote
                        score_delta = new_vote_type == true ? 2 : 1;

                        // dont over incr reputation from upvoting a previously waived downvote
                        if (score_delta === 2 && existing_vote.waive_penalty) {
                            rep_delta = 1;
                        } 
                        else {
                            rep_delta = score_delta;
                        }
                    } 
                    else {
                        console.log('previous upvote');
                        // previous upvote
                        score_delta = new_vote_type == true ? -1 : -2;
                        rep_delta = score_delta;
                    }
                    console.log('score_delta = %d old_score = %d', score_delta, question.score);
                    question.score += score_delta;

                    console.log('rep_delta = %d old_rep = %d', rep_delta, user.reputation);
                    updated_reputation = user.reputation + rep_delta;

                    // downvotes that would reduce rep below 1 must be later waived when undone
                    let waive_penalty = false;
                    if (updated_reputation < 1) {
                        console.log('updated_rep below 1: = %d', updated_reputation);
                        waive_penalty = true;
                        user.reputation = 1;
                    } 
                    else {
                        user.reputation = updated_reputation;
                    }
                    console.log('new user rep = %d', user.reputation);

                    // if toggle, remove like they never voted in the first place
                    if (existing_vote != undefined && existing_vote.vote_type === new_vote_type) {
                        // this is how deleting from map works with Mongoose
                        question.vote_user_ids.set(voter_user_id, undefined);
                        console.log('removed vote from voter_user_id = ' + voter_user_id);
                    } 
                    else {
                        // either update old or insert new user_id -> vote
                        console.log('updating vote_user_ids with vote_type= ' + new_vote_type + ' and waive_penalty = ' + waive_penalty);
                        question.vote_user_ids.set(voter_user_id, {
                            vote_type: new_vote_type,
                            waive_penalty: waive_penalty
                        });
                    }
                    question.save(function (err) {
                        if (err) {
                            console.log('err saving question = ' + err);
                        }
                    });
                    user.save(function (err) {
                        if (err) {
                            console.log('err saving user = ' + err);
                        }
                    });
                    return res.json(utils.okJSON());
                }).catch(err => {
                    console.log('upvote err = ' + err);
                    return res.status(404).json(utils.errorJSON());
                });
        
        }).catch(err => {
            console.log('upvote err = ' + err);
            return res.status(404).json(utils.errorJSON());
        });
    });

// Endpoint: /questions/{id}/answers/add
questions.route('/:id/answers/add').all(function (req, res, next) {
    console.log('/questions/{id}/answers/add');
    console.log('id: ' + req.params.id);

    if (!req.params.id || !validator.isMongoId(req.params.id)) {
        console.log('Bad input on /questions/{id}/answers/add');
        return res.status(400).json(utils.errorJSON('Bad input'));
    }

    next();
})
    .post(async function (req, res) {
        console.log('POST to /questions/{id}/answers/add');

        const body = req.body.body;
        const media = req.body.media;
        const user_id = req.cookies.cookieID;
        const username = req.cookies.username;
        const cookieID = req.cookies.cookieID;
        
        if (!cookieID || !username) {
            console.log('Not logged in');
            return res.status(400).json(utils.errorJSON('Not logged in'));
        }

        utils.ensureUserVerified(res, req);

        const question = await Question.findOne({
            _id: req.params.id,
            answers_user_ids: {
                $ne: user_id
            }
        }).exec();
    
        if (!question) {
            console.log('Question not found / user already answered with id: ' + req.params.id);
            return res.status(404).json(utils.errorJSON('Question not found / user already answered with id: ' + req.params.id));
        }
    
        const timestamp = utils.getTimeStamp();
        const id = mongoose.Types.ObjectId();
    
        const answer = {
            _id: id,
            user_id,
            user: username,
            body: body,
            score: 0,
            is_accepted: false,
            timestamp: timestamp,
            media: [],
            upvote_user_ids: {}
        };

        checkValidMedia(media, res, answer);

        const data = new Answer(answer);
        data.save();
    
        question.answers.push(id);
        question.answers_user_ids.push(user_id);
        question.save();
    
        const user = await User.findById(user_id).exec();
    
        user.answers.push(id);
        user.save();
    
        return res.json(utils.okJSON('id', id));
    });

module.exports = questions;

