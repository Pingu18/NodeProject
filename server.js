const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const hbs = require('hbs');
const port = process.env.PORT || 8080;

var app = express();
var utils = require('./utils');

app.set('view engine', 'hbs');
app.use(express.static(__dirname + '/public'));

app.get('/', function (request, response) {
    response.render('home.hbs', {
        title: 'Home'
    });
});

app.get('/register', function (request, response) {
    response.render('register.hbs', {
        title: 'Register'
    });
});

app.listen(port, () => {
    console.log(`Server is up on port ${port}`);
    utils.init();
});