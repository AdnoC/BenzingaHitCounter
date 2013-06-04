/**
 * This file keeps track of what pages need to be kept in memory due to them
 * being viewed.
 * It also sends page counts for those pages 
 */
var redis = require('redis');
var client = redis.createClient(config.redisPort, config.redisHost);
var qclient = redis.createClient(config.redisPort, config.redisHost);
client.monitor();
var mongoose = require('mongoose'); //Get mongoose and the Counter model.
var Counter = mongoose.model('Counter');
var io = GLOBAL.io;//require('socket.io').listen(config.viewCountPort);
io.set('log level', 2);

io.sockets.on('connection', function(socket) {
  GLOBAL.log('connection');
  GLOBAL.log(socket.handshake.url, socket.handshake.query, socket.handshake.headers);
  var url = socket.handshake.headers['referer'];
  qclient.zincrby('PagesBeingRead', 1, url);

  socket.on('verified', function(data) {
    if(!data){
//      data = url;
        console.error('No data sent to socket.io from url: ' + url);
    }
    var searchObj;
    //Test if an integer was sent
    if(/^\d+$/.test(data)){ //If it was, look for the nid
        searchObj = {nid: parseInt(data)};
    } else { //Else search for the url
        searchObj = {hash: data};
    }

    qclient.zincrby('PagesCountViewedOn', 1, data);
    GLOBAL.log('Verified, added page count viewed');
    Counter.find(searchObj, 'count', function(err, docs) { //Send the number
  //of view for the page for each date.
      GLOBAL.log('FOUND DOCS', docs);
      docs.forEach(function(ea, i) {
        ea['hash'] = data;
        GLOBAL.log("SENDING COUNT OF " + ea['count']);
        socket.emit('initial', ea);
      });
    });
    client.on('monitor', function(time, args) {
      if(args[0] == 'zincrby' && args[1] == 'RecentHitsCount') {
        var j = JSON.parse(args[3]);
        GLOBAL.log("COMPARE", j, url);
        if(j['hash'] == data) {
          j['count'] = 1;
          socket.emit('update', j);
        }
      }
    });

    socket.on('disconnect', function(data) {
      GLOBAL.log('disconection');
      qclient.zincrby('PagesCountViewedOn', -1, data);
      qclient.zscore('PagesCountViewedOn', data, function(err, reply) {
        if(reply <= 0) {//If there are no longer anyone viewing the 
          //page count, remove the mark to keep its data in memory.
          qclient.zrem('PagesCountViewedOn', data);
        }
      });
    });
  });
  socket.on('disconnect', function(data) {
    GLOBAL.log('disconection');
    qclient.zincrby('PagesBeingRead', -1, url);
    qclient.zscore('PagesBeingRead', url, function(err, reply) {
      if(reply <= 0) {//If there are no longer anyone viewing the 
        //page count, remove the mark to keep its data in memory.
        qclient.zrem('PagesBeingRead', url);
      }
    });
  });
});
