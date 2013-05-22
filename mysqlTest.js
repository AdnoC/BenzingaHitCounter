var mysql = require('mysql');
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    multipleStatements: true,
    database: 'benzinga'
});
connection.connect();
connection.query('SELECT * from url_alias LIMIT 5; SELECT * FROM node_counter LIMIT 5;', function(err, rows, fields) {
    rows.forEach(function(ea, i) {
        console.log(ea);
    });
    fields.forEach(function(ea, i) {
        console.log(ea);
    });
});
connection.end();
