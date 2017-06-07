var express = require('express');
var router = express.Router();
var logger = require("../logging/logger")('index');

/* GET index page. */
// router.get('/', function (req, res, next) {
//     logger.info("get '/' from client");
//     res.render('index', {title: "Victor's 聊天室"});
// });

/* GET home page. */
router.get('/', function (req, res, next) {
    logger.info("get '/' from client");
    res.render('main', {title: "Victor's 聊天室"});
});

module.exports = router;
