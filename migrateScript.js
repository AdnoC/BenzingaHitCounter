//Number of rows in mysql database:2,566,871
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
var Counter = mongoose.model('Counter', counterSchema);

var mysql = require('mysql');
var nConnection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'benzinga'
});
var uConnection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'benzinga'
});
nConnection.connect();
uConnection.connect();
var nQuery = nConnection.query('SELECT * FROM node_counter LIMIT 10');
nQuery.on('result', function(nRow) {
    nConnection.pause();
    var str = 'SELECT * FROM url_alias WHERE src=\'taxonomy/term/'+nRow['nid']+'\'';
    console.log(str);
    uConnection.query(str, function(err, uRow) { 
        if(err) {throw err;}
        console.log('N', nRow);
        console.log('U', uRow);

        if(uRow.length == 0) {
            console.log('------------------------------------------------------NULL-----------------------');
            uRow = {dst: ('node/'+ nRow['nid'])};
        } else {
            uRow = uRow[0];
        }
        var cont = nRow['totalcount'];

        var dateR = new Date(parseInt(nRow['timestamp']) * 1000);
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

        var nd = nRow['nid'];
        var st = 'www.benzinga.com';
        var hsh = st + '/' + uRow['dst'];

        var obj = {count: cont, date: day, nid: nd, site: st, hash: hsh};
        Counter.create(obj, function(err) {
            if(err) throw err;

            console.log(obj);

            nConnection.resume();
        });
    });
});

nConnection.end(function(err) { //Waits until communication is done before calling
//the function (then closing the connection
    console.log('ENDING');
    uConnection.destroy();
    nConnection.destroy(); //'end' was hanging on something even though it was done,
//So this makes sure the program ends
    mongoose.disconnect();
    console.log('Destroyed');
});
