//bdd = require("bdd");



exports.setList = function (callback) {
    bdd.query('SELECT class FROM questions GROUP BY class', function(err, rows) {
	console.log(rows);
	callback(rows);
    });
}
exports.setOwnedList = function (user, callback) {
    bdd.query('SELECT class FROM questions WHERE `owner` = ? GROUP BY class', [user.pseudo], function(err, rows) {
	console.log("SET OWNED LIST !!!!!!", rows);
	callback(rows);
    });
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
