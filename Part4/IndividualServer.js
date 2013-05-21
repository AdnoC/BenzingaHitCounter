/**
 * This file keeps track of what pages need to be kept in memory due to them
 * being viewed.
 * It also sends page counts for those pages 
 */
exports.run = function() {
    var redis = require('redis');
    var client = redis.createClient();
    var qclient = redis.createClient();
    client.monitor();
    var port = process.argv[2];
    if(!port) {
      port = 3002;
    }
    var io = require('socket.io').listen(port);
    console.log('Listening on port 3002');


    io.sockets.on('connection', function(socket) {
        console.log('connection');
        console.log(socket.handshake.url, socket.handshake.query, socket.handshake.headers);
        var url = socket.handshake.headers['referer'];
        qclient.zincrby('LivePages', 1, url);
        qclient.zrange('RecentHitsCount', 0, -1, function(err, reply) {
            reply.forEach(function(ea, i) {
                var j = JSON.parse(ea);
                if(j['hash'] == url) {
                    console.log('Found entry, ' + j);
                    qclient.zscore('RecentHitsCount', ea, function(err, rep) {
                        console.log('Hits = ' + rep);
                        socket.emit('initial', rep);
                    });
                }
            });
        });
        client.on('monitor', function(time, args) {
            if(args[0] == 'zincrby' && args[1] == 'RecentHitsCount') {
                var j = JSON.parse(args[3]);
                console.log("COMPARE", j, url);
                if(j['hash'] == url) {
                    socket.emit('update', 1);
                }
            }
        });

        socket.on('disconnect', function(data) {
            console.log('disconection');
            qclient.zincrby('LivePages', -1, url);
            qclient.zscore('LivePages', url, function(err, reply) {
                if(reply <= 0) {//If there are no longer anyone viewing the 
                    //page count, remove the mark to keep its data in memory.
                    qclient.zrem('LivePages', url);
                }
            });
        });
    });
}
exports.run();
