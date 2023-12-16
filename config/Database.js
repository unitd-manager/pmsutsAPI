var mysql = require('mysql');
// var db = mysql.createConnection({
//     host: 'localhost',
//     user: 'smart',
//     password: 'yNNbZXYBxCdnwPG6',
//     database: 'smart'
// });
var db = mysql.createConnection({
    host: 'localhost',
    user: 'pmsuts',
    password: 'KR4jAeXwwJ2XRwtn',
    database: 'pmsuts'
});

db.connect(); 
module.exports = db;