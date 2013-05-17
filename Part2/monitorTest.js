var redis = require('redis'),
    client = redis.createClient();
var util = require('util');

client.monitor(function(err, res) {
    console.log('entering monitoring mode');
});
client.on('monitor', function(time, args) {
    console.log(time + ': ' + util.inspect(args));
    console.log(args[0] + ' :: ' + args[1]);
});
