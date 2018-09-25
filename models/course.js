bdd = require("./bdd");
var async = require('async');

var Question = require("./question");

/***********************************************************************/
/*       Getters pour les rooms : individu                             */
/***********************************************************************/

// By ID

exports.getByID = function(roomID, callback) {
    bdd.query("SELECT * FROM `rooms` WHERE `id` = ?", [roomID], function (err, resu) {
	callback(err, resu[0])});
};

exports.getOwnedByID = function(user, roomID, callback) {
    bdd.query("SELECT * FROM `rooms` WHERE `id` = ? AND `ownerID` = ?", [roomID, user.id], function (err, resu) {
	callback(err, resu[0])});
};

/***********************************************************************/
/*       Getters pour les rooms : listes                               */
/***********************************************************************/

// By ID

exports.subscribedCourses = function (user, callback) {
    query = "SELECT * FROM courses INNER JOIN subscription ON coursID = `courses`.`id` INNER JOIN users ON `courses`.`ownerID` = `users`.`id` WHERE userID = ?";
    bdd.query(query, [user.id], function(err, rows) {
	callback(err, rows);
    })
}

exports.ownedList = function (user, callback) {
    bdd.query('SELECT `rooms`.id as id,`rooms`.`name` as name,`id_currentQuestion`, `questionSet`, `rooms`.`ownerID` as ownerID, `status`, `setDeQuestion`.name as nameSet FROM (rooms INNER JOIN setDeQuestion ON `rooms`.questionSet = `setDeQuestion`.`id`) WHERE `rooms`.`ownerID` = ?', [user.id], function(err, rows) {
	callback(err, rows);
    });
}

// By Name

exports.getByName= function (room, callback) {
    bdd.query("SELECT * FROM `rooms` WHERE `name` = ?", [room], function (err, rows) { callback(rows[0]) });
}

/***********************************************************************/
/*       Gestion CRUD des rooms                                        */
/***********************************************************************/

// Create

exports.create = function (user, newRoom, callback) {
    Question.getFirstOfOwnedSet(user, newRoom.questionSet, function (err, question) {
	if(err)
	    callback(err, null)
	else {
	    if(question) 
		bdd.query('INSERT INTO `rooms`(`name`, `id_currentQuestion`, `questionSet`, `ownerID`, `status`, `question`) VALUES (?, ?, ?, ?, "pending", ?)', [newRoom.name, question.id, newRoom.questionSet, user.id, JSON.stringify(question)], function(err, rows) {
		    callback(err, rows);
		});
	    else 
		callback(err);
	}
    });
}

// Delete

exports.delete = function (user, room, callback) {
    bdd.query('DELETE FROM `rooms` WHERE `id` = ? AND `ownerID` = ?', [room, user.id], callback)
}

//Update

exports.update = function (user, room, newRoom, callback) {
    bdd.query('UPDATE `rooms` SET `name`= ?, `questionSet` = ? WHERE `id` = ? AND `ownerID` = ?', [newRoom.name, newRoom.questionSet, room.id, user.id], callback)
}

/***********************************************************************/
/*       Statuts et appartenance                                       */
/***********************************************************************/

exports.getStatus = function (room, callback) {
    bdd.query('SELECT status FROM `rooms` WHERE `id` = ?', [room.id], function (err, r) { callback(err, r[0].status);})
}

exports.isOwnedBy= function (room, user, callback) {
    bdd.query("SELECT * FROM `rooms` WHERE `name` = ?", [room], function (err, row) {
	callback(row[0].ownerID==user.pseudo);
    });
}

exports.setStatusForRoomID = function (roomID, status, callback) {
    bdd.query("UPDATE `rooms` SET `status` = ? WHERE `id` = ?", [status, roomID], function (err, rows) {
	callback();
    });
}

module.export = []
