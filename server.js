const express = require('express');
const router = express.Router();
const hbs = require('hbs');
const fs = require('fs');
const port = process.env.PORT || 8080;

var app = express();

app.set('view engine', 'hbs');
app.use(express.static(__dirname + '/public'));

app.get('/', function (request, response) {
    response.render('home.hbs', {
        title: 'Home'
    });
});

app.listen(port, () => {
    console.log(`Server is up on port ${port}`);
});