var bdd = require("./bdd");
var async = require('async');
var exports ;
var Question = require("./question");

/***********************************************************************/
/*       Getters pour les cours                                        */
/***********************************************************************/

// By ID

exports.getByID = function(courseID, callback) {
    bdd.query("SELECT * FROM `courses` WHERE `id` = ?", [courseID], function (err, resu) {
	callback(err, resu[0]);
    });
};


exports.getOwnedByID = function(user, courseID, callback) {
    let query = "SELECT * FROM `courses` WHERE `id` = ? AND `ownerID` = ?";
    bdd.query(query, [courseID, user.id], function (err, resu) {
	if(err)	console.log(err);
	callback(err, resu[0]);
    });
};

/***********************************************************************/
/*       Getters pour les cours : suite                                */
/***********************************************************************/

// By ID

exports.subscribedCourses = function (user, callback) {
    let query = "SELECT * FROM courses WHERE id IN (SELECT courseID FROM subscription WHERE userID = ?) OR ownerID = ?";
    bdd.query(query, [user.id, user.id], function(err, rows) {
	callback(err, rows);
    });
};

exports.subscribedAsTDMan = function (user, callback) {
    let query = "SELECT * FROM courses WHERE id IN (SELECT courseID FROM subscription WHERE isTDMan = 1 AND userID = ?)";
    bdd.query(query, [user.id], function(err, rows) {
	if(err) console.log(err);
	callback(err, rows);
    });
};

/*exports.getSubscription = function (user, courseID, callback) {
    query = "SELECT * FROM courses INNER JOIN subscription ON courseID = `courses`.`id` INNER JOIN users ON `courses`.`ownerID` = `users`.`id` WHERE userID = ? AND courseID = ?";
    bdd.query(query, [user.id, courseID], function(err, rows) {
	callback(err, rows[0]);
    })
}*/

exports.ownedList = function (user, callback) {
    bdd.query('SELECT * FROM courses WHERE `ownerID` = ?', [user.id], function(err, rows) {
	callback(err, rows);
    });
};

// By Name

exports.getByName= function (courseName, callback) {
    bdd.query("SELECT * FROM `courses` WHERE `name` = ?", [courseName], function (err, rows) { callback(rows[0]); });
};



/***********************************************************************/
/*       Gestion des inscriptions                                      */
/***********************************************************************/

exports.students = function(courseID, callback) {
    let query = "SELECT * FROM subscription INNER JOIN users ON userID = users.id WHERE courseID = ? ORDER BY fullName";
    bdd.query(query, [courseID], (err, res) => {
	if(err) console.log(err);
	callback(err, res);
    });
};

exports.subscribeStudent = function(studentID, courseID, callback) {
    let query = "INSERT INTO subscription(courseID, userID, `isTDMan`, `canRoomCreate`, `canRoomUpdate`, `canRoomDelete`, `canSetUpdate`, `canSetCreate`, `canSetDelete`, `canSubscribe`, `canOwnRoom`, `canAllRoom`, `canOwnSet`, `canAllSet`, `canAddDocs`) VALUES (?,?, 0,0,0,0,0,0,0,0,0,0,0,0,0) ON DUPLICATE KEY UPDATE courseID = courseID";
    bdd.query(query, [courseID, studentID], (err, res) => {if(err) console.log(err, res); callback(err, res);});
};
exports.subscribeTDMan = function(studentID, courseID, permission, callback) {
    let query = "INSERT INTO subscription(courseID, userID, canOwnRoom, canAllRoom, canOwnSet, canAllSet, canSubscribe, isTDMan) VALUES (?, ?, ?, ?, ?, ?, ?, 1 ) ON DUPLICATE KEY UPDATE isTDMan = 1 , canOwnRoom = ? , canAllRoom = ? , canownSet = ? , canAllSet = ? , canSubscribe = ? ";
    let params = [courseID, studentID,
	      permission.canOwnRoom,
	      permission.canAllRoom,
	      permission.canOwnSet,
	      permission.canAllSet,
	      permission.canSubscribe,
	      permission.canOwnRoom,
	      permission.canAllRoom,
	      permission.canOwnSet,
	      permission.canAllSet,
	      permission.canSubscribe
	     ];
    bdd.query(query, params, (err, res) => {
	if(err)
	    console.log(err);
	callback(err, res);});
};
exports.unSubscribeStudent = function(studentID, courseID, callback) {
    let query = "DELETE FROM subscription WHERE courseID = ? AND userID = ?";
    bdd.query(query, [courseID, studentID], (err, res) => {if(err) console.log(err, res);callback(err, res);});
}


/***********************************************************************/
/*       Gestion CRUD des courses                                      */
/***********************************************************************/

// Create

exports.create = function (user, newCourse, callback) {
    bdd.query('INSERT INTO `courses`(`name`, `ownerID`, `commentaire`) VALUES (?, ?, ?)', [newCourse.name, user.id, newCourse.commentaire], function(err, rows) {
	callback(err, rows);
    });
};

// Delete

exports.delete = function (user, courseID, callback) {
    bdd.query('DELETE FROM `courses` WHERE `id` = ? AND `ownerID` = ?', [courseID, user.id], callback);
};

//Update

exports.update = function (user, courseID, newCourse, callback) {
    bdd.query('UPDATE `courses` SET `name`= ?, `commentaire` = ? WHERE `id` = ? AND `ownerID` = ?', [newCourse.name, newCourse.commentaire, courseID, user.id], callback);
};


module.export = [];
