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
        chatService.initLogin(io, socket);
        chatService.enterRoom(socket);
        chatService.exitRoom(socket);
        chatService.handleAddRoom(socket);
        chatService.handleChangeNick(io, socket);
        chatService.handleChangePasswd(socket);
        chatService.handleJoinRoom(io, socket);
        chatService.handleLeaveRoom(io, socket);
        chatService.handleGetUserJoinedRoom(socket);
        chatService.handleMessageBroadcasting(socket);
        chatService.handleClientDisconnection(io, socket);
    })
};