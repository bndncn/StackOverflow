const express = require('express');
const ui = express.Router();

// Endpoint: Homepage
ui.get('/', function (req, res) {
    if (!req.cookies || !req.cookies.user) {
        res.render('pages/index', {
            username: false
        });
    }
    else {
        res.render('pages/index', {
            username: req.cookies.user.username
        });
    }
});

ui.get('/controllers/form_controller.js', function (req, res) {
    res.sendFile('controllers/form_controller.js', {
        root: __dirname
    });
});

ui.get('/node_modules/jquery/dist/jquery.min.js', function (req, res) {
    res.sendFile('node_modules/jquery/dist/jquery.min.js', {
        root: __dirname
    });
});

ui.get('/node_modules/bootstrap/dist/css/bootstrap.min.css', function (req, res) {
    res.sendFile('node_modules/bootstrap/dist/css/bootstrap.min.css', {
        root: __dirname
    });
});

ui.get('/node_modules/popper.js/dist/umd/popper.min.js', function (req, res) {
    res.sendFile('node_modules/popper.js/dist/umd/popper.min.js', {
        root: __dirname
    });
});

ui.get('/node_modules/bootstrap/dist/js/bootstrap.min.js', function (req, res) {
    res.sendFile('node_modules/bootstrap/dist/js/bootstrap.min.js', {
        root: __dirname
    });
});

ui.get('/css/styles.css', function (req, res) {
    res.sendFile('css/styles.css', {
        root: __dirname
    });
});

module.exports = ui;

