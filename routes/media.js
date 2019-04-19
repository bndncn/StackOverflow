const express = require('express');
const media = express.Router();

// Endpoint: /media/{id}
media.get('/:id', function (req, res) {
    console.log('Getting media file: ' + req.params.id);
});

module.exports = media;

