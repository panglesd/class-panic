bdd = require("./bdd");
var async = require('async');

var Question = require("./question");

/***********************************************************************/
/*       Getters pour les cours                                        */
/***********************************************************************/

// By ID

exports.getByID = function(courseID, callback) {
    bdd.query("SELECT * FROM `courses` WHERE `id` = ?", [courseID], function (err, resu) {
	callback(err, resu[0])});
};

exports.getOwnedByID = function(user, courseID, callback) {
    query = "SELECT * FROM `courses` WHERE `id` = ? AND `ownerID` = ?";
    console.log(query, courseID, user.id);
    bdd.query(query, [courseID, user.id], function (err, resu) {
	console.log(err, resu);
	callback(err, resu[0])});
};

/***********************************************************************/
/*       Getters pour les cours : suite                                */
/***********************************************************************/

// By ID

exports.subscribedCourses = function (user, callback) {
    query = "SELECT * FROM courses INNER JOIN subscription ON courseID = `courses`.`id` INNER JOIN users ON `courses`.`ownerID` = `users`.`id` WHERE userID = ?";
    bdd.query(query, [user.id], function(err, rows) {
	callback(err, rows);
    })
}

exports.ownedList = function (user, callback) {
    bdd.query('SELECT * FROM courses WHERE `ownerID` = ?', [user.id], function(err, rows) {
	callback(err, rows);
    });
}

// By Name

exports.getByName= function (courseName, callback) {
    bdd.query("SELECT * FROM `courses` WHERE `name` = ?", [courseName], function (err, rows) { callback(rows[0]) });
}

exports.students = function(user, courseID, callback) {
    query = "SELECT * FROM subscription INNER JOIN users ON userID= users.id WHERE courseID = ? ORDER BY fullName";
    bdd.query(query, [courseID], callback);
}



/***********************************************************************/
/*       Gestion des inscriptions                                      */
/***********************************************************************/

exports.students = function(user, courseID, callback) {
    query = "SELECT * FROM subscription INNER JOIN users ON userID = users.id WHERE courseID = ? ORDER BY fullName";
    console.log(query, courseID);
    bdd.query(query, [courseID], (err, res) => {
	console.log('this sql', this.sql);
	callback(err, res);
    });
}

exports.subscribeStudent = function(studentID, courseID, callback) {
    query = "INSERT INTO subscription(courseID, userID) VALUES (?,?) ON DUPLICATE KEY UPDATE courseID = courseID";
    bdd.query(query, [courseID, studentID], (err, res) => {console.log(err, res);callback(err, res)});
}
exports.unSubscribeStudent = function(studentID, courseID, callback) {
    query = "DELETE FROM subscription WHERE courseID = ? AND userID = ?";
    bdd.query(query, [courseID, studentID], (err, res) => {console.log(err, res);callback(err, res)});
}


/***********************************************************************/
/*       Gestion CRUD des courses                                      */
/***********************************************************************/

// Create

exports.create = function (user, newCourse, callback) {
    bdd.query('INSERT INTO `courses`(`name`, `ownerID`, `commentaire`) VALUES (?, ?, ?)', [newCourse.name, user.id, newCourse.commentaire], function(err, rows) {
	callback(err, rows);
    });
}
/*
// Delete

exports.delete = function (user, room, callback) {
    bdd.query('DELETE FROM `rooms` WHERE `id` = ? AND `ownerID` = ?', [room, user.id], callback)
}

//Update

exports.update = function (user, room, newRoom, callback) {
    bdd.query('UPDATE `rooms` SET `name`= ?, `questionSet` = ? WHERE `id` = ? AND `ownerID` = ?', [newRoom.name, newRoom.questionSet, room.id, user.id], callback)
}
*/
/***********************************************************************/
/*       Statuts et appartenance                                       */
/***********************************************************************/
/*
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
*/
module.export = []
