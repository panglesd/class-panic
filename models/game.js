var bdd = require("./bdd");
var async = require('async');

var Room = require("./room");
var Question = require("./question");
var User = require("./user");
var Set = require("./set");
var Course = require("./course");

/***********************************************************************/
/*       Récupérer la question active d'une room                       */
/***********************************************************************/

exports.questionFromRoomID = function (roomID, callback) {
    bdd.query("SELECT question FROM rooms WHERE id = ?", roomID, function(err, row) {
	callback(err,JSON.parse(row[0].question))
    });
}

exports.questionOwnedFromRoomID = function (user, roomID, callback) {
    bdd.query("SELECT question FROM rooms WHERE id = ? AND ownerID = ?", [roomID, user.id], function(err, row) { callback(err, JSON.parse(row[0].question))})
}

exports.questionControlledFromRoomID = function (user, roomID, callback) {
    bdd.query("SELECT question FROM rooms WHERE id = ? AND (courseID IN (SELECT courseID from subscription WHERE userID = ? AND isTDMan=1) OR courseID IN (SELECT id FROM courses WHERE ownerID = ?))", [roomID, user.id,user.id], function(err, row) { console.log(this.sql);console.log(row[0].question);callback(err, JSON.parse(row[0].question))})
}

/***********************************************************************/
/*       Enregistrer la réponse d'un utilisateur dans une room         */
/***********************************************************************/

exports.registerAnswer = function (user, room, newAnswer, callback) {
    Room.getByID(room.id, function (err, room) {
	bdd.query("SELECT * from subscription WHERE userID = ? AND courseID = (SELECT courseID FROM rooms WHERE id = ?)", [user.id, room.id], (err_subs, subs_array) => {
	    subscription = subs_array[0];
	    console.log(err_subs);
	    if(!subscription.isTDMan && room.status == "pending") {
		bdd.query("SELECT COUNT(*) as count FROM `poll` WHERE `roomID`= ? AND `pseudo`= ?", [room.id, user.pseudo], function(err, answ) {
		    if(answ[0].count>0) 
			bdd.query("UPDATE `poll` SET `response`= ? WHERE `roomID`= ? AND `pseudo`= ?", [JSON.stringify(newAnswer), room.id, user.pseudo], callback);
		    else {
			bdd.query("INSERT INTO `poll`(`pseudo`,`response`,`roomID`) VALUES (?, ?, ?)", [user.pseudo, JSON.stringify(newAnswer), room.id], callback);
		    }
		});
	    }
	    else
		callback();
	});
    });
}

/***********************************************************************/
/*       Récupérer les statistiques d'une room                         */
/***********************************************************************/

exports.getStatsFromRoomID = function (roomID, callback) {
    bdd.query("SELECT response AS answer FROM `poll` WHERE `roomID` = ?", [roomID], function(err, row) {
	callback(err,row)
    });
}

exports.getStatsFromOwnedRoomID = function (roomID, callback) {
    bdd.query("SELECT `users`.`id`, `poll`.`pseudo`, `users`.`fullName`, `poll`.`response`, `poll`.`responseText`  FROM `poll` INNER JOIN `users` ON `poll`.`pseudo` = `users`.`pseudo` WHERE `roomID` = ?", [roomID], function(err, row) {
	/*console.log(row);*/
	callback(err, row)
    });
}

/***********************************************************************/
/*       Passer à la question suivante d'une room                      */
/***********************************************************************/

exports.nextQuestionFromRoomID = function (roomID, callback) {
    async.waterfall([
	function(callback) {    // 1 Récupérer l'indice vers lequel on pointe,
	    bdd.query("SELECT * FROM `questions` INNER JOIN `rooms` ON `questions`.id = id_currentQuestion WHERE `rooms`.id = ?", [roomID],
		      function(err,rows) { callback(err, rows[0])});
	},
	function(currentQ, callback) {    // 2 Voir s'il existe une question après
	    bdd.query("SELECT * FROM `questions` WHERE `class` = ? AND `indexSet` = ?", [currentQ.class, currentQ.indexSet+1], function(err, row) { callback(err, row[0], currentQ.class) })
	},
	function(nextQ, currentClass, callback) {    // 3 Sinon, chercher la première question
	    if(nextQ) 
		callback(null, nextQ);
	    else 
		bdd.query("SELECT * FROM `questions` WHERE `class` = ? AND `indexSet` = ?", [currentClass, 0], function(err, row) { callback(err, row[0]) })
	},
	function(nextQ, callback) {    // 4 Updater la room
	    nextQ.reponses = JSON.parse(nextQ.reponses);
	    bdd.query("UPDATE `rooms` SET `id_currentQuestion` = ?, `question` = ? WHERE id = ?", [nextQ.id, JSON.stringify(nextQ), roomID], function(err) {
		Room.setStatusForRoomID(roomID, "pending", function() {
		    exports.flushOldPlayers(roomID, callback);
		});
	    });
	}
    ],
		    function(err, res){ callback(err);}
		   );
}

/***********************************************************************/
/*       Entrer et sortir d'une room                                   */
/***********************************************************************/

// Flusher les anciens participants d'une room

exports.flushOldPlayers = function (roomID, callback) {
    bdd.query("DELETE FROM `poll` WHERE  ADDTIME(`last_activity`, '0 3:0:0')<NOW() AND `roomID` = ?", [roomID], function () {
	bdd.query("UPDATE `poll` SET `response`=\"[]\" WHERE `roomID`= ? ", [roomID], callback);
    });
}

// Partir d'une salle

exports.leaveRoom = function (user, room, callback) {
    bdd.query("DELETE FROM `poll` WHERE  `pseudo`= ? AND `roomID` = ?", [user.pseudo, room.id], callback);
}

// Entrer dans une salle

exports.enterRoom = function (user, room, callback) {
    Course.getByID(room.courseID, (err_course, course) => {
	User.getSubscription(user, course, (err_subs, subscription) => {
	    if(!subscription.isTDMan) {
		//    if(room.ownerID != user.id) 
		bdd.query("INSERT INTO `poll` (`pseudo`, `response`,`roomID`) VALUES(?, \"[]\", ?) ON DUPLICATE KEY UPDATE `response`=`response` ", [user.pseudo, room.id], callback);
	    }
	    else
		callback();
	});
    });
}

/***********************************************************************/
/*       Passer à une question donnée                                  */
/***********************************************************************/

exports.setQuestion = function(roomID, question, callback) {
    exports.flushOldPlayers(roomID, function(err) {
	query = "UPDATE rooms SET status = \"pending\", question = ? "+(question.id ? (", id_currentQuestion = " + question.id) : "") +" WHERE id = ?";
//	console.log(query);
	bdd.query(query, [JSON.stringify(question), roomID], function(err, res) { callback(err, res);});
    });
}

/***********************************************************************/
/*       Passer à une question donnée par son ID                       */
/***********************************************************************/

exports.setQuestionFromRoomID = function (roomID, questionID, callback) {
    Question.getByID(questionID, function(err, question) {exports.setQuestion(roomID, question, callback)});
}

/***********************************************************************/
/*       Passer d'une question custom à celle du set                   */
/***********************************************************************/

exports.backToSet = function (roomID, callback) {
    query = "SELECT * FROM `questions` WHERE id = (SELECT id_currentQuestion FROM rooms WHERE id = ?)";
    bdd.query(query, [roomID], function (err, questionL) {
	question = questionL[0];
	question.reponses = JSON.parse(question.reponses);
	exports.setQuestion(roomID, questionL[0], callback);
    });
}

