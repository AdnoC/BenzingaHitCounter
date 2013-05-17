var express = require('express');
var app = express();
/*app.get('/von-count', function(req, res) {
    console.log('Recieved get');
    console.log(req.query.a);
    console.log(req.query.b);
    console.log(req.route);
    console.log(req.get('Referer'));
    res.send('Hello WOrld');
    });*/
/*app.all('/.*', function(req, res) {
    console.log('Recieved POST');
    console.log(req.get('Referer'));
    console.log(req.route);
    console.log(req.get('Host'));
    console.log(req.get('X-Pingback'));
    console.log(req.get('Origin'));
    });*/
app.use(function(req, res) {
    console.log('NEW REQUEST');
    console.log('originalUrl:', req.originalUrl);
    console.log('Referer:', req.get('Referrer'));
    console.log('Host:', req.get('Host'));
    console.log('Route', req.route);
    console.log('Origin', req.get('Origin'));
    res.header("Access-Control-Allow-Origin", "*");
    res.send("Hello!");
    });
app.listen(3000);
console.log("Listening on port 3000");
