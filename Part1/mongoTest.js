var mongoose = require('mongoose/');
mongoose.connect('mongodb://localhost/test');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));
    var hitSchema = mongoose.Schema({
      url: String,
      date: Date,
      })
    var Hit = mongoose.model('Hit', hitSchema);
db.once('open', callback3);
  function callback1(){
    console.log("opened");
    var test1 = new Hit({url: 'example.com', date: new Date()});
    var test2 = new Hit({url: 'notexample.com', date: new Date()});
    console.log("Saving");
    test1.save();
    test2.save();
  }
function callback2(){
  process.stdin.resume();
  process.stdin.setEncoding('utf8');
    process.stdin.on('data', function(text) {
        text = text.substring(0, text.length - 1);
        console.log('text: ', text);
        Hit.findOne({url: text}, function(err, result) {
          if(err) {
            console.log(err);
          }
          if(!result){
            console.log("Saving");
            var test = new Hit({ url: text, date: new Date()});
            test.save();
          } else {
            console.log('Already in the db.');
            console.log(result);
          }
        });
     });
}


function callback3(){
  process.stdin.resume();
  process.stdin.setEncoding('utf8');
    process.stdin.on('data', function(text) {
        text = text.substring(0, text.length - 1);
        console.log('text: ', text);
        var update = { url: text, date: new Date()};
        Hit.update({url: text}, {$set: update}, {upsert: true}, function(err, numChanged, raw) {
          if(err) return handleError(err);
          });
     });
}
