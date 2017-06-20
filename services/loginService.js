/**
 * Created by Victor_Zhou on 2017-6-20.
 */
var User = require('../module/user');
var logger = require("../logging/logger")('loginService');

exports.login = function (username, password, cb) {

    User.findOne({username: username}, function (err, msg) {
        if(!err) {
            logger.info('login user[find]: ' + JSON.stringify(msg));
            if (msg != null) {
                if(msg.password == password) {
                    cb(null, msg);
                } else {
                    cb('用户名或密码有一个输错了！', null);
                }
            } else {
                cb('用户名或密码有一个输错了！', null);
            }
        } else {
            logger.error('login user[find]: ' + JSON.stringify(err));
            cb('系统出现错误，请重试...', null);
        }
    });

};