/**
 * Created by Victor_Zhou on 2017-6-23.
 */
var mongoose = require('../db/mongodb');
var Schema = mongoose.Schema;

var RoomSchema = new Schema({
    ownername: String,
    roomname: String,
    usernamelist: [],
    messagelist: []
});

module.exports = mongoose.model('Room', RoomSchema);