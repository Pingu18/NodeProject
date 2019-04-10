const MongoClient = require('mongodb').MongoClient;

/*module.exports.getDB = function () {
    return _db;
};

module.exports.init = function (callback) {
    MongoClient.connect('mongodb://heroku_7zxdfd6q:rv4hlanuoktj5mr3lvqv4f31mb@ds237196.mlab.com:37196/heroku_7zxdfd6q', function (err, client) {
        if (err) {
            return console.log('Unable to connect to DB');
        }
        _db = client.db('test');
        console.log('Succesfully connected to the MongoDB server');
    });
};*/

let uri = 'mongodb://heroku_7zxdfd6q:rv4hlanuoktj5mr3lvqv4f31mb@ds237196.mlab.com:37196/heroku_7zxdfd6q';

mongodb.MongoClient.connect(uri, function (err, client) {

    if (err) throw err;

    /*
     * Get the database from the client. Nothing is required to create a
     * new database, it is created automatically when we insert.
     */

    let db = client.db('dbname');
});