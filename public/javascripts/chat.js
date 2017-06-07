/**
 * Created by Victor_Zhou on 2017-6-4.
 */
var chat = function (socket) {
    this.socket = socket;
};

chat.prototype.sendMessage = function (room, text) {
    var message = {
        room: room,
        text: text
    };
    this.socket.emit('message', message);
};

chat.prototype.changeRoom = function (room) {
    var message = {
        newRoom: room
    };
    this.socket.emit('join', message);
};

chat.prototype.processCommand = function (commandLine) {
    var words = commandLine.split(' ');
    if (words.length < 2) {
        return 'There are wrong arguments of the command.'
    }
    var command = words[0].substring(1, words[0].length).toLowerCase();
    var message = false;

    switch (command) {
        case 'join':
            words.shift();
            var room = words.join(' ');
            this.changeRoom(room);
            break;
        case 'nick':
            words.shift();
            var name = words.join(' ');
            this.socket.emit('nameAttempt', name);
            break;
        default:
            message = 'Unknown error happened!';
            break;
    }

    return message;
};

