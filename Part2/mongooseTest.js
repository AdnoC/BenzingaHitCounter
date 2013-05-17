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
Counter.find({}, function(err, docs) {
  if(err) {
    console.log(err);
  } 
  console.log('length', docs.length);
  for(var i = 0; i < docs.length; i++) {
    console.log('data', docs[i]);
  }
 });
