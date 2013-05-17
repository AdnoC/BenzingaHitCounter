var port = process.argv[2];
if(!port) {
  port = 3001;
}
var app = require('express')(),
    http = require('http'),
    server = http.createServer(app),
    io = require('socket.io').listen(server);
server.listen(port);
app.get('/', function(req, res) {
    res.sendfile(__dirname + '/index.html');
  });
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/benzinga');
var db = mongoose.connection;
var counterSchema = mongoose.Schema({
site: String,
hash: String,
nid: Number,
day: String,
count: Number
});
var Counter = mongoose.model('Counter', counterSchema);

io.sockets.on('connection', function(socket) {
    Counter.find({}, function(err, docs) {
      if(err) {
        console.log(err);
      } 
      for(var i = 0; i < docs.length; i++) {
        socket.emit('data', docs[i]);
      }
    });
  setInterval(function() {
    Counter.find({}, function(err, docs) {
      if(err) {
        console.log(err);
      } 
      for(var i = 0; i < docs.length; i++) {
        socket.emit('data', docs[i]);
      }
    });
  }, 1000*15);
});
