/**
 * Created by Victor_Zhou on 2017-6-17.
 */
var mongoose = require('../db/mongodb');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    username: String,
    password: String,
    nickname: String
});

module.exports = mongoose.model('User', UserSchema);