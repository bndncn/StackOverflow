const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const cassandra = require('cassandra-driver');
const client = new cassandra.Client({ contactPoints: ['cassandra'], localDataCenter: 'datacenter1', keyspace: 'stackoverflow' });

const utils = require('../utils/service-utils');

const addmedia = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Endpoint: /addmedia
addmedia.post('/', upload.single('content'), function (req, res) {
    console.log('\nAdding media file');

    if (!req.file) {
        console.log('No media file');
        return res.status(400).json(utils.errorJSON('No media file'));
    }
    console.log('addmedia_cookieID = ' + req.cookies.cookieID);
    console.log('addmedia_verified = ' + req.cookies.verified);
    if (!utils.ensureUserVerified(req, res)) {
        return res.status(400).json(utils.errorJSON('addmedia_ensureUserVerified failed'));
    }

    // if (!req.cookies.cookieID) {
    //     console.log('addMedia: Not logged in');
    //     return res.status(400).json(utils.errorJSON('Not logged in'));
    // }

    // if (!req.cookies.verified) {
    //     console.log('addmedia: Please verify');
    //     return res.status(400).json(utils.errorJSON('Please verify'));
    // }
    // const verified = await utils.ensureUserVerified(res, req);
    // if (!verified) {
    //     console.log('addmedia_ensureUserVerified failed');
    //     return res.status(400).json(utils.errorJSON('addmedia_ensureUserVerified failed'));
    // }

    const id = mongoose.Types.ObjectId().toString();
    const insertQuery = 'INSERT INTO media (id, userId, content, mimetype, used) VALUES(?,?,?,?,?);';
    const values = [id, req.cookies.cookieID, req.file.buffer, req.file.mimetype, false];

    client.execute(insertQuery, values, { prepare: true }, function (err, result) {
        if (err) {
            console.log("error in insert media = " + err);
            return res.status(400).json(utils.errorJSON(err));
        }
        else {
            // console.log('result = ' + result);
            return res.json(utils.okJSON('id', id));
        }
    });
});

module.exports = addmedia;

