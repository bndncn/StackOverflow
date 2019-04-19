const express = require('express');
const multer = require('multer');
const addmedia = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Endpoint: /addmedia
addmedia.post('/', function (req, res) {
    console.log('Adding media file');

});

module.exports = addmedia;

