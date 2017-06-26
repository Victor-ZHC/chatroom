/**
 * Created by Victor_Zhou on 2017-6-4.
 */
var User = require('../module/user');
var Room = require('../module/room');
var logger = require('../logging/logger')('chatService');

var onlineUsers = {};

Date.prototype.Format = function (fmt) { //author: meizz
    var o = {
        "M+": this.getMonth() + 1,                 //月份
        "d+": this.getDate(),                    //日
        "h+": this.getHours(),                   //小时
        "m+": this.getMinutes(),                 //分
        "s+": this.getSeconds(),                 //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds()             //毫秒
    };
    if (/(y+)/.test(fmt))
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt))
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
};

Array.prototype.indexOf = function(val) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] == val) return i;
    }
    return -1;
};

Array.prototype.remove = function(val) {
    var index = this.indexOf(val);
    if (index > -1) {
        this.splice(index, 1);
    }
};

exports.initLogin = function (socket) {
    socket.on('initLogin', function (message) {
        User.findOne({username: message.username}, {username: true, nickname:true, roomlist: true}, function (err, msg) {
            if (!err) {
                if (msg != null) {
                    var user = {
                        username: msg.username,
                        nickname: msg.nickname
                    };
                    onlineUsers[socket.id] = user;

                    var data = msg;
                    logger.info("initLogin User [findOne] : " + JSON.stringify(msg));

                    User.find({}, {username: true, nickname:true}, function (err, msg) {
                        logger.info("initLogin User [find] : " + JSON.stringify(msg));
                        if (!err) {
                            var userlist = {};
                            for (var i = 0; i < msg.length; i++) {
                                userlist[msg[i].username] = msg[i].nickname;
                            }
                            socket.emit('initLoginResult', {
                                status: true,
                                user: data,
                                userlist: userlist
                            });
                        } else {
                            socket.emit('nameResult', {
                                status: false,
                                message: '数据库异常，请联系管理员！'
                            });
                        }
                    });
                } else {
                    socket.emit('nameResult', {
                        status: false,
                        message: '无法获取您的信息，请联系管理员！'
                    });
                }
            } else {
                socket.emit('initLoginResult', {
                    status: false,
                    message: '系统出现异常！'
                });
                logger.error("getNickName User [find] " + JSON.stringify(err));
            }
        })
    });
};

exports.enterRoom = function (socket) {
    socket.on('enterRoom', function (message) {
        Room.findOne({roomname: message.room}, function (err, msg) {
            if (!err) {
                logger.info("enterRoom Room [findOne] : " + JSON.stringify(msg));
                socket.join(message.room);

                socket.emit('enterRoomResult', {
                    status: true,
                    room: msg
                })
            } else {
                logger.error("enterRoom Room [findOne] : " + JSON.stringify(err));
                socket.emit('enterRoomResult', {
                    status: false,
                    message: "该房间已被删除！"
                })
            }
        });

    });
};

exports.exitRoom = function (socket) {
    socket.on('exitRoom', function (message) {
        socket.leave(message.room, function (err) {
            if (!err) {
                logger.info("exitRoom: " + message.room);
            } else {
                logger.error("exitRoom: " + JSON.stringify(err));
            }
        })
    });
};

exports.handleMessageBroadcasting = function (socket) {
    socket.on('message', function (message) {
        Room.findOne({roomname: message.room}, function (err, msg) {
            if (!err) {
                logger.info("handleMessageBroadcasting Room [findOne] " + JSON.stringify(msg));
                var data = {
                    messagehead: onlineUsers[socket.id].nickname + ' ' + new Date().Format("yyyy-MM-dd hh:mm:ss"),
                    messagecontent: message.text
                };
                msg.messagelist.push(data);

                var _id = msg._id;
                delete msg._id;
                Room.update({_id: _id}, msg, function (err, msg) {
                    if (!err) {
                        logger.info("handleMessageBroadcasting Room [update] " + JSON.stringify(msg));
                        data.room = message.room;
                        socket.broadcast.to(message.room).emit('message', data);
                    } else {
                        logger.error("handleMessageBroadcasting Room [update] " + JSON.stringify(err));
                    }
                });
            } else {
                logger.error("handleMessageBroadcasting Room [findOne] " + JSON.stringify(err));
            }
        });
    })
};

exports.handleAddRoom = function (socket) {
    socket.on('addRoom', function (message) {
        var room = new Room({
            ownername: message.username,
            roomname: message.room,
            usernamelist: [message.username],
            messagelist: []
        });

        Room.findOne({roomname: message.room}, function (err, msg) {
            if(!err) {
                logger.info('handleAddRoom Room [findOne]: ' + JSON.stringify(msg));
                if (msg == null) {
                    room.save(function (err, msg) {
                        if(!err) {
                            logger.info('handleAddRoom Room [save]: ' + JSON.stringify(msg));

                            User.findOne({username: message.username}, function (err, msg) {
                                if (!err) {
                                    logger.info('handleAddRoom User [findOne]: ' + JSON.stringify(msg));

                                    msg.roomlist.push(message.room);
                                    var _id = msg._id;
                                    delete msg._id;
                                    User.update({_id: _id}, msg, function (err, msg) {
                                        if (!err) {
                                            logger.info("handleAddRoom User [update] " + JSON.stringify(msg));
                                            socket.emit('addRoomResult', {
                                                status: true,
                                                room: message.room
                                            });
                                        } else {
                                            logger.error("handleAddRoom User [update] " + JSON.stringify(err));
                                            socket.emit('addRoomResult', {
                                                status: false,
                                                message: '系统出现错误'
                                            });
                                        }
                                    });
                                } else {
                                    logger.error('handleAddRoom User [findOne]: ' + JSON.stringify(err));
                                    socket.emit('addRoomResult', {
                                        status: false,
                                        message: '系统出现错误'
                                    });
                                }
                            });
                        } else {
                            logger.error('handleAddRoom Room [save]: ' + JSON.stringify(err));
                            socket.emit('addRoomResult', {
                                status: false,
                                message: '系统出现错误'
                            });
                        }
                    });
                } else {
                    socket.emit('addRoomResult', {
                        status: false,
                        message: '该房间已存在啦，你可以加入它~'
                    });
                }
            } else {
                logger.error('handleAddRoom Room [findOne]: ' + JSON.stringify(err));
                socket.emit('addRoomResult', {
                    status: false,
                    message: '系统出现错误'
                });
            }
        });
    })
};

exports.handleJoinRoom = function (io, socket) {
    socket.on('joinRoom', function (message) {
        User.findOne({username: message.username}, function (err, msg) {
            if (!err) {
                logger.info('handleJoinRoom User [findOne]: ' + JSON.stringify(msg));

                for (var i = 0; i < msg.roomlist.length; i++) {
                    if (msg.roomlist[i] == message.room) {
                        socket.emit('joinRoomResult', {
                            status: false,
                            message: '你已经加入这个房间啦~'
                        });
                        return;
                    }
                }

                msg.roomlist.push(message.room);
                var user = msg;
                Room.findOne({roomname: message.room}, function (err, msg) {
                    if(!err) {
                        logger.info('handleJoinRoom Room [findOne]: ' + JSON.stringify(msg));
                        if (msg != null) {
                            msg.usernamelist.push(message.username);

                            var _id = msg._id;
                            delete msg._id;
                            Room.update({_id: _id}, msg, function (err, msg) {
                                if(!err) {
                                    logger.info('handleJoinRoom Room [update]: ' + JSON.stringify(msg));

                                    var username = user.username;
                                    User.update({username: username}, user, function (err, msg) {
                                        if (!err) {
                                            logger.info("handleJoinRoom User [update] " + JSON.stringify(msg));
                                            socket.emit('joinRoomResult', {
                                                status: true,
                                                room: message.room
                                            });

                                            broadcastUserRoomChange(io, message.room, message.username, 'join')
                                        } else {
                                            logger.error("handleJoinRoom User [update] " + JSON.stringify(err));
                                            socket.emit('joinRoomResult', {
                                                status: false,
                                                message: '系统出现错误'
                                            });
                                        }
                                    });
                                } else {
                                    logger.error('handleJoinRoom Room [update]: ' + JSON.stringify(err));
                                    socket.emit('joinRoomResult', {
                                        status: false,
                                        message: '系统出现错误'
                                    });
                                }
                            });
                        } else {
                            socket.emit('joinRoomResult', {
                                status: false,
                                message: '这个房间好像不存在~'
                            });
                        }
                    } else {
                        logger.error('handleJoinRoom Room [findOne]: ' + JSON.stringify(err));
                        socket.emit('joinRoomResult', {
                            status: false,
                            message: '系统出现错误'
                        });
                    }
                });
            } else {
                logger.error('handleJoinRoom User [findOne]: ' + JSON.stringify(err));
                socket.emit('joinRoomResult', {
                    status: false,
                    message: '系统出现错误'
                });
            }
        });

    })
};

exports.handleLeaveRoom = function (io, socket) {
    socket.on('leaveRoom', function (message) {
        User.findOne({username: message.username}, function (err, msg) {
            if (!err) {
                logger.info('handleLeaveRoom User [findOne]: ' + JSON.stringify(msg));
                msg.roomlist.remove(message.room);
                var user = msg;

                Room.findOne({roomname: message.room}, function (err, msg) {
                    if(!err) {
                        logger.info('handleLeaveRoom Room [findOne]: ' + JSON.stringify(msg));
                        if (msg != null) {
                            msg.usernamelist.remove(message.username);

                            var _id = msg._id;
                            delete msg._id;
                            Room.update({_id: _id}, msg, function (err, msg) {
                                if(!err) {
                                    logger.info('handleLeaveRoom Room [update]: ' + JSON.stringify(msg));

                                    var user_id = user._id;
                                    delete user._id;
                                    User.update({_id: user_id}, user, function (err, msg) {
                                        if (!err) {
                                            logger.info("handleLeaveRoom User [update] " + JSON.stringify(msg));
                                            socket.emit('leaveRoomResult', {
                                                status: true,
                                                room: message.room
                                            });

                                            broadcastUserRoomChange(io, message.room, message.username, 'leave')
                                        } else {
                                            logger.error("handleLeaveRoom User [update] " + JSON.stringify(err));
                                            socket.emit('leaveRoomResult', {
                                                status: false,
                                                message: '系统出现错误'
                                            });
                                        }
                                    });
                                } else {
                                    logger.error('handleLeaveRoom Room [update]: ' + JSON.stringify(err));
                                    socket.emit('leaveRoomResult', {
                                        status: false,
                                        message: '系统出现错误'
                                    });
                                }
                            });
                        } else {
                            socket.emit('leaveRoomResult', {
                                status: false,
                                message: '这个房间好像不存在~'
                            });
                        }
                    } else {
                        logger.error('handleLeaveRoom Room [findOne]: ' + JSON.stringify(err));
                        socket.emit('leaveRoomResult', {
                            status: false,
                            message: '系统出现错误'
                        });
                    }
                });
            } else {
                logger.error('handleLeaveRoom User [findOne]: ' + JSON.stringify(err));
                socket.emit('leaveRoomResult', {
                    status: false,
                    message: '系统出现错误'
                });
            }
        });

    })
};

exports.handleGetUserJoinedRoom = function (socket) {
    socket.on('getUserJoinedRoom', function (message) {
        User.findOne({username: message.username}, function (err, msg) {
            if (!err) {
                logger.info('handleGetUserJoinedRoom User [findOne]: ' + JSON.stringify(msg));
                socket.emit('getUserJoinedRoomResult', {
                    status: true,
                    roomlist: msg.roomlist
                });
            } else {
                logger.error('handleGetUserJoinedRoom User [findOne]: ' + JSON.stringify(err));
                socket.emit('getUserJoinedRoomResult', {
                    status: false,
                    message: '系统出现错误'
                });
            }
        });

    });
};

exports.handleChangeNick = function (io, socket) {
    socket.on('changeNick', function (message) {
        User.findOne({username: message.username}, function (err, msg) {
            if (!err) {
                logger.info('changeNick User [findOne]: ' + JSON.stringify(msg));

                msg.nickname = message.newnick;
                var _id = msg._id;
                delete msg._id;

                User.update({_id: _id}, msg, function (err, msg) {
                    if (!err) {
                        logger.info("changeNick User [update] " + JSON.stringify(msg));

                        socket.emit('changeNickResult', {
                            status: true
                        });

                        broadcastUserNickChange(io, message.username, message.newnick);
                    } else {
                        logger.error("changeNick User [update] " + JSON.stringify(err));
                        socket.emit('changeNickResult', {
                            status: false,
                            message: '系统出现错误'
                        });
                    }
                });

            } else {
                logger.error('changeNick User [findOne]: ' + JSON.stringify(err));
                socket.emit('changeNickResult', {
                    status: false,
                    message: '系统出现错误'
                });
            }
        });

    });
};

exports.handleBroadcastLogin = function (io, socket) {
    socket.on('broadcastLogin', function (message) {
        console.log(JSON.stringify(message));
        broadcastUserNickChange(io, message.username, message.nickname);
    });
};

exports.handleChangePasswd = function (socket) {
    socket.on('changePasswd', function (message) {
        User.findOne({username: message.username}, function (err, msg) {
            if (!err) {
                logger.info('handleChangePasswd User [findOne]: ' + JSON.stringify(msg));

                if (msg.password == message.oldPasswd) {
                    msg.password = message.newPasswd;
                    var _id = msg._id;
                    delete msg._id;

                    User.update({_id: _id}, msg, function (err, msg) {
                        if (!err) {
                            logger.info("handleChangePasswd User [update] " + JSON.stringify(msg));

                            socket.emit('changePasswdResult', {
                                status: true
                            });
                        } else {
                            logger.error("handleChangePasswd User [update] " + JSON.stringify(err));
                            socket.emit('changePasswdResult', {
                                status: false,
                                message: '系统出现错误'
                            });
                        }
                    });
                } else {
                    socket.emit('changePasswdResult', {
                        status: false,
                        message: '你的原密码输入错误~'
                    });
                }


            } else {
                logger.error('handleChangePasswd User [findOne]: ' + JSON.stringify(err));
                socket.emit('changePasswdResult', {
                    status: false,
                    message: '系统出现错误'
                });
            }
        });

    });
};

exports.handleClientDisconnection = function (socket) {
    socket.on('disconnect', function () {
        logger.info("handleClientDisconnection: " + JSON.stringify(onlineUsers[socket.id]));
        delete onlineUsers[socket.id];
    })
};

var broadcastUserRoomChange = function (io, room, userName, change) {
    var data = {
        change: change,
        username: userName,
        room: room
    };

    io.in(room).emit('userRoomChange', data);
};

var broadcastUserNickChange = function (io, username, usernick) {
    var data = {
        username: username,
        usernick: usernick
    };

    io.sockets.emit('userNickChange', data);
};