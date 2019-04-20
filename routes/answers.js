const express = require('express');
const validator = require('validator');
const utils = require('../utils/service-utils');

const User = require('../models/user');
const Answer = require('../models/answer');

const answers = express.Router();

// Endpoint: /answers/{id}/upvote
answers.route('/:id/upvote').all(function (req, res, next) {
    console.log('/answers/{id}/upvote');

    if (!req.params.id || !validator.isMongoId(req.params.id)) {
        console.log('Bad input on /answers/:id/upvote');
        return res.status(400).json(utils.errorJSON());
    }

    next();
})
    .post(function (req, res) {
        console.log('POST to /answers/{id}/upvote');

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
        
        Answer.findById(req.params.id)
            .exec()
            .then(answer => {
                if (!answer) {
                    return res.status(404).json(utils.errorJSON());
                }
                // mongoose map only supports string keys
                const voter_user_id = cookieID.toString();
                const new_vote_type = upvote;
                const existing_vote_type = answer.upvote_user_ids.get(voter_user_id);
                let score_rep_delta;
    
                // account for previous value
                if (existing_vote_type == undefined) {
                    score_rep_delta = new_vote_type == true ? 1 : -1;
                } else {
                    // previous downvote
                    if (existing_vote_type == false) {
                        score_rep_delta = new_vote_type == false ? 1 : 2;
                    } else {
                        score_rep_delta = new_vote_type == true ? -1 : -2;
                    }
                }
                answer.score += score_rep_delta;
    
    
                if (existing_vote_type == new_vote_type) {
                    // if toggle, remove like they never voted in the first place
                    // this is how deleting from map works with Mongoose
                    answer.upvote_user_ids.set(voter_user_id, undefined);
                } else {
                    // either update old or insert new user_id -> vote
                    answer.upvote_user_ids.set(voter_user_id, new_vote_type);
                }
    
                answer.save(function (err) {
                    console.log('err saving a = ' + err);
                });
    
                // update the reputation of the answer poster
                User.findByIdAndUpdate(answer.user_id, {
                    $inc: {
                        reputation: score_rep_delta
                    }
                })
                .exec(function (err, res) {
                    if (err) {
                        console.log('err update user ' + err);
                    }
                });
                return res.json(utils.okJSON());
            })
            .catch(err => {
                console.log('upvote err = ' + err);
                res.status(404).json(utils.errorJSON());
            });
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
