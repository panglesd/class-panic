var bdd = require("./bdd");
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

/*exports.list = function (callback) {
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
}*/
exports.listOfCourse = function (courseID, callback) {
    bdd.query('SELECT * FROM rooms WHERE courseID = ?', [courseID], function(err, rows) {
	if(err) throw err;
//	console.log(this.sql);
	async.parallel(
	    rows.map(
		function (room) {
		    return function (callback) {
			bdd.query('SELECT COUNT(*) as number FROM poll WHERE `roomID` = ?', [room.id], function(err, ans) {
			    bdd.query('SELECT fullName as owner FROM users WHERE `id` = ?', [room.ownerID], function(err, ans1) {
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
	callback(err, rows);
    });
}

exports.getFromOwnedCourse = function (user, courseID, callback) {
    bdd.query('SELECT * FROM rooms WHERE `ownerID` = ? AND `courseID` = ?', [user.id, courseID], function(err, rows) {
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

exports.create = function (user, newRoom, courseID, callback) {
    Question.getFirstOfSet(newRoom.questionSet, function (err, question) {
	if(err) {
	    console.log(err);
	    callback(err, null)
	}
	else {
	    if(question) 
		bdd.query('INSERT INTO `rooms`(`name`, `id_currentQuestion`, `questionSet`, `ownerID`, `status`, `question`, `courseID`) VALUES (?, ?, ?, ?, "pending", ?, ?)', [newRoom.name, question.id, newRoom.questionSet, user.id, JSON.stringify(question), courseID], function(err, rows) {
		    console.log(err);
		    console.log(this.sql);
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
    console.log([newRoom.name, newRoom.questionSet, room.id, user.id]);
    bdd.query('UPDATE `rooms` SET `name`= ?, `questionSet` = ? WHERE `id` = ? AND `ownerID` = ?',
	      [newRoom.name, newRoom.questionSet, room.id, user.id],
	      (err, res) => {
		  console.log(err, this.sql);
		  callback(err, res)
	      })
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
