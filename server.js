const express = require('express');
const hbs = require('hbs');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const saltrounds = 10;
const port = process.env.PORT || 8080;

var app = express();
var utils = require('./utils');

app.set('view engine', 'hbs');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

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

app.post('/create-user', function (request, response) {
    var db = utils.getDB();

    var username = request.body.username;
    var password = request.body.password;
    var email = request.body.email;

    password = bcrypt.hashSync(password, saltrounds);

    db.collection('users').find({
        username: username
    } || {
        email: email
    }).toArray(function (err, result) {
        if (err || result[0] == null) {
            db.collection('users').insertOne({
                username: username,
                password: password,
                email: email
            }, (err, result) => {
                if (err) {
                    response.send('Unable to add user')
                }
                response.send(JSON.stringify(result.ops, undefined, 2));
            });
        } else {
            response.send('Username not available. Try again.');
        }
    });

});

app.listen(port, () => {
    console.log(`Server is up on port ${port}`);
    utils.init();
});