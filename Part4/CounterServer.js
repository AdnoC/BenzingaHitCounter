/**
 * This file watches the path '/von-count' for requests and, upon recieving
 * a request, gets the page the request came from and updates its entry in
 * MongoDB. It also does the same with Redis, but ensures only a limited amount
 * of entries stay in Redis, removing the oldest ones when it gets too full.
 */
var hits = [],
    cache = [],
    Counter;
exports.run = function(){
    var express = require('express'); //Setting up the requisites.
    var app = express();
    app.use(express.bodyParser());
    var redis = require('redis');
    var client = redis.createClient();
    var mongoose = require('mongoose');
    mongoose.connect('mongodb://localhost/benzinga');
    var db = mongoose.connection;
    var counterSchema = mongoose.Schema({ //Setting up the mongoos model/schema system
    site: String,
    hash: String,
    nid: Number,
    day: String,
    count: Number
    });
    var REDIS_CACHE_SIZE = 100; //Number of entries allowed in Redis.
    var CACHE_FLUSH_TIMER = 30; //Number of seconds between flushing the cache.
    Counter = mongoose.model('Counter', counterSchema);
    client.on('error', function(err) {
      console.log('Error', err);
    });

    app.use('/von-count', function(req, res) { //When any http request is sent to the path /von-count...
        console.log("Regieved" + req.method);
        var nd = req.param('nid'); //Takes data from the request. Some of these were added purely for
        //help when testing and should be removed when actually deployed.
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
        var dateR = new Date(); //Getting the date
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

        var objS = JSON.stringify(obj); //Stringifies the object because Redis 
//only takes strings, not javascript obects
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
        client.zadd('RecentHits', new Date().getTime(), objS); //Add to Redis 
//with a timestamp, or update the timestamp
        client.zcard('RecentHits', function(err, reply) { //Get the number of 
//entries in the set
            client.zcard('LivePages', function(err, lpSize) { //Get the number
//of pages where the count is currently being viewed
                var totalRCS = REDIS_CACHE_SIZE + parseInt(lpSize);
                if(reply > totalRCS) { //If there are too many entries in the set
                    var excess = reply - totalRCS;
                    console.log('Too much in Redis: ' + excess);
                        client.zrange('RecentHits', 0, excess - 1, function(err, reply) {
//Get the n oldest entries, where n is the number of extra entries
                            client.zrange('LivePages', 0, -1, function(err, pages) {
//Get all the pages that have their count being viewed. If one of the entries
//match the privious query, don't remove it, otherwise romove  all the
//previously queried entried.
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
        client.zincrby('RecentHitsCount', 1, objS); //Increase the count of the page
        

        var index = indexOf(cache, obj); //Look for the page in the cache and
//increase its hit count.
        if(index != -1) {
          hits[index]++;
        } else {
          hits.push(1);
          cache.push(obj);
        }
        res.header("Access-Control-Allow-Origin", "*"); //Send an essentially 
//empty response (204 is the code for no content).
        res.send(204);
        });

    setInterval(flushCache, 1000*15); //Set the cache to be periodically flushed
//to MongoDB.
    app.listen(3000); //Set the app to listen on the port
    console.log('Listening on 3000')
}

/**
 * Just an implementation of indexOf to find the index of the object in an
 * array
 */
function indexOf(arr, obj) {
    for(var i = 0; i < arr.length; i++) {
        var ea = arr[i];
        if(ea['site'] == obj['site'] && ea['hash'] == obj['hash'] && ea['nid'] == obj['nid']) {
            return i;
        }
    }
    return -1;
}

/**
 * Empties the cache and puts its contents into MongoDB.
 */
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
    Counter.update({hash: cop[i]['hash'], nid: cop[i]['nid'], day: cop[i]['day']},{$set: cop[i], $inc: {count:hi[i]}}, {upsert: true}, function(err, numChanged, raw) { //Update the entry in
//MongoDB with the new count.
      if(err) console.log(err);
    });
    //(new Counter(cop[i])).save();
    
  }
}

exports.run();
