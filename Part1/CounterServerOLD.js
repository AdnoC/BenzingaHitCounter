var express = require('express');
var app = express();
var mongoose = require('mongoose');
app.use(express.bodyParser());
mongoose.connect('mongodb://localhost/benzinga');
var db = mongoose.connection;
var counterSchema = mongoose.Schema({
site: String,
hash: String,
nid: Number,
day: String,
count: Number
});
var Counter = mongoose.model('Counter', counterSchema);

var cache = [];
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
    cache.push({site: st, hash: hsh, nid: nd, day: date});
        res.header("Access-Control-Allow-Origin", "*");
    res.send(204);
    });


function flushCache() {
  if(cache.length == 0){
    return;
  }
  console.log('Flushing cache');
  var cop = cache;
  cache = [];
  for(var i = 0; i < cop.length; i++) {
    console.log('Iterating cache');
    Counter.update({hash: cop[i]['hash'], nid: cop[i]['nid'], day: cop[i]['day']},{$set: cop[i], $inc: {count:1}}, {upsert: true}, function(err, numChanged, raw) {
      if(err) console.log(err);
    });
    //(new Counter(cop[i])).save();
    
  }
}

setInterval(flushCache, 1000*15);



app.listen(3000);
console.log('Listening on 3000')
