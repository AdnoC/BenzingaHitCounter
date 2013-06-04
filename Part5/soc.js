/**
 * This file is just to simulate a webserver.
 * Its only purpose is to give the browser the html and javascript file when
 * asked.
 */
var port = process.argv[2];
if(!port) {
  port = 3001;
}
var rt = __dirname;
var nd = rt.lastIndexOf('/');
rt = rt.substring(0, nd);

var app = require('express')(),
  http = require('http'),
  server = http.createServer(app);
  //io = require('socket.io').listen(server);
server.listen(port);
app.get('/', function(req, res) {
  res.sendfile(__dirname + '/ref.html');
});
app.get('/fer.html', function(req, res) {
  res.sendfile(__dirname + '/fer.html');
});
app.get('/pages_viewed.html', function(req, res) {
  res.sendfile(__dirname + '/pages_viewed_view.html');
});
app.get('/test.html', function(req, res) { //Give files when asked.
  res.sendfile(__dirname + '/test_page_view.html');
  });
app.get('/test2.html', function(req, res) { //Give files when asked.
  res.sendfile(__dirname + '/test_multipage_view.html');
  });
app.get('/page_view.js', function(req, res) {
  res.sendfile(__dirname + '/page_view.js');
});
app.get('/jquery-cookie-master/jquery.cookie.js', function(req, res) {
  res.sendfile(__dirname + '/jquery-cookie-master/jquery.cookie.js');
});
app.get('/hot.html', function(req, res) {
  res.sendfile(__dirname + '/test_hot_pages.html');
});
app.get('/hot_pages.js', function(req, res) {
  res.sendfile(__dirname + '/hot_pages.js');
});

app.get('/favicon.ico', function(req, res) {
  res.send(204);
});
app.use(function(req, res) {
  res.sendfile(rt + req.path);
});
