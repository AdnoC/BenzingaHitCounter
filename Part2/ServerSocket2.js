var redis = require('redis'),
    client = redis.createClient(),
    qclient = redis.createClient();
client.monitor();
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


io.sockets.on('connection', function(socket) {
    console.log('connection');
    qclient.zrange('RecentHitsCount', 0, -1, function(err, reply) {
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
    client.on('monitor', function(time, args) {
        console.log('monitor', args);
        if(args[0] == 'zincrby') {
            var j = JSON.parse(args[3]);
            socket.emit('update',j );
        } else if(args[0] == 'zrem' && args[1] == 'RecentHitsCount') {
            var j = JSON.parse(args[2]);
            socket.emit('delete', j);
        }
    });
});
