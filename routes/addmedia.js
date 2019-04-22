const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const Media = require('../models/media');
const utils = require('../utils/service-utils');
const client = require('../app.js').client;

const addmedia = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Endpoint: /addmedia
addmedia.post('/', upload.single('content'), function (req, res) {
    console.log('Adding media file');

    if (!req.file) {
        console.log('No media file');
        return res.status(400).json(utils.errorJSON('No media file'));
    }

    if (!req.cookies.cookieID) {
        console.log('Not logged in');
        return res.status(400).json(utils.errorJSON('Not logged in'));
    }

    utils.ensureUserVerified(res, req);

    const id = mongoose.Types.ObjectId().toSring();
    const insertQuery = 'INSERT INTO media (id, content, mimetype, used) VALUES(?,?,?,?);';
    const values = [id, req.file.buffer, req.file.mimetype, false];
    
    client.execute(insertQuery, values, { prepare: true }, function (err, result) {
		if (err) {
			console.log("ERROR IN DEP = " + err);
			return res.status(400).json(utils.errorJSON(err));
        } 
        else {
			console.log('result = ' + result);
			return res.json(utils.okJSON('id', id));
		}
	});
});

module.exports = addmedia;

