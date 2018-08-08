bdd = require("./bdd");



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
    // TO BE IMPLEMENTED
}
exports.setDelete = function (user, set, callback) {
    // TO BE IMPLEMENTED
}
exports.setUpdate = function (user, set, newSet, callback) {
    // TO BE IMPLEMENTED
}


module.export = []
