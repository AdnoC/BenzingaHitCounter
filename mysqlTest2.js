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
        nConnection.resume();
    });
});

nConnection.end(function(err) {
    uConnection.end();
});
