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

var mysql = require('mysql'); //Set up MySQL
var nConnection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'benzinga'
});
var uConnection = mysql.createConnection({ //2 connections are used because I don't
//want to load all 2 million rows into node all at once, and you cannot query
//the database on the same connection as you are streaming rows.
    host: 'localhost',
    user: 'root',
    database: 'benzinga'
});
nConnection.connect();
uConnection.connect();
var nQuery = nConnection.query('SELECT * FROM node_counter LIMIT 10'); // Begin
//the query, getting rows from node_counter. //Remove "LIMIT 10" to have it 
//transfer the whole database.
nQuery.on('result', function(nRow) { //Begin the syntax for streaming query rows.
    nConnection.pause(); //Pause the connection while its working on each individual
//row.
    var str = 'SELECT * FROM url_alias WHERE src=\'taxonomy/term/'+nRow['nid']+'\'';
    console.log(str);
    uConnection.query(str, function(err, uRow) { //Get the rows from url_alias 
//that go with the nid
        if(err) {throw err;}
        console.log('N', nRow);
        console.log('U', uRow);

        if(uRow.length == 0) { //If no rows matched
            console.log('------------------------------------------------------NULL-----------------------');
            uRow = {dst: ('node/'+ nRow['nid'])}; //Set dst to a value.
        } else {
            uRow = uRow[0]; //Else only use the first result from the query. Arrays
//Are always returned from the query, even if they only have one element.
        }
        var cont = nRow['totalcount']; //Get values for each of the fields for Mongo.

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
        Counter.create(obj, function(err) { //Save the object, and once its done
            if(err) throw err;

            console.log(obj);

            nConnection.resume(); //Continue onto the next row.
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
