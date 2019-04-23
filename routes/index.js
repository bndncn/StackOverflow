const express = require('express');
const index = express.Router();

// Endpoint: Homepage
index.get('/', function (req, res) {
    res.render('./pages/index');
});

index.post('/', function (req, res) {
    // console.log("POST on homepage");
});

module.exports = index;

