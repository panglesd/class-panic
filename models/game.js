bdd = require("./bdd");
var async = require('async');

Room = require("./room");
Question = require("./question");
User = require("./user");
Set = require("./set");

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

/***********************************************************************/
/*       Enregistrer la réponse d'un utilisateur dans une room         */
/***********************************************************************/

exports.registerAnswer = function (user, room, newAnswer, callback) {
    Room.getByID(room.id, function (err, room) {
	if(room.status=="pending") {
	    bdd.query("SELECT COUNT(*) as count FROM `poll` WHERE `roomID`= ? AND `pseudo`= ?", [room.id, user.pseudo], function(err, answ) {
		if(answ[0].count>0) 
		    bdd.query("UPDATE `poll` SET `response`= ? WHERE `roomID`= ? AND `pseudo`= ?", [newAnswer, room.id, user.pseudo], callback);
		else {
		    bdd.query("INSERT INTO `poll`(`pseudo`,`response`,`roomID`) VALUES (?, ?, ?)", [user.pseudo, newAnswer, room.id], callback);
		}
	    });
	}
	else
	    callback();
    });
}

/***********************************************************************/
/*       Récupérer les statistiques d'une room                         */
/***********************************************************************/

exports.getStatsFromRoomID = function (roomID, callback) {
    async.parallel(
	{
	    anonStats : function (callback) {
		bdd.query("SELECT response AS answer,COUNT(response) AS count FROM `poll` WHERE `roomID` = ? AND `poll`.`pseudo` != (SELECT pseudo FROM users WHERE id = (SELECT ownerID FROM rooms WHERE `id` = ?)) GROUP BY response", [roomID, roomID], function(err, row) {callback(err,row)});
	    },
	    correctAnswer : function (callback) {
		exports.questionFromRoomID(roomID, function (err, q) { callback(err, q.correct)});
	    }
	},
	callback);
    
}
exports.getStatsFromOwnedRoomID = function (roomID, callback) {
    async.parallel(
	{
	    namedStats : function (callback) {
		bdd.query("SELECT `users`.`id`, `poll`.`pseudo`, `poll`.`response` FROM `poll` INNER JOIN `users` ON `poll`.`pseudo` = `users`.`pseudo` WHERE `roomID` = ? AND `poll`.`pseudo` != (SELECT pseudo FROM users WHERE id = (SELECT ownerID FROM rooms WHERE `id` = ?)) ", [roomID, roomID], function(err, row) {callback(err, row)});
	    },
	    correctAnswer : function (callback) {
		exports.questionFromRoomID(roomID, function (err, q) { callback(err, q.correct)});
	    }
	},
	callback);
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
	bdd.query("UPDATE `poll` SET `response`=-1 WHERE `roomID`= ? ", [roomID], callback);
    });
}

// Partir d'une salle

exports.leaveRoom = function (user, room, callback) {
    bdd.query("DELETE FROM `poll` WHERE  `pseudo`= ? AND `roomID` = ?", [user.pseudo, room.id], callback);
}

// Entrer dans une salle

exports.enterRoom = function (user, room, callback) {
    bdd.query("INSERT INTO `poll` (`pseudo`, `response`,`roomID`) VALUES(?, -1, ?) ON DUPLICATE KEY UPDATE `response`=`response` ", [user.pseudo, room.id], callback);
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

