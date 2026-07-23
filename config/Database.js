var mysql = require('mysql2');
var db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'pmsuts'
});
db.connect(); 
module.exports = db;