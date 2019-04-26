const express = require('express');
const cassandra = require('cassandra-driver');
const client = new cassandra.Client({ contactPoints: ['cassandra'], localDataCenter: 'datacenter1', keyspace: 'stackoverflow' });

const utils = require('../utils/service-utils');

const media = express.Router();

// Endpoint: /media/{id}
media.get('/:id', async function (req, res) {
    const selectQuery = 'SELECT content, mimetype FROM media WHERE id=?;';
    const values = [req.params.id];

    client.execute(selectQuery, values, function (err, result) {
        if (err) {
            return res.status(404).json(utils.errorJSON('Media id: ' + req.params.id + ' does not exist.'));
        }
        else {
            res.contentType(result.rows[0].mimetype);
            return res.send(result.rows[0].content);
        }
    });
});

module.exports = media;