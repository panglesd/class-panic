var mysql = require('mysql');
var options = require('./../credentials.js').optionsMySQL;
var connection = mysql.createConnection(options);


connection.connect();

module.exports = connection;
