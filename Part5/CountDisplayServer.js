/**
 * This file sends a web page that connects to this server. It sends the data
 * for the most recently viewed pages to the page, as well as any increments to
 * things in that list and any removals from the list.
 */
var confing = GLOBAL.config;
var redis = require('redis'); //Set up the requisites.
var client = redis.createClient(config.redisPort, config.redisHost); //Create two connection to Redis, because 
//queries cannot be made on a connection that is monitering.
var qclient = redis.createClient(config.redisPort, config.redisHost);

client.monitor(); //Moniter Redis for any changes.

io = require('socket.io').listen(3004);

GLOBAL.log('Listening on port ' + 3004);

io.sockets.on('connection', function(socket) { //When a connection occurs with
//socket.io
  GLOBAL.log('connection');
  qclient.zrange('PagesBeingRead', 0, -1, function(err, reply) { //Send
//the data for all the most recent pages.
    reply.forEach(function(rep, i) {
      qclient.zscore('PagesBeingRead', rep, function(err, re) {
        var j = {url: rep};
        j['count'] = parseInt(re); //count is the number of people reading, not total views
        socket.emit('data',j);
      });
    });
  }); 
  client.on('monitor', function(time, args) { //When a change occurs in Redis
    GLOBAL.log('monitor', args);
    if(args[0] == 'zincrby' && args[1] == 'PagesBeingRead') { //If it
//is an increase, send an update to increase on the page as well.
      var data = {url: args[3], count: parseInt(args[2])};
      socket.emit('update', data);
    } else if(args[0] == 'zrem' && args[1] == 'PagesBeingRead') { //If
//it is a removal, send an update to remove from the web page as well.
      socket.emit('delete', {url: args[2]});
    }
  });
});
