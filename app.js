// Node modules
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');

// Routes
const index = require('./routes/index');
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

const port = 80;
const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Set up routes
app.use('/', index);
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

// Mongoose setup 
const dbURL = 'mongodb://192.168.122.38:27017/stackoverflow';
mongoose.connect(dbURL, { useNewUrlParser: true }, function (err) {
    if (err) {
        console.log(err);
    } 
    else {
        console.log('Connected to MongoDB...');
    }
});

app.listen(port, () => console.log('Starting StackOverflow service...'));
