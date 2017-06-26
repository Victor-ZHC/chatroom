var express = require('express');
var router = express.Router();
var registerService = require('../services/registerService');
var loginService = require('../services/loginService');
var auth = require('../security/auth');
var logger = require("../logging/logger")('index');

/* GET index page. */
router.get('/', function (req, res, next) {
    logger.info("get '/' from client");
    res.render('index', {title: "Victor's 聊天室"});
});

router.get('/register', function (req, res, next) {
    logger.info("get '/register' from client");
    res.render('register', {title: "注册页"});
});

/* GET home page. */
router.get('/main', auth.authority, function (req, res, next) {
    logger.info("get '/main' from client");
    res.render('main', {title: "聊天室主页", username: req.session.username});
});

router.post('/register', function (req, res, next) {
    logger.info('post /register ' + JSON.stringify(req.body));
    var data = req.body;
    var username = data.username;
    var password = data.password;

    registerService.addUser(username, password, function (err, msg) {
        if (!err) {
            res.send({status: true, message: ''});
        } else {
            res.send({status: false, message: err});
        }
    });

});

router.post('/login', function (req, res, next) {
    logger.info('post /login from ' + JSON.stringify(req.body));
    var data = req.body;
    var username = data.username;
    var password = data.password;

    loginService.login(username, password, function (err, msg) {
        if (!err) {
            req.session.username = msg.username;
            res.send({status: true});
        } else {
            res.send({status: false, message: err});
        }
    });
});

router.get('/signout', function (req, res, next) {
    logger.info('get /signout client');
    delete req.session.username;
    res.send({status: true});
});

module.exports = router;
