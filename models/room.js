bdd = require("./bdd");
var async = require('async');



exports.roomList = function (callback) {
    // TO BE TESTED
    bdd.query('SELECT * FROM rooms', function(err, rows) {
	console.log(rows);
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
	    function (er, res) {
		console.log("check ",rows); 
		callback(rows);
	    }
	);
    });
}
exports.roomOwnedList = function (user, callback) {
    // TO BE IMPLEMENTED
    bdd.query('SELECT * FROM rooms WHERE `owner` = ?', [user.pseudo], function(err, rows) {
	console.log(rows);
	callback(rows);
    });
//    callback([]);
}
exports.roomCreate = function (user, roomName, callback) {
    // TO BE CHECKED
    bdd.query('INSERT INTO `rooms`(`name`, `owner`) VALUES (?, ?)', [roomName, user.pseudo], function(err, rows) {
	console.log(rows);
	callback(rows);
    });
}
exports.roomDelete = function (user, room, callback) {
    bdd.query('DELETE FROM `rooms` WHERE `id` = ?', [room.id], callback)
    // TO BE CHECKED
}
exports.roomUpdate = function (user, room, newRoom, callback) {
    bdd.query('UPDATE `rooms` SET `name`= ? WHERE `id` = ?', [room.name, room.id], callback)
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
