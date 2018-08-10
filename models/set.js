bdd = require("./bdd");
Question = require('./question');


exports.setList = function (callback) {
    bdd.query('SELECT * FROM setDeQuestion', function(err, rows) {
//	console.log(rows);
	callback(err, rows);
    });
}
exports.setOwnedList = function (user, callback) {
    bdd.query('SELECT * FROM setDeQuestion WHERE `owner` = ?', [user.id], function(err, rows) {
//	console.log("SET OWNED LIST !!!!!!", rows);
	callback(err, rows);
    });
}
exports.setGet = function (user, id, callback) {
    bdd.query('SELECT * FROM setDeQuestion WHERE `owner` = ? AND `id` = ?', [user.id, id], function(err, rows) {
//	console.log("SET OWNED LIST !!!!!!", rows);
	callback(err, rows[0]);
    });
    // TO BE IMPLEMENTED
}
exports.setCreate = function (user, set, callback) {
    bdd.query("INSERT INTO `setDeQuestion`(`name`, `owner`) VALUES (?, ?); SELECT * FROM `setDeQuestion` WHERE `id` = LAST_INSERT_ID();", [set.name , user.id], function(err, rows) {
	callback(err, rows[1][0]);
    });
}
exports.setDelete = function (user, set, callback) {
    bdd.query("DELETE FROM `setDeQuestion` WHERE `id` = ? AND `owner` = ?", [set.id, user.id], function (err, row) {
//	console.log(err);
	callback(err, row);
    });
}
exports.setUpdate = function (user, set, newSet, callback) {
    // TO BE IMPLEMENTED
}


//module.export = []
