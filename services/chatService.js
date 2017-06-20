/**
 * Created by Victor_Zhou on 2017-6-4.
 */
var User = require('../module/user');
var logger = require('../logging/logger')('chatService');

var nickNames = {};
var currentRoom = {};

exports.initLogin = function (io, socket, room) {
    socket.on('initLogin', function (message) {
        User.findOne({username: message.username}, function (err, msg) {
            if (!err) {
                if (msg != null) {
                    var nickname = msg.nickname;
                    nickNames[socket.id] = nickname;
                    logger.info("getNickName User [find] nickname: " + nickname);
                    socket.emit('nameResult', {
                        success: true,
                        name: nickname
                    });

                    logger.info("joinRoom begin with room: " + room);
                    socket.join(room);
                    socket.emit('joinResult', {
                        success: true,
                        room: room
                    });
                    socket.broadcast.to(room).emit('message', {
                        text: nickNames[socket.id] + ' has joined ' + room + '.'
                    });

                    currentRoom[socket.id] = room;
                    broadcastUserChange(io, room);
                    broadcastRoomChange(io);
                }
            } else {
                socket.emit('nameResult', {
                    success: false,
                    message: '无法获取您的昵称！'
                });
                logger.error("getNickName User [find] " + JSON.stringify(err));
            }
        })
    });
};

exports.handleMessageBroadcasting = function (socket) {
    socket.on('message', function (message) {
        logger.info("handleMessageBroadcasting begin with: " + message.text);
        socket.broadcast.to(message.room).emit('message', {
            text: nickNames[socket.id] + ': ' + message.text
        });
    })
};

exports.handleNameChangeAttempts = function (io, socket) {
    socket.on('nameAttempt', function (name) {
        if (name.indexOf('Guest') == 0) {
            logger.warn("handleNameChangeAttempts denied because name start with 'Guest'");
            socket.emit('nameResult', {
                success: false,
                message: 'Names cannot begin with "Guest".'
            });
        } else if (nickNames[socket.id] == name) {
            logger.warn("handleNameChangeAttempts denied because name had no change");
            socket.emit('nameResult', {
                success: false,
                message: 'Your new name is same as your current nick name.'
            });
        } else {

            var nameHasUsed = false;
            for (var id in nickNames) {
                if (nickNames[id] == name) {
                    nameHasUsed = true;
                }
            }

            if (!nameHasUsed) {
                logger.info("handleNameChangeAttempts begin from: " + nickNames[socket.id] + " to: " + name);
                var previousName = nickNames[socket.id];
                nickNames[socket.id] = name;
                socket.emit('nameResult', {
                    success: true,
                    name: name
                });
                socket.broadcast.to(currentRoom[socket.id]).emit('message', {
                    text: previousName + ' is now known as ' + name + '.'
                });
                broadcastUserChange(io, currentRoom[socket.id]);
            } else {
                logger.warn("handleNameChangeAttempts denied because name had no change");
                socket.emit('nameResult', {
                    success: false,
                    message: 'That name is already in use.'
                });
            }
        }
    });
};

exports.handleRoomJoining = function (io, socket) {
    socket.on('join', function (room) {
        if (room.newRoom == currentRoom[socket.id]) {
            logger.warn("handleRoomJoining denied because client has already in this room");
            socket.emit('joinResult', {
                success: false,
                message: 'You have already in this room.'
            });
        } else {
            socket.leave(currentRoom[socket.id], function (err) {
                if (!err) {
                    logger.info("handleRoomJoining begin with room: " + room.newRoom);

                    var previousRoom = nickNames[socket.id];
                    socket.broadcast.to(previousRoom).emit('message', {
                        text: nickNames[socket.id] + 'has leave this room!'
                    });

                    socket.join(room.newRoom);
                    currentRoom[socket.id] = room.newRoom;

                    broadcastUserChange(io, previousRoom);

                    socket.broadcast.to(currentRoom[socket.id]).emit('message', {
                        text: 'Welcome ' + nickNames[socket.id] + ' join this room!'
                    });
                    broadcastUserChange(io, currentRoom[socket.id]);

                    socket.emit('joinResult', {
                        success: true,
                        room: currentRoom[socket.id]
                    });
                    broadcastRoomChange(io);
                } else {
                    logger.error("handleRoomJoining failed: " + JSON.stringify(err));
                }
            });
        }
    })
};

exports.handleClientDisconnection = function (io, socket) {
    socket.on('disconnect', function () {
        logger.info("handleClientDisconnection begin");
        socket.broadcast.to(currentRoom[socket.id]).emit('message', {
            text: nickNames[socket.id] + ' is offline.'
        });
        var room = currentRoom[socket.id];
        delete currentRoom[socket.id];
        delete nickNames[socket.id];
        broadcastUserChange(io, room);
        broadcastRoomChange(io);
    })
};

var broadcastUserChange = function (io, room) {
    var usersInRoom = [];
    for (var id in currentRoom) {
        if (currentRoom[id] == room) {
            usersInRoom.push(nickNames[id]);
        }
    }

    //logger.info("broadcastUserChange usersInRoom: " + JSON.stringify(usersInRoom));
    io.in(room).emit('userChange', usersInRoom);
};

var broadcastRoomChange = function (io) {
    var roomSet = {};
    for (var user in currentRoom) {
        if (roomSet[currentRoom[user]] == undefined) {
            roomSet[currentRoom[user]] = 0;
        }
    }

    //logger.info("broadcastRoomChange roomList: " + JSON.stringify(roomSet));
    io.emit('rooms', roomSet);
};