/**
 * This file is just to simulate a webserver.
 * Its only purpose is to give the browser the html and javascript file when
 * asked.
 */
exports.run = function() {
    var port = process.argv[2];
    if(!port) {
      port = 3001;
    }
    var app = require('express')(),
        http = require('http'),
        server = http.createServer(app),
        io = require('socket.io').listen(server);
    server.listen(port);
    console.log('Listening on port ' + port);
    app.get('/test.html', function(req, res) {
        res.sendfile(__dirname + '/test_page_view.html');
      });
    app.get('/page_view.js', function(req, res) {
        res.sendfile(__dirname + '/page_view.js');
    });
    app.get('/jquery-cookie-master/jquery.cookie.js', function(req, res) {
        res.sendfile(__dirname + '/jquery-cookie-master/jquery.cookie.js');
    });
}

