bdd = require("./bdd");
var async = require('async');

exports.roomGetFromID = function(id, callback) {
    bdd.query("SELECT * FROM `rooms` WHERE `id` = ?", [id], function (err, resu) {callback(err, resu[0])});
};

exports.roomList = function (callback) {
    // TO BE TESTED
    bdd.query('SELECT * FROM rooms', function(err, rows) {
	if(err) throw err;
//	console.log(rows);
	async.parallel(
	    rows.map(
		function (room) {
		    return function (callback) {
			bdd.query('SELECT COUNT(*) as number FROM poll WHERE `room` = ?', [room.name], function(err, ans) {
			    room.number = ans[0].number;
			    callback();
			});
		    };
		}),
	    function (err, res) {
//		console.log("check ",rows); 
		callback(err, rows);
	    }
	);
    });
}
exports.roomOwnedList = function (user, callback) {
    // TO BE IMPLEMENTED
    bdd.query('SELECT `rooms`.id as id,`rooms`.`name` as name,`id_currentQuestion`, `questionSet`, `rooms`.`owner` as owner, `status`, `setDeQuestion`.name as nameSet FROM (rooms INNER JOIN setDeQuestion ON `rooms`.questionSet = `setDeQuestion`.`id`) WHERE `rooms`.`owner` = ?', [user.pseudo], function(err, rows) {
	console.log(err, rows);
	callback(rows);
    });
//    callback([]);
}
exports.roomCreate = function (user, newRoom, callback) {
    // TO BE CHECKED
    
    bdd.query('INSERT INTO `rooms`(`name`, `id_currentQuestion`, `questionSet`, `owner`, `status`) VALUES (?, (SELECT `firstQuestion` FROM `setDeQuestion` WHERE `id` = ?), 1, ?, "pending")', [newRoom.name, newRoom.questionSet, user.pseudo], function(err, rows) {
//	console.log(rows);
	callback(rows);
 });
}
exports.getStatus = function (room, callback) {
    bdd.query('SELECT status FROM `rooms` WHERE `name` = ?', [room], function (err, r) { callback(err, r[0].status);})
    // TO BE CHECKED
}
exports.roomDelete = function (user, room, callback) {
//    console.log('DELETE FROM `rooms` WHERE `id` = ? AND `owner` = ?', [room, user.pseudo]);
    bdd.query('DELETE FROM `rooms` WHERE `id` = ? AND `owner` = ?', [room, user.pseudo], callback)
    // TO BE CHECKED
}
exports.roomUpdate = function (user, room, newRoom, callback) {
    console.log('UPDATE `rooms` SET `name`= ?, `questionSet` = ? WHERE `id` = ? AND `owner` = ?', [newRoom.name, room.id, newRoom.questionSet, user.pseudo]);
    bdd.query('UPDATE `rooms` SET `name`= ?, `questionSet` = ? WHERE `id` = ? AND `owner` = ?', [newRoom.name, newRoom.questionSet, room.id, user.pseudo], callback)
    // TO BE CHECKED
}
exports.roomGetByName= function (room, callback) {
    bdd.query("SELECT * FROM `rooms` WHERE `name` = ?", [room], function (err, rows) { callback(rows[0]) });
}
exports.roomIsOwnedBy= function (room, user, callback) {
    bdd.query("SELECT * FROM `rooms` WHERE `name` = ?", [room], function (err, row) {
	callback(row[0].owner==user.pseudo);
    });
}

module.export = []
