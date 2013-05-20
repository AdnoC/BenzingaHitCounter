var client = require('redis').createClient();
var cli1 = false;
var cli2 = false;
client.zremrangebyrank('RecentHits', 0, -1);
client.zremrangebyrank('RecentHitsCount', 0, -1);
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
var Counter = mongoose.model('Counter', counterSchema);
var c = new Counter();
c.collection.drop();
client.quit();
