/**
 * Created by Victor_Zhou on 2017-6-20.
 */
var User = require('../module/user');
var logger = require("../logging/logger")('registerService');

exports.addUser = function (username, password, cb) {
    var user = new User({
        username: username,
        password: password,
        nickname: username
    });

    User.findOne({username: username}, function (err, msg) {
        if(!err) {
            logger.info('addUser user[find]: ' + JSON.stringify(msg));
            if (msg == null) {
                user.save(function (err, msg) {
                    if(!err) {
                        logger.info('addUser user[save]: ' + JSON.stringify(msg));
                        cb(null, msg);
                    } else {
                        logger.error('addUser user[save]: ' + JSON.stringify(err));
                        cb('系统出现错误，请重试...', null);
                    }
                });
            } else {
                cb('你起的名字重复啦!', null);
            }
        } else {
            logger.error('addUser user[find]: ' + JSON.stringify(err));
            cb('系统出现错误，请重试...', null);
        }
    });

};