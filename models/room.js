bdd = require("./bdd");
var async = require('async');

exports.getByID = function(id, callback) {
//    console.log("id", id);
//    console.log("id has type", typeof id)
    console.log("SELECT * FROM `rooms` WHERE `id` = ?", [id]);
    bdd.query("SELECT * FROM `rooms` WHERE `id` = ?", [parseInt(id)], function (err, resu) {
	//console.log(resu);
	callback(err, resu[0])});
};

exports.getOwnedByID = function(user, id, callback) {
    console.log("id", id);
//    console.log("SELECT * FROM `rooms` WHERE `id` = ? AND `ownerID` = ?", [id, user.id]);
    bdd.query("SELECT * FROM `rooms` WHERE `id` = ? AND `ownerID` = ?", [id, user.id], function (err, resu) {
	//console.log(resu);
	callback(err, resu[0])});
};

exports.list = function (callback) {
    // TO BE TESTED
    bdd.query('SELECT * FROM rooms', function(err, rows) {
	if(err) throw err;
//	console.log(rows);
	async.parallel(
	    rows.map(
		function (room) {
		    return function (callback) {
//			console.log('SELECT COUNT(*) as number FROM poll WHERE `roomID` = ?', [room.id]);
			bdd.query('SELECT COUNT(*) as number FROM poll WHERE `roomID` = ?', [room.id], function(err, ans) {
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
exports.ownedList = function (user, callback) {
    // TO BE IMPLEMENTED
    bdd.query('SELECT `rooms`.id as id,`rooms`.`name` as name,`id_currentQuestion`, `questionSet`, `rooms`.`ownerID` as ownerID, `status`, `setDeQuestion`.name as nameSet FROM (rooms INNER JOIN setDeQuestion ON `rooms`.questionSet = `setDeQuestion`.`id`) WHERE `rooms`.`ownerID` = ?', [user.id], function(err, rows) {
//	console.log(err, rows);
	callback(rows);
    });
//    callback([]);
}
exports.create = function (user, newRoom, callback) {
    // TO BE CHECKED
    
    bdd.query('INSERT INTO `rooms`(`name`, `id_currentQuestion`, `questionSet`, `ownerID`, `status`) VALUES (?, (SELECT `firstQuestion` FROM `setDeQuestion` WHERE `id` = ?), 1, ?, "pending")', [newRoom.name, newRoom.questionSet, user.id], function(err, rows) {
//	console.log(rows);
	callback(rows);
 });
}
exports.getStatus = function (room, callback) {
    bdd.query('SELECT status FROM `rooms` WHERE `id` = ?', [room.id], function (err, r) { callback(err, r[0].status);})
    // TO BE CHECKED
}
exports.delete = function (user, room, callback) {
//    console.log('DELETE FROM `rooms` WHERE `id` = ? AND `owner` = ?', [room, user.pseudo]);
    bdd.query('DELETE FROM `rooms` WHERE `id` = ? AND `ownerID` = ?', [room, user.id], callback)
    // TO BE CHECKED
}
exports.update = function (user, room, newRoom, callback) {
    console.log('UPDATE `rooms` SET `name`= ?, `questionSet` = ? WHERE `id` = ? AND `ownerID` = ?', [newRoom.name, room.id, newRoom.questionSet, user.id]);
    bdd.query('UPDATE `rooms` SET `name`= ?, `questionSet` = ? WHERE `id` = ? AND `ownerID` = ?', [newRoom.name, newRoom.questionSet, room.id, user.id], callback)
    // TO BE CHECKED
}
exports.getByName= function (room, callback) {
    bdd.query("SELECT * FROM `rooms` WHERE `name` = ?", [room], function (err, rows) { callback(rows[0]) });
}
exports.isOwnedBy= function (room, user, callback) {
    bdd.query("SELECT * FROM `rooms` WHERE `name` = ?", [room], function (err, row) {
	callback(row[0].ownerID==user.pseudo);
    });
}


/********************************************************/
/*           Getters et setters                         */
/********************************************************/









module.export = []
