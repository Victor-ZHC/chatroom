/**
 * Created by Victor_Zhou on 2017-6-5.
 */
var log4js = require("log4js");
var logConfig = require("../config/logConfig.json");
var fs = require("fs");

if (!fs.existsSync(logConfig['logFilePath'])){
    fs.mkdirSync(logConfig['logFilePath']);
}

//qa config
log4js.configure(logConfig);

module.exports=function(head){
    var logger = log4js.getLogger(head);
    return logger;
};
