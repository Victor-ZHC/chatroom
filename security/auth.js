/**
 * Created by Victor_Zhou on 2017-6-20.
 */
exports.authority = function(req, res, next){
    if (!checkAuthenticate(req)) {
        res.writeHead(200, {'Content-Type': 'text/html; charset=UTF-8'});
        var html = '<html><body><script> top.location.href="/";</script></body></html>';
        res.end(html);
    }
    else{
        if(!checkAuthority(req)){
            res.writeHead(403, {'Content-Type': 'text/html; charset=UTF-8'});
            res.end("无权访问!");
        }
        else{
            next();
        }
    }
};

var checkAuthenticate = function(req){
    if (req.session.username == undefined) {
        return false;
    }
    else{
        return true;
    }
};

var checkAuthority = function(req){
    return true;
};