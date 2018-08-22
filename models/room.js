bdd = require("./bdd");
var async = require('async');

var Question = require("./question");

exports.getByID = function(id, callback) {
    console.log("SELECT * FROM `rooms` WHERE `id` = ?", [id]);
    bdd.query("SELECT * FROM `rooms` WHERE `id` = ?", [parseInt(id)], function (err, resu) {
	callback(err, resu[0])});
};

exports.getOwnedByID = function(user, id, callback) {
    console.log("id", id);
    bdd.query("SELECT * FROM `rooms` WHERE `id` = ? AND `ownerID` = ?", [id, user.id], function (err, resu) {
	callback(err, resu[0])});
};

exports.list = function (callback) {
    bdd.query('SELECT * FROM rooms', function(err, rows) {
	if(err) throw err;
	async.parallel(
	    rows.map(
		function (room) {
		    return function (callback) {
			bdd.query('SELECT COUNT(*) as number FROM poll WHERE `roomID` = ?', [room.id], function(err, ans) {
			    bdd.query('SELECT pseudo as owner FROM users WHERE `id` = ?', [room.ownerID], function(err, ans1) {
				room.number = ans[0].number;
				room.owner = ans1[0].owner;
				callback();
			    });
			});
		    };
		}),
	    function (err, res) {
		callback(err, rows);
	    }
	);
    });
}
exports.ownedList = function (user, callback) {
    bdd.query('SELECT `rooms`.id as id,`rooms`.`name` as name,`id_currentQuestion`, `questionSet`, `rooms`.`ownerID` as ownerID, `status`, `setDeQuestion`.name as nameSet FROM (rooms INNER JOIN setDeQuestion ON `rooms`.questionSet = `setDeQuestion`.`id`) WHERE `rooms`.`ownerID` = ?', [user.id], function(err, rows) {
	callback(rows);
    });
}
exports.create = function (user, newRoom, callback) {
    console.log(newRoom);
    Question.getFirstOfOwnedSet(user, newRoom.questionSet, function (err, question) {
	bdd.query('INSERT INTO `rooms`(`name`, `id_currentQuestion`, `questionSet`, `ownerID`, `status`) VALUES (?, ?, ?, ?, "pending")', [newRoom.name, question.id, newRoom.questionSet, user.id], function(err, rows) {
	    callback(rows);
	});
    });
}
exports.getStatus = function (room, callback) {
    bdd.query('SELECT status FROM `rooms` WHERE `id` = ?', [room.id], function (err, r) { callback(err, r[0].status);})
}
exports.delete = function (user, room, callback) {
    bdd.query('DELETE FROM `rooms` WHERE `id` = ? AND `ownerID` = ?', [room, user.id], callback)
}
exports.update = function (user, room, newRoom, callback) {
    console.log('UPDATE `rooms` SET `name`= ?, `questionSet` = ? WHERE `id` = ? AND `ownerID` = ?', [newRoom.name, room.id, newRoom.questionSet, user.id]);
    bdd.query('UPDATE `rooms` SET `name`= ?, `questionSet` = ? WHERE `id` = ? AND `ownerID` = ?', [newRoom.name, newRoom.questionSet, room.id, user.id], callback)
}
exports.getByName= function (room, callback) {
    bdd.query("SELECT * FROM `rooms` WHERE `name` = ?", [room], function (err, rows) { callback(rows[0]) });
}
exports.isOwnedBy= function (room, user, callback) {
    bdd.query("SELECT * FROM `rooms` WHERE `name` = ?", [room], function (err, row) {
	callback(row[0].ownerID==user.pseudo);
    });
}

module.export = []
