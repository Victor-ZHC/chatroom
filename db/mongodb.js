/**
 * Created by Victor_Zhou on 2017-6-17.
 */
var mongoose = require('mongoose');
var mongodbConfig = require('../config/mongodbConfig.json');
var logger = require('../logging/logger')('mongodb');

var mongodbURL = 'mongodb://' + mongodbConfig["host"] + ':' + mongodbConfig["port"] + '/' + mongodbConfig["database"];

mongoose.Promise = global.Promise;
mongoose.connect(mongodbURL);

mongoose.connection.on('connected', function () {
    logger.info('Mongoose connection open to ' + mongodbURL);
});

mongoose.connection.on('error',function (err) {
    logger.error('Mongoose connection error: ' + err);
});

mongoose.connection.on('disconnected', function () {
    logger.info('Mongoose connection disconnected');
});

module.exports = mongoose;