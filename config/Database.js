var mysql = require('mysql');
var db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'pmsuts'
});
db.connect(); 
module.exports = db;