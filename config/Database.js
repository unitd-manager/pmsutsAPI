var mysql = require('mysql2');
var db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'pms'
});
db.connect(); 
module.exports = db;