var hits = [],
    cache = [],
    Counter;
exports.run = function(){
    var express = require('express');
    var app = express();
    app.use(express.bodyParser());
    var redis = require('redis');
    var client = redis.createClient();
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
    var REDIS_CACHE_SIZE = 100;
    Counter = mongoose.model('Counter', counterSchema);
    client.on('error', function(err) {
      console.log('Error', err);
    });

    app.use('/von-count', function(req, res) {
        console.log("Regieved" + req.method);
        var nd = req.param('nid');
        if(!nd){
          nd = null;
          }
        var st = req.param('site');
        if(!st){
          st = req.get('Origin');
        }
        var hsh = req.param('hash');
        if(!hsh){
          hsh = req.get('Referrer');
        }
        var dateR = new Date();
        var year = dateR.getUTCFullYear();
        var month = dateR.getUTCMonth();
        if(month.toString().length == 1){
          month = '0' + month;
        }
        var day = dateR.getUTCDate();
        if(day.toString().length == 0) {
          day = '0' + day;
        }
        var date = year + '-' + month + '-' + day;
        var obj = {site: st, hash: hsh, nid: nd, day: date};

        var objS = JSON.stringify(obj);
        /*client.get(objS, function(err, reply) {
          if(err) {
            console.log('Error', err);
          }
          if(!reply) {  //If it isn't in redis
            client.set(objS, '0');
          } else {
            client.incr(objS);
          }
            client.expire(objS, 60*60*24);  //Sets the key to expire in a day(24 hours)
        });*/
        client.zadd('RecentHits', new Date().getTime(), objS);
        client.zcard('RecentHits', function(err, reply) {
            client.zcard('LivePages', function(err, lpSize) {
                var totalRCS = REDIS_CACHE_SIZE + parseInt(lpSize);
                if(reply > totalRCS) {
                    var excess = reply - totalRCS;
                    console.log('Too much in Redis: ' + excess);
                        client.zrange('RecentHits', 0, excess - 1, function(err, reply) {
                            client.zrange('LivePages', 0, -1, function(err, pages) {
                                if(reply instanceof Array) {
                                    loop:
                                    for(var inde = 0; inde < reply.length; inde++){
                                        if(pages) {
                                            var jso = JSON.parse(reply[inde]);
                                            if(pages instanceof Array) {
                                                for(var pindex = 0; pindex < pages.length; pindex++) {
                                                    if(jso['hash'] == pages[pindex]) {
                                                        continue loop; //If it is in the keep alive set, don't remove
                                                    }
                                                }
                                            } else if(jso['hash'] == pages[pindex]) {
                                                    continue loop;
                                            }
                                        }
                                        client.zrem('RecentHitsCount', reply[inde]);
                                        client.zrem('RecentHits', reply[inde]);
                                    }
                                } else {
                                    if(pages) {
                                        var jso = JSON.parse(reply);
                                        if(pages instanceof Array) {
                                            for(var pindex = 0; pindex < pages.length; pindex++) {
                                                if(jso['hash'] == pages[pindex]) {
                                                    return; //If it is in the keep alive set, don't remove
                                                }
                                            }
                                        } else if(jso['hash'] == pages[pindex]) {
                                            return;
                                        }
                                    }
                                    client.zrem('RecentHitsCount', reply);
                                    client.zrem('RecentHits', reply);
                                }
                            });
                        });
                }
            });
        });
        client.zincrby('RecentHitsCount', 1, objS);
        

        var index = indexOf(cache, obj);
        if(index != -1) {
          hits[index]++;
        } else {
          hits.push(1);
          cache.push(obj);
        }
        res.header("Access-Control-Allow-Origin", "*");
        res.send(204);
        });

    setInterval(flushCache, 1000*15);
    app.listen(3000);
    console.log('Listening on 3000')
}

function indexOf(arr, obj) {
    for(var i = 0; i < arr.length; i++) {
        var ea = arr[i];
        if(ea['site'] == obj['site'] && ea['hash'] == obj['hash'] && ea['nid'] == obj['nid']) {
            return i;
        }
    }
    return -1;
}

function flushCache() {
  if(cache.length == 0){
    return;
  }
  console.log('Flushing cache');
  var cop = cache;
  cache = [];
  var hi = hits;
  hits = [];
  for(var i = 0; i < cop.length; i++) {
    console.log('Iterating cache');
    console.log('cop[i]', cop[i]);
    console.log('hi[i]', hi[i]);
    Counter.update({hash: cop[i]['hash'], nid: cop[i]['nid'], day: cop[i]['day']},{$set: cop[i], $inc: {count:hi[i]}}, {upsert: true}, function(err, numChanged, raw) {
      if(err) console.log(err);
    });
    //(new Counter(cop[i])).save();
    
  }
}

