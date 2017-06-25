/**
 * Created by Victor_Zhou on 2017-6-4.
 */
var chat = function (socket) {
    this.socket = socket;
};

chat.prototype.initLogin = function (username) {
    var message = { username: username };
    this.socket.emit('initLogin', message);
};

chat.prototype.enterRoom = function (room) {
    var message = { room: room };
    this.socket.emit('enterRoom', message);
};

chat.prototype.sendMessage = function (room, text) {
    var message = {
        room: room,
        text: text
    };
    this.socket.emit('message', message);
};

chat.prototype.addRoom = function (username, room) {
    var message = {
        username: username,
        room: room
    };
    this.socket.emit('addRoom', message);
};

chat.prototype.joinRoom = function (username, room) {
    var message = {
        username: username,
        room: room
    };
    this.socket.emit('joinRoom', message);
};

chat.prototype.exitRoom = function (room) {
    var message = {
        room: room
    };
    this.socket.emit('exitRoom', message);
};

chat.prototype.leaveRoom = function (username, room) {
    var message = {
        username: username,
        room: room
    };
    this.socket.emit('leaveRoom', message);
};

chat.prototype.getUserJoinedRoom = function (username) {
    var message = {
        username: username
    };
    this.socket.emit('getUserJoinedRoom', message);
};

chat.prototype.changeNick = function (username, newnick) {
    var message = {
        username: username,
        newnick: newnick
    };
    this.socket.emit('changeNick', message);
};

chat.prototype.changePasswd = function (username, oldPasswd, newPasswd) {
    var message = {
        username: username,
        oldPasswd: oldPasswd,
        newPasswd: newPasswd
    };
    this.socket.emit('changePasswd', message);
};


