const express = require('express');
const hbs = require('hbs');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const secret = "abc123";
const crypto = require('crypto');
const session = require('express-session');
const flash = require('express-flash');
const nodemailer = require('nodemailer');
const async = require('async');
const { google } = require('googleapis');
const atoken = "ya29.GlvmBohndsUqu_1RGa4OrpDkMoSMboTLmfKnjqIpWPuygPYoFuux1liJCtcTWSzXkFiXPJ4636p-EnExQfUvUzemNUyzu3r9eOGwJFyTXzgx8LVz7xnhYk-25Pu6";
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
app.use(flash());
app.use(
    session({
        secret: secret,
        resave: true,
        saveUninitialized: false
    })
);
app.use('/profile', (request, response, next) => {
    if (request.session.user) {
        next();
    } else {
        response.status(401).send('User not authorized. Please log in.');
    }
});

app.use('/game', (request, response, next) => {
    if (request.session.user) {
        next();
    } else {
        response.status(401).send('User not authorized. Please log in.');
    }
});


app.all('/logout', (request, response) => {
    request.session.destroy();
    response.redirect('/');
});

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

app.get('/succeed/:username', function (request, response) {
    console.log(request.params.username);
    response.render('register_succeed.hbs', {
        title: 'Succeed',
        user: request.params.username
    });
});

app.get('/profile', function (request, response) {
    console.log(request.session.user);
    response.render('profile.hbs', {
        title: 'Account',
        user: request.session.user.username,
        score: request.session.user.score
    });
});

app.get('/game', function (request, response) {
    response.render('game.hbs', {
        title: 'Game',
        user: request.session.user.username
    });
});

app.get('/404', function (request, response) {
    response.send('Page Not Fount');
});

app.post('/create-user', function (request, response) {
    var db = utils.getDB();

    var username = request.body.username;
    var password = request.body.password;
    var email = request.body.email;

    password = bcrypt.hashSync(password, saltrounds);

    db.collection('users').find({
        username: username
    }).toArray(function (err, result) {
        if (result[0] == null) {
            db.collection('users').insertOne({
                username: username,
                password: password,
                email: email,
                score: 0
            }, (err, result) => {
                if (err) {
                    response.send('Unable to add user');
                }
                response.redirect(`/succeed/${username}`);
            });
        } else {
            response.send('Username not available. Try again.');
        }
    });

});

app.post('/login-user', function (request, response) {
    var db = utils.getDB();

    var username = request.body.username;
    var password = request.body.password;

    db.collection('users').find({
        username: username
    }).toArray(function (err, result) {
        if (result[0] != null) {
            let verify = bcrypt.compareSync(password, result[0].password);
            if (verify) {
                request.session.user = {
                    username: result[0].username,
                    email: result[0].email,
                    id: result[0]._id,
                    score: result[0].score
                };
                response.redirect('/profile');
            } else {
                response.send('Incorrect password');
            }
        } else {
            response.send('Username not found');
        }
    });

});

app.get('/reset-password', function (request, response) {
    response.render('pass_reset.hbs');
});

app.post('/reset', function (request, response) {
    var db = utils.getDB();

    var email = request.body.email;
    var token;


    db.collection('users').find({
        email: email
    }).toArray(function (err, result) {
        if (!result[0]) {
            request.flash('error', 'No registered account with that email.');
            response.redirect('/reset-password');
        } else {
            crypto.randomBytes(15, function (err, buf) {
                token = buf.toString('hex');
                result[0].token = token;
                result[0].tokenExpire = Date.now() + 3600000;
            });

            var auth = {
                type: 'oauth2',
                user: 'roulettegame.node@gmail.com',
                clientId: process.env.client_id,
                clientSecret: process.env.clietn_secret,
                refreshToken: process.env.refresh_token,
                accessToken: atoken
            };

            var mailOptions = {
                to:result[0].email,
                from: 'roulettegame.node@gmail.com',
                subject: 'Password Reset',
                text: 'The account linked to this email has requested a password reset. Click the following link and enter a new password. ' + 'localhost:8080' +
                    '/reset-pw' + token
            };

            var transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: auth
            });

            transporter.sendMail(mailOptions, (err, response) => {
                if (err) {
                    console.log(err);
                } else {
                    response.send('Email sent');
                }
            });

            if (err) {
                console.log(err);
            }

        }
    });

});

app.listen(port, () => {
    console.log(`Server is up on port ${port}`);
    utils.init();
});