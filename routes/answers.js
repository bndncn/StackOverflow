const express = require('express');
const validator = require('validator');
const utils = require('../utils/service-utils');

const User = require('../models/user');
const Question = require('../models/question');
const Answer = require('../models/answer');

const answers = express.Router();

// Endpoint: /answers/{id}/upvote
answers.route('/:id/upvote').all(function (req, res, next) {
    // console.log('/answers/{id}/upvote');

    if (!req.params.id || !validator.isMongoId(req.params.id)) {
        // console.log('Bad input on /answers/:id/upvote');
        return res.status(400).json(utils.errorJSON());
    }

    next();
})
    .post(function (req, res) {
        // console.log('POST to /answers/{id}/upvote');

        let upvote = req.body.upvote;
        const cookieID = req.cookies.cookieID;

        if (upvote === undefined) {
            upvote = true;
        }

        if (!cookieID) {
            // console.log('Not logged in');
            return res.status(400).json(utils.errorJSON());
        }

        // if (!req.cookies.verified) {
        //     console.log('Please verify');
        //     return res.status(400).json(utils.errorJSON('Please verify'));
        // }
        utils.ensureUserVerified(res, req);

        Answer.findById(req.params.id)
            .exec()
            .then(answer => {
                if (!answer) {
                    return res.status(404).json(utils.errorJSON());
                }

                User.findById(answer.user_id)
                    .exec()
                    .then(user => {
                        if (!user) {
                            return res.status(404).json(utils.errorJSON());
                        }
                        res.json(utils.okJSON());

                        const voter_user_id = cookieID.toString();
                        const new_vote_type = upvote;
                        const existing_vote = answer.vote_user_ids.get(voter_user_id);
                        let score_delta;
                        let rep_delta;
                        let updated_reputation;

                        // if a new vote
                        if (existing_vote == undefined) {
                            score_delta = new_vote_type == true ? 1 : -1;
                            // console.log('new vote with val = %d', score_delta);
                            rep_delta = score_delta;
                        }
                        else if (existing_vote.vote_type == false) {
                            // console.log('previous downvote');
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
                            // console.log('previous upvote');
                            // previous upvote
                            score_delta = new_vote_type == true ? -1 : -2;
                            rep_delta = score_delta;
                        }
                        // console.log('score_delta = %d old_score = %d', score_delta, answer.score);
                        answer.score += score_delta;

                        // console.log('rep_delta = %d old_rep = %d', rep_delta, user.reputation);
                        updated_reputation = user.reputation + rep_delta;

                        // downvotes that would reduce rep below 1 must be later waived when undone
                        let waive_penalty = false;
                        if (updated_reputation < 1) {
                            // console.log('updated_rep below 1: = %d', updated_reputation);
                            waive_penalty = true;
                            user.reputation = 1;
                        }
                        else {
                            user.reputation = updated_reputation;
                        }
                        // console.log('new user rep = %d', user.reputation);

                        // if toggle, remove like they never voted in the first place
                        if (existing_vote != undefined && existing_vote.vote_type === new_vote_type) {
                            // this is how deleting from map works with Mongoose
                            answer.vote_user_ids.set(voter_user_id, undefined);
                            // console.log('removed vote from voter_user_id = ' + voter_user_id);
                        }
                        else {
                            // either update old or insert new user_id -> vote
                            // console.log('updating vote_user_ids with vote_type= ' + new_vote_type + ' and waive_penalty = ' + waive_penalty);
                            answer.vote_user_ids.set(voter_user_id, {
                                vote_type: new_vote_type,
                                waive_penalty: waive_penalty
                            });
                        }
                        answer.save();
                        user.save();
                        // answer.save(function (err) {
                        // if (err) {
                        // console.log('err saving answer = ' + err);
                        // }
                        // });
                        // user.save(function (err) {
                        // if (err) {
                        // console.log('err saving user = ' + err);
                        // }
                        // });
                    }).catch(err => {
                        // console.log('upvote err = ' + err);
                        return res.status(404).json(utils.errorJSON(err));
                    });

            }).catch(err => {
                // console.log('upvote err = ' + err);
                return res.status(404).json(utils.errorJSON(err));
            });
    });

// Endpoint: /answers/{id}/accept
answers.route('/:id/accept').all(function (req, res, next) {
    // console.log('/answers/{id}/accept');
    next();
})
    .post(function (req, res) {
        // console.log('POST to /answers/{id}/accept');

        Answer.findById(req.params.id)
            .exec()
            .then(answer => {
                if (answer.is_accepted) {
                    return res.status(400).json(utils.errorJSON());
                }

                Question.findById(answer.question_id)
                    .exec()
                    .then(question => {
                        // Should only succeed if logged in user is original asker of associated 
                        if (question.user_id.toString() !== req.cookies.cookieID) {
                            return res.status(400).json(utils.errorJSON());
                        }
                        // failsafe that can probably be removed because of above check in Answer query
                        if (question.accepted_answer_id != null) {
                            return res.status(400).json(utils.errorJSON());
                        }
                        User.findByIdAndUpdate(answer.user_id, {
                            $inc: {
                                reputation: 15
                            }
                        })
                            .exec(function (err) {
                                if (err) {
                                    console.log('err updating rep of user on accept');
                                    return res.status(400).json(utils.errorJSON());
                                }
                            });
                        res.json(utils.okJSON());

                        question.accepted_answer_id = answer._id;
                        answer.is_accepted = true;

                        question.save();
                        answer.save();
                        // question.save(function (err) {
                        //     if (err) {
                        //         console.log('err saving q ' + err);
                        //         return res.status(400).json(utils.errorJSON());
                        //     }
                        // });
                        // answer.save(function (err) {
                        //     if (err) {
                        //         console.log('err saving a ' + err);
                        //         return res.status(400).json(utils.errorJSON());
                        //     }
                        // });
                    })
                    .catch(err => {
                        console.log('err find answer by id = ' + err);
                        return res.status(400).json(utils.errorJSON());
                    });
            })
            .catch(err => {
                console.log('err find question by id = ' + err);
                return res.status(400).json(utils.errorJSON());
            });
    });

module.exports = answers;
