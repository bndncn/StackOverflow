const express = require('express');
const path = require('path');
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
    res.sendFile(path.resolve('controllers/form_controller.js'));
});

ui.get('/node_modules/jquery/dist/jquery.min.js', function (req, res) {
    res.sendFile(path.resolve('node_modules/jquery/dist/jquery.min.js'));
});

ui.get('/node_modules/bootstrap/dist/css/bootstrap.min.css', function (req, res) {
    res.sendFile(path.resolve('node_modules/bootstrap/dist/css/bootstrap.min.css'));
});

ui.get('/node_modules/popper.js/dist/umd/popper.min.js', function (req, res) {
    res.sendFile(path.resolve('node_modules/popper.js/dist/umd/popper.min.js'));

ui.get('/node_modules/bootstrap/dist/js/bootstrap.min.js', function (req, res) {
    res.sendFile(path.resolve('node_modules/bootstrap/dist/js/bootstrap.min.js'));
});

ui.get('/css/styles.css', function (req, res) {
    res.sendFile(path.resolve('css/styles.css'));
});

module.exports = ui;

