var redis = require('redis'),
    client = redis.createClient();
c = redis.createClient();
c.monitor();
client.zrange('RecentHitsCount', 0, -1, function(err, reply) {
    console.log(reply);
    console.log(reply.length);
    console.log(reply[0] + '\n' + reply[1]);
    reply.forEach(function(a,b){
        console.log('aaaaa');
    });
});
