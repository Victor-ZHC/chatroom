/**
 * Created by Victor_Zhou on 2017-6-5.
 */
var socketIO = require('socket.io');
var chatService = require('../services/chatService');
var logger = require('../logging/logger')('chatServer');

var io;


exports.listen = function (server) {
    io = socketIO.listen(server);
    io.set('log level', 1);

    io.sockets.on('connection', function (socket) {
        logger.info("connection from client id: " + socket.id);
        chatService.assignGuestName(socket);
        chatService.joinRoom(io, socket, "Lobby");

        chatService.handleMessageBroadcasting(socket);
        chatService.handleNameChangeAttempts(io, socket);
        chatService.handleRoomJoining(io, socket);


        chatService.handleClientDisconnection(io, socket);
    })
};