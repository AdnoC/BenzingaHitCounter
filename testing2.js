var $ = require('jquery').create();
var URL = 'http://localhost:3000/von-count';

var bases = ['bazinga.com', 'bazinga.com','bazinga.com','google.com','google.com','google.com', 'cnn.blogosphere', 'cnn.blogosphere', 'cnn.blogosphere'];
var extensions = ['/stock', '/news', '/cool_new_things', '/images', '/maps', '/not_being_evil_TM', '/action_news', '/not_so_actiony_news', '/youve_probably_already_stopped_reading_news'];
var b = 0;
var c = 0;
var iter = 0;
var p = process.argv[2];
if(!p){
  p = 3;
}
function send(i) {
     if(i >= 2000) {
         return;
     }
     if(i%100==0){
      console.log("Mark ", i);
      }
     
      $.ajax({
        type: "POST",
        url: URL,
        data: {site: ('b'+b--), hash: ('c'+c++)},//{site: bases[i%9], hash: (bases[i%9] + extensions[i%9])},
        dataType: 'json',
//asynch: false,
//headers: {Referer: base = extension, Origin: base},
        //contentType: 'text',
        error: function(a, b, c){console.log("Error ", a.status, ' ', b, ' ', c);},
        success: function(a, b, c) {send(i + 1);}
      });
}
send(0);

