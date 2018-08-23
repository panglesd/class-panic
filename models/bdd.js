var mysql = require('mysql');

//Toutes les options pour le connexion à la BDD, à remplir lors de l'installation
var options = require('./../credentials.js').optionsMySQL;

var connection = mysql.createConnection(options);

connection.connect();

module.exports = connection;
