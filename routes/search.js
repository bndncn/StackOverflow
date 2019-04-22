const express = require('express');
const utils = require('../utils/service-utils');
const Question = require('../models/question');

const search = express.Router();

function textSearch(query, questions) {
    const searchResults = [];

    questions.forEach((question) => {
        const title = question.title.trim();
        const body = question.body.trim();
        const questionText = title + ' ' + body;

        if (containsWord(query, questionText)) {
            console.log('\n\n\npushing question with title = ' + title);
            searchResults.push(question);
        }
    });
    return searchResults;
}

function containsWord(query, text) {
    let queryWords = query.split(' ');
    let textWords = text.split(' ');

    const hashSet = initWordHashSet(queryWords);

    for (let i = 0; i < textWords.length; i++) {
        if (hashSetContains(hashSet, textWords[i].toLowerCase())) {
            return true;
        }
    }

    return false;
}

function initWordHashSet(wordArray) {
    const hashSet = {};
    for (let i = 0; i < wordArray.length; i++) {
        hashSet[wordArray[i].toLowerCase()] = true;
    }
    return hashSet;
}

function hashSetContains(hashSet, value) {
    return hashSet[value] === true;
}

// Endpoint: /search
search.post('/', function (req, res) {
    console.log('Searching');

    const q = req.body.q;

    // Check timestamp
    let timestamp = req.body.timestamp;
    if (!req.body.timestamp) {
        timestamp = utils.getTimeStamp();
    }
    else if (req.body.timestamp < 0) {
        // maybe edge case of timestamp greater than current time.
        return res.status(400).json(utils.errorJSON('Negative timestamp'));
    }

    // Check limit
    let limit = req.body.limit;
    if (!req.body.limit) {
        limit = 25;
    }
    else if (req.body.limit < 0 || req.body.limit > 100) {
        return res.status(400).json(utils.errorJSON('Bad Limit'));
    }

    // Check sort_by
    let sort_by = req.body.sort_by;
    if (!req.body.sort_by) {
        sort_by = 'score';
    }
    else if (req.body.sort_by !== 'timestamp' && req.body.sort_by !== 'score') {
        return res.status(400).json(utils.errorJSON('Invalid sort'));
    }

    console.log('\n\n-----------------post on search------------------\n\n');

    const condition = {
        timestamp: { $lte: timestamp }
    };

    if (req.body.tags) {
        condition.tags = { $all: req.body.tags };
    }

    if (req.body.has_media) {
        condition.media = { $ne: [] };
    }

    if (req.body.accepted) {
        condition.accepted_answer_id = { $ne: null };
    }

    // Already checked that sort_by must be "score" or "timestamp"
    const sort = sort_by === 'score' ? { score: -1 } : { timestamp: -1 }

    Question.find(condition)
        .populate({
            path: 'user_id',
            select: '-_id username reputation',
            options: {
                lean: true
            }
        })
        .sort(sort)
        .exec()
        .then(questions => {
            console.log('\n\n');
            console.log('search result = ' + JSON.stringify(questions));
            // If query string is given, return filtered search result
            if (q) {
                console.log("\n\nSearching for string " + q);
                const filteredSearch = textSearch(q, questions).slice(0, limit);
                console.log('filtered search = ' + filteredSearch);

                return res.json(utils.okJSON('questions', filteredSearch));
            }
            // Else return all results
            else {
                console.log('Returning all');
                const limitedQuestions = questions.slice(0, limit);
                return res.json(utils.okJSON('questions', limitedQuestions));
            }
        }).catch(err => {
            res.status(404).json(utils.errorJSON(err));
        });
});

module.exports = search;


