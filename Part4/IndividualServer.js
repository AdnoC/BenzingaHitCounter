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
    var mongoose = require('mongoose');
    var Counter = mongoose.model('Counter');
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
        Counter.find({hash: url}, 'count', function(err, docs) { //Send the number
//of view for the page for each date.
            console.log('FOUND DOCS', docs);
            docs.forEach(function(ea, i) {
                console.log("SENDING COUNT OF " + ea['count']);
                socket.emit('initial', ea['count']);
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
