const express = require('express');
const mongoose = require('mongoose');
const validator = require('validator');
const cassandra = require('cassandra-driver');
const utils = require('../utils/service-utils');

const client = new cassandra.Client({ contactPoints: ['cassandra'], localDataCenter: 'datacenter1', keyspace: 'stackoverflow' });

const User = require('../models/user');
const Question = require('../models/question');
const Answer = require('../models/answer');

const questions = express.Router();

async function checkValidMedia(media, res, item, userid) {
    if (media) {
        var tagValues = JSON.stringify(media).replace(/\[/g, '(').replace(/]/g, ')').replace(/"/g, "'");

        const selectQuery = 'SELECT used, userid FROM media WHERE id IN ' + tagValues;
        const selectResult = await client.execute(selectQuery);
        if (!selectResult.rows[0]) {
            return false;
        }
        for (let i = 0; i < selectResult.rows.length; i++) {
            if (selectResult.rows[i].used) {
                return false;
            }
            if (selectResult.rows[i].userid != userid) {
                return false;
            }
            // Add media id to question's or answer's media list
            item.media.push(media[i]);
        }
        const updateQuery = 'UPDATE media SET used = True WHERE id IN ' + tagValues;
        client.execute(updateQuery);
    }
    return true;
}

// Endpoint: /questions
questions.route('/').all(function (req, res, next) {
    console.log('/questions');
    next();
})
    .get(function (req, res) {
        
    })
    .post(function (req, res) {
        let username = req.cookies.user ? req.cookies.user.username : null;
        qs = JSON.parse(req.body.questions);
        for (let i = 0; i < qs.length; i++) {
            let q = qs[i];
            let d = new Date(1000 * Number(q['timestamp']))
            q['timestamp'] = d.toString();
        }
        res.render('pages/questions', {
            username,
            questions: qs
        });
    });

// Endpoint: /questions/add
questions.route('/add').all(function (req, res, next) {
    next();
})
    .post(async function (req, res) {

        if (!req.body || !req.body.title || !req.body.body || !req.body.tags) {
            return res.status(400).json(utils.errorJSON('Bad input on /questions/add'));
        }

        if (!req.cookies.user || !req.cookies.user.cookieID) {
            return res.status(400).json(utils.errorJSON('Please log in or verify'));
        }
        const title = req.body.title;
        const body = req.body.body;
        const tags = req.body.tags;
        const user_id = req.cookies.user.cookieID;
        const media = req.body.media;
        const timestamp = utils.getTimeStamp();
        const id = mongoose.Types.ObjectId();

        const question = {
            _id: id,
            user_id,
            title,
            body,
            tags,
            score: 0,
            timestamp,
            view_count: 0,
            vote_user_ids: {},
            answers: [],
            media: []
        };

        const valid = await checkValidMedia(media, res, question, user_id.toString());
        if (!valid) {
            return res.status(400).json(utils.errorJSON('Media id does not exist or already in use'));
        }


        const data = new Question(question);
        await data.save();

        // Add question reference to question asker
        const usernameResult = await User.findById(user_id).exec();
        usernameResult.questions.push(id);
        await usernameResult.save();

        return res.json(utils.okJSON('id', id));
    });

// Endpoint: /questions/{id}
questions.route('/:id').all(function (req, res, next) {
    // console.log('/questions/{id}');

    if (!req.params.id || !validator.isMongoId(req.params.id)) {
        // console.log('bad input on /questions/{id}');
        return res.status(400).json(utils.errorJSON('Bad input'));
    }
    next();
})
    .get(async function (req, res) {
        // console.log('GET to /questions/{id}');

        const question = await Question.findById(req.params.id).exec();

        if (!question) {
            return res.status(404).json(utils.errorJSON('Question not found'));
        }

        let cookieID;
        if (!req.cookies.user || !req.cookies.user.cookieID) {
            cookieID = undefined;
        } else {
            cookieID = req.cookies.user.cookieID;
        }

        const clientIP = req.ip;

        // not a fan of this at all, for sure will refactor this whole function to a real query
        const user_viewed = cookieID &&
            question.view_user_id.indexOf(mongoose.Types.ObjectId(cookieID)) >= 0;
        const ip_viewed = clientIP && question.view_IP.includes(clientIP);

        // if previously viewed
        const already_viewed = user_viewed || ip_viewed;

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
                // const rep = populatedQuestion.user_id.reputation >= 1 ? populatedQuestion.user_id.reputation : 1;
                res.json({
                    status: 'OK',
                    question: {
                        id: populatedQuestion.id,
                        user: {
                            username: populatedQuestion.user_id.username,
                            reputation: populatedQuestion.user_id.reputation
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
        // console.log('DELETE to /questions/{id}');
        if (!req.cookies.user || !req.cookies.user.cookieID) {
            return res.sendStatus(404);
        }
        const user_id = req.cookies.user.cookieID;
        const question = await Question.findOne({
            _id: req.params.id,
            user_id
        }).exec();

        if (!question) {
            return res.sendStatus(404);
        }

        // Find question asker
        const asker = await User.findById(question.user_id).exec();

        const deleteQuery = 'DELETE FROM media WHERE id IN ?;';
        // Delete each question's media
        if (question.media.length > 0) {
            const values = [question.media];
            client.execute(deleteQuery, values, function (err, result) {
                if (err) {
                    console.log('Error deleting media');
                }
            });
        }

        // Subtract deleted question's score from asker's reputation
        asker.reputation = (asker.reputation - question.score >= 1) ? asker.reputation - question.score : 1;

        // Delete question reference from asker's questions
        asker.questions = asker.questions.filter(e => e.toString() !== req.params.id.toString());
        await asker.save();

        // For each answer: delete media, subtract score from answerer's reputation, and delete answer
        if (question.answers.length > 0) {
            question.answers.forEach(async (answer_id) => {
                const answer = await Answer.findById(answer_id).exec();

                // Delete each answer's media
                if (answer.media.length > 0) {
                    const values = [answer.media];
                    client.execute(deleteQuery, values, function (err, result) {
                        if (err) {
                            console.log('Error deleting media');
                        }
                    });

                }

                // Find question answerer
                const answerer = await User.findById(answer.user_id).exec();

                // Subtract deleted answer's score from answerer's reputation
                answerer.reputation = (answerer.reputation - answer.score >= 1) ? answerer.reputation - answer.score : 1;

                // Delete answer reference from answerer's answers
                answerer.answers = answerer.answers.filter(e => e.toString() !== answer_id.toString());

                await answerer.save();

                // Delete answer
                await Answer.findByIdAndRemove(answer_id).exec();
            });
        }

        // Delete question
        await Question.findByIdAndRemove(req.params.id).exec();
        res.sendStatus(200);
    });

// Endpoint: /questions/{id}/answers
questions.route('/:id/answers').all(function (req, res, next) {
    if (!req.params.id || !validator.isMongoId(req.params.id)) {
        return res.status(400).json(utils.errorJSON('Bad input'));
    }

    next();
})
    .get(function (req, res) {
        Question.findById(req.params.id)
            .populate('answers')
            .exec()
            .then(questions => {
                if (!questions) {
                    return res.status(404).json(utils.errorJSON('answers missing'));
                }
                res.json(utils.okJSON('answers', questions.answers));
            }).catch(err => {
                res.status(404).json(utils.errorJSON(err));
            });
    });

// Endpoint: /questions/{id}/upvote
questions.route('/:id/upvote').all(function (req, res, next) {
    if (!req.params.id || !validator.isMongoId(req.params.id)) {
        return res.status(400).json(utils.errorJSON('missing or bad id'));
    }

    next();
})
    .post(async function (req, res) {
        let upvote = req.body.upvote;
        if (!req.cookies.user || !req.cookies.user.cookieID) {
            return res.status(400).json(utils.errorJSON('qupv: pls log in'));
        }
        const cookieID = req.cookies.user.cookieID;

        if (upvote === undefined) {
            upvote = true;
        }

        Question.findById(req.params.id)
            .exec()
            .then(question => {
                if (!question) {
                    return res.status(404).json(utils.errorJSON('question not found'));
                }

                User.findById(question.user_id)
                    .exec()
                    .then(async user => {
                        if (!user) {
                            return res.status(404).json(utils.errorJSON('user not found'));
                        }

                        const voter_user_id = cookieID.toString();
                        const new_vote_type = upvote;
                        const existing_vote = question.vote_user_ids.get(voter_user_id);
                        let score_delta;
                        let rep_delta;
                        let updated_reputation;

                        let waive_penalty = 0;
                        // if a new vote
                        if (existing_vote == undefined) {
                            score_delta = new_vote_type == true ? 1 : -1;
                            // console.log('new vote with val = %d', score_delta);
                            // rep_delta = score_delta;
                        }
                        else if (existing_vote.vote_type == false) {
                            // console.log('previous downvote');
                            // previous downvote
                            score_delta = new_vote_type == true ? 2 : 1;
                            // rep_delta = score_delta;

                            // dont over incr reputation from upvoting a previously waived downvote
                            // if (existing_vote.waive_penalty) {
                            // rep_delta -= existing_vote.waive_penalty;
                            // console.log('waive penalty reduces rep_delta to %d', rep_delta);
                            // }
                            waive_penalty = existing_vote.waive_penalty;
                        }
                        else {
                            // console.log('previous upvote');
                            // previous upvote
                            score_delta = new_vote_type == true ? -1 : -2;
                            // rep_delta = score_delta;
                            waive_penalty = existing_vote.waive_penalty;
                        }
                        rep_delta = score_delta;
                        // console.log('score_delta = %d, old_score = %d', score_delta, question.score);
                        question.score += score_delta;

                        // console.log('rep_delta = %d, old_rep = %d, waive_penalty = %d', rep_delta, user.reputation, waive_penalty);
                        updated_reputation = user.reputation + rep_delta - waive_penalty;

                        // downvotes that would reduce rep below 1 must be later waived when undone
                        waive_penalty = 0;
                        if (updated_reputation < 1) {
                            // console.log('updated_rep below 1: = %d', updated_reputation);
                            waive_penalty = 1 - updated_reputation;
                            // console.log('new waive penalty = %d', waive_penalty);
                            user.reputation = 1;
                        }
                        else {
                            user.reputation = updated_reputation;
                        }
                        // console.log('new user rep = %d', user.reputation);

                        // if toggle, remove like they never voted in the first place
                        if (existing_vote != undefined && existing_vote.vote_type === new_vote_type) {
                            // this is how deleting from map works with Mongoose
                            question.vote_user_ids.set(voter_user_id, undefined);
                            // console.log('removed vote from voter_user_id = ' + voter_user_id);
                        }
                        else {
                            // either update old or insert new user_id -> vote
                            // console.log('updating vote_user_ids with vote_type= ' + new_vote_type + ' and waive_penalty = ' + waive_penalty);
                            question.vote_user_ids.set(voter_user_id, {
                                vote_type: new_vote_type,
                                waive_penalty: waive_penalty
                            });
                        }
                        await user.save();
                        // console.log('awaiting q save()');
                        await question.save();
                        // console.log('awaiting u save()');
                        // await 

                        return res.json(utils.okJSON());

                    }).catch(err => {
                        return res.status(404).json(utils.errorJSON());
                    });

            }).catch(err => {
                return res.status(404).json(utils.errorJSON());
            });
    });

// Endpoint: /questions/{id}/answers/add
questions.route('/:id/answers/add').all(function (req, res, next) {
    if (!req.params.id || !validator.isMongoId(req.params.id)) {
        // console.log('Bad input on /questions/{id}/answers/add');
        return res.status(400).json(utils.errorJSON('Bad input'));
    }

    next();
})
    .post(async function (req, res) {
        if (!req.cookies.user || !req.cookies.user.cookieID) {
            return res.status(400).json(utils.errorJSON('Please log in or verify'));
        }
        // console.log('--POST on q ans add--');
        const body = req.body.body;
        const media = req.body.media;
        const user_id = req.cookies.user.cookieID;
        const username = req.cookies.user.username;
        // console.log(username);
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
            question_id: mongoose.Types.ObjectId(req.params.id),
            vote_user_ids: {}
        };

        const valid = await checkValidMedia(media, res, answer, user_id);
        if (!valid) {
            return res.status(400).json(utils.errorJSON('Media id does not exist or already in use'));
        }

        const data = new Answer(answer);

        Question.findOneAndUpdate({
            _id: req.params.id,
            answers_user_ids: {
                $ne: user_id
            }
        },
            {
                $push: {
                    answers: id,
                    answers_user_ids: user_id
                }
            })
            .exec()
            .then(() => {
                data.save();
                User.findByIdAndUpdate(
                    req.params.id,
                    {
                        $push: {
                            answers: id,
                        }
                    }, function (err) {
                        if (err) {
                            console.log('err updating user with answer ' + err);
                        }
                    });
                res.json(utils.okJSON('id', id));
            }).catch(err => {
                console.log('err updating q with answer ' + err);
                return res.status(404).json(utils.errorJSON('Question 404 / user already answered'));
            });


        // if (!question) {
        // return res.status(404).json(utils.errorJSON('Question not found / user already answered with id: ' + req.params.id));
        // }


        // const user = await User.findById(user_id).exec();

        // user.answers.push(id);
        // user.save();    

    });

module.exports = questions;


