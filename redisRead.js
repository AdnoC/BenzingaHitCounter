var redis = require('redis'),
    client = redis.createClient();
client.keys('*', function(err, reply) {
    reply.forEach(function(rep, i) {
        client.type(rep, function(err, ty) {
            if(ty == 'string') {
                client.get(rep, function(err, repl) {
                    console.log(rep, repl);
                });
            } else if(ty == 'zset') {
                client.zrange(rep, 0, -1, function(err, repl) {
                    repl.forEach(function(ea, ind) {
                        client.zscore(rep, ea, function(err, re) {
                            console.log(ea, re);
                        });
                    });
                });
            }
        });
    });
});
