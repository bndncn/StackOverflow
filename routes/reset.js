const express = require('express');
const cassandra = require('cassandra-driver');
const client = new cassandra.Client({ contactPoints: ['cassandra'], localDataCenter: 'datacenter1', keyspace: 'stackoverflow' });

const User = require('../models/user');
const Question = require('../models/question');
const Answer = require('../models/answer');
const utils = require('../utils/service-utils');

const reset = express.Router();

// Endpoint: /reset
reset.get('/', async function (req, res) {
    console.log('GET on reset');

    User.remove({}).exec((err, res) => {
        if (err) {
            console.log('err removing users ' + err);
        } else {
            console.log('res removing users ' + res);
        }
    });
    Question.remove({}).exec((err, res) => {
        if (err) {
            console.log('err removing questions ' + err);
        } else {
            console.log('res removing questions ' + res);
        }
    });
    Answer.remove({}).exec((err, res) => {
        if (err) {
            console.log('err removing answers ' + err);
        } else {
            console.log('res removing answers ' + res);
        }
    });

    client.execute('TRUNCATE media');
    return res.json(utils.okJSON());
});

module.exports = reset;
