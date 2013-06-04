/**
 * This file sends a web page that connects to this server. It sends the data
 * for the most recently viewed pages to the page, as well as any increments to
 * things in that list and any removals from the list.
 */
exports.run = function(){
  var redis = require('redis'); //Set up the requisites.
  var client = redis.createClient(); //Create two connection to Redis, because 
//queries cannot be made on a connection that is monitering.
  var qclient = redis.createClient();

  client.monitor(); //Moniter Redis for any changes.
  var port = process.argv[2];
  if(!port) {
  port = 3003;
  }
  var app = require('express')(),
  http = require('http'),
  server = http.createServer(app),
  io = require('socket.io').listen(server);
  server.listen(port);
  console.log('Listening on port ' + port);
  app.get('/', function(req, res) { //When a get request comes, send a copy of 
//the webpage.
  res.sendfile(__dirname + '/total_view.html');
  });


  io.sockets.on('connection', function(socket) { //When a connection occurs with
//socket.io
  console.log('connection');
  qclient.zrange('RecentHitsCount', 0, -1, function(err, reply) { //Send
//the data for all the most recent pages.
    reply.forEach(function(rep, i) {
    console.log('fr');
    qclient.zscore('RecentHitsCount', rep, function(err, re) {
      console.log('zsc');
      var j = JSON.parse(rep);
      console.log('jprs');
      j['count'] = re;
      socket.emit('data',j);
    });console.log('aaa');
    });
  }); 
  client.on('monitor', function(time, args) { //When a change occurs in Redis
    console.log('monitor', args);
    if(args[0] == 'zincrby' && args[1] == 'RecentHitsCount') { //If it
//is an increase, send an update to increase on the page as well.
    var j = JSON.parse(args[3]);
    socket.emit('update',j );
    } else if(args[0] == 'zrem' && args[1] == 'RecentHitsCount') { //If
//it is a removal, send an update to remove from the web page as well.
    var j = JSON.parse(args[2]);
    socket.emit('delete', j);
    }
  });
  });
}
exports.run();
