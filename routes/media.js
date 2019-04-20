const express = require('express');
const Media = require('../models/media');
const utils = require('../utils/service-utils');

const media = express.Router();

// Endpoint: /media/{id}
media.get('/:id', async function (req, res) {
    console.log('Getting media file: ' + req.params.id);

    const id = req.params.id;

    const mediaResult = await Media.findById(id).exec();

    if (!mediaResult) {
        console.log('Media id: ' + id + ' does not exist.');
        return res.status(404).json(utils.errorJSON('Media id: ' + id + ' does not exist.'));
    }
    else {
        res.contentType(mediaResult.mimetype);
        return res.send(mediaResult.content);
    }
});

module.exports = media;

