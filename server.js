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
const atoken = "ya29.GlvmBrkOyJpvGJMrHC3qHNRkWTniML2DgCTQ26yjbnrkQyCr2R6P5-l6XYPg9nkvkM3Kl4XXYd4iMEDCC-XoFEELZhyTTI83Bh9qyQv3uN0TIcf53jLddDqsmXsD";
const rtoken = "1/kyCGdAd3qOXNpxv2OodPzqYJawbJ2jd7x8XncPUKDcM";
const c_id = "501389035466-iv8pttp4ql12dq17nnrbq1vpesvqr8ru.apps.googleusercontent.com";
const c_sec = "GHMetXcZ22ZQEABLwTCizmfV";
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
        response.render('simple_response.hbs', {
            h1: 'User not authorized. Please sign in.'
        });
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
        user: request.session.user.username,
        score: request.session.user.score
    });
});

app.get('/404', function (request, response) {
    response.send('Page Not Fount');
});

app.post('/create-user', function (request, response) {
    var db = utils.getDB();

    var username = request.body.username;
    var password = request.body.password;
    var password_confirm = request.body.password_confirm;
    var email = request.body.email;
    var token = "";
    var tokenExpires = "";
    var create = 1;

    if (password != password_confirm) {
        response.render('simple_response.hbs', {
            h1: 'Passwords must match'
        });
        create = 0;
    };

    db.collection('users').find({
        email: email
    }).toArray(function (err, result) {
        if (result[0] != null) {
            response.render('simple_response.hbs', {
                h1: 'Email already in use'
            })
            create = 0;
        };
    });

    password = bcrypt.hashSync(password, saltrounds);

    db.collection('users').find({
        username: username
    }).toArray(function (err, result) {
        if (result[0] == null && create == 1) {
            db.collection('users').insertOne({
                username: username,
                password: password,
                email: email,
                token: token,
                tokenExpire: tokenExpires,
                score: 0
            }, (err, result) => {
                if (err) {
                    response.render('simple_response.hbs', {
                        h1: 'Unable to add user'
                    });
                }
                response.redirect(`/succeed/${username}`);
            });
        } else {
            response.render('simple_response.hbs', {
                h1: 'Username not available'
            });
        }
    });

});

app.post('/login-user', function (request, response) {
    utils.init();
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
                    token: result[0].token,
                    tokenExpire: result[0].tokenExpire,
                    score: result[0].score,
                };
                response.redirect('/profile');
            } else {
                response.render('simple_response.hbs', {
                    h1: 'Incorrect Password'
                });
            }
        } else {
            response.render('simple_response.hbs', {
                h1: 'Username not found'
            });
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
            response.render('simple_response.hbs', {
                h1: 'No account with specified email'
            });
        } else {

            request.session.user = {
                username: result[0].username,
                email: result[0].email,
                id: result[0]._id,
                token: result[0].token,
                tokenExpire: result[0].tokenExpire,
                score: result[0].score,
            };

            crypto.randomBytes(15, function (err, buf) {
                token = buf.toString('hex');

                db.collection('users').updateOne(
                    { email: email },
                    {
                        $set: {
                            token: token,
                            tokenExpire: Date.now() + 3600
                        }
                    }
                )

                request.session.user.token = token
                request.session.user.tokenExpire = Date.now() + 3600
                request.session.save(function (err) {
                    if (err) {
                        console.log(err);
                    }
                })
            });

            var auth = {
                type: 'oauth2',
                user: 'roulettegame.node@gmail.com',
                clientId: c_id,
                clientSecret: c_sec,
                refreshToken: rtoken,
                accessToken: atoken
            };

            db.collection('users').find({
                email: email
            }).toArray(function (err, result) {
                var mailOptions = {
                    to: result[0].email,
                    from: 'roulettegame.node@gmail.com',
                    subject: 'Password Reset',
                    text: 'The account linked to this email has requested a password reset. Click the following link and enter a new password. \n' + 'localhost:8080' +
                        '/reset/' + request.session.user.token,
                    auth: {
                        user: 'roulettegame.node@gmail.com',
                        refreshToken: rtoken,
                        accessToken: atoken
                    }
                };

                console.log(request.session.user.token);

                var transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: auth
                });

                transporter.sendMail(mailOptions, (err, response) => {
                    if (err) {
                        console.log(err);
                    }
                });

                if (err) {
                    console.log(err);
                } else {
                    response.render('simple_response.hbs', {
                        h1: 'An email has been sent'
                    });
                }
            });

        }
    });

});

app.get('/reset/:token', function (request, response) {
    var db = utils.getDB();

    db.collection('users').find({
        token: request.params.token
    }).toArray(function (err, result) {
        if (result[0] == null) {
            response.render('simple_response.hbs', {
                h1: 'Invalid Token'
            });
        } else {
            response.render('reset.hbs', {
                username: result[0].username
            });
        }
    });
});

app.post('/reset/:token', function (request, response) {
    var db = utils.getDB();

    var password = request.body.password;
    password = bcrypt.hashSync(password, saltrounds);
    var token = request.params.token;

    db.collection('users').find({
        token: token
    }).toArray(function (err, result) {
        if (result[0] != null) {
            db.collection('users').updateOne(
                { token: token },
                {
                    $set: {
                        password: password
                    }
                }
            );
            response.render('reset_result.hbs', {
                h1: 'Password Reset',
                message: 'Your password has been succesfully reset.'
            });
        } else {
            response.render('reset_result.hbs', {
                h1: 'Invalid Token',
                message: 'You have provided an invalid token. No changes have been made.'
            });
        }
    });
});
app.listen(port, () => {
    console.log(`Server is up on port ${port}`);
    utils.init();
});