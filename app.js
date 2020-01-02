// Node modules
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
var fs = require('fs');
var morgan = require('morgan');
var path = require('path');

// create a write stream (in append mode)
var accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });


// Routes
const ui = require('./routes/ui');
const adduser = require('./routes/adduser');
const login = require('./routes/login');
const logout = require('./routes/logout');
const verify = require('./routes/verify');
const questions = require('./routes/questions');
const search = require('./routes/search');
const user = require('./routes/user');
const answers = require('./routes/answers');
const addmedia = require('./routes/addmedia');
const media = require('./routes/media');
const reset = require('./routes/reset');

const port = 80;
const app = express();

// setup the logger
app.use(morgan('short', { stream: accessLogStream }));
app.set('view engine', 'ejs');
app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));
app.use(cookieParser());

// Set up routes
app.use('/', ui);
app.use('/adduser', adduser);
app.use('/login', login);
app.use('/logout', logout);
app.use('/verify', verify);
app.use('/questions', questions);
app.use('/search', search);
app.use('/user', user);
app.use('/answers', answers);
app.use('/addmedia', addmedia);
app.use('/media', media);
app.use('/reset', reset);

// Mongoose setup 
// const dbURL = 'mongodb://mongo1:27017/stackoverflow';
const dbURL = 'mongodb://localhost:27017/stackoverflow';
mongoose.connect(dbURL, { useNewUrlParser: true, useUnifiedTopology: true }, function (err) {
    if (err) {
        console.log(err);
    }
    else {
        console.log('Connected to MongoDB...');
    }
});

app.listen(port, () => console.log('Starting StackOverflow service...'));
