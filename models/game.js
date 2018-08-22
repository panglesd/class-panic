bdd = require("./bdd");
var async = require('async');

Room = require("./room");
question = require("./question");
user = require("./user");
set = require("./set");

/***********************************************************************/
/*       Récupérer la question active d'une room                       */
/***********************************************************************/

exports.questionFromRoomID = function (room, callback) {
    console.log("I am with", room);
    Room.getByID(room, function (err, room) {
	Question.getByID(room.id_currentQuestion, function (err, row) { callback(err, row) }); 
    });
}

exports.questionOwnedFromRoomID = function (user, room, callback) {
    console.log("I am with", room);
    Room.getOwnedByID(user, room, function (err, room) {
	console.log("next step", room);
	Question.getOwnedByID(user, room.id_currentQuestion, function (err, row) { console.log("devrait etre", row);callback(err, row) }); 
    });
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
//    console.log(user, "now vote for", newAnswer);
/*    bdd.query("SELECT status FROM `rooms` WHERE `name`= ?", [room], function (err, rooms) {
	if(rooms[0].status=="pending") {
	    bdd.query("SELECT COUNT(*) as count FROM `poll` WHERE `room`= ? AND `pseudo`= ?", [room, user.pseudo], function(err, answ) {
		if(answ[0].count>0) 
		    bdd.query("UPDATE `poll` SET `response`= ? WHERE `room`= ? AND `pseudo`= ?", [newAnswer, room, user.pseudo], callback);
		else {
		    bdd.query("INSERT INTO `poll`(`pseudo`,`response`,`room`) VALUES (?, ?, ?)", [user.pseudo, newAnswer, room], callback);
		}
	    });
	}
	else
	    callback();
    });    */
}

/***********************************************************************/
/*       Récupérer les statistiques d'une room                         */
/***********************************************************************/

exports.getAnonStatsFromRoom = function (room, callback) {
    async.parallel(
	{
	    anonStats : function (callback) {
		bdd.query("SELECT response AS answer,COUNT(response) AS count FROM `poll` WHERE `roomID` = ? GROUP BY response", [room], function(err, row) {callback(err,row)});
	    },
	    correctAnswer : function (callback) {
		bdd.query("SELECT correct FROM `question2` WHERE `id` = (SELECT `id_currentQuestion` FROM `rooms` WHERE `id` = ?)", [room], function(a,b) {callback(a,b[0].correct);});
	    }
	},
	callback);
    
}
exports.getStatsFromRoom = function (room, callback) {
    async.parallel(
	{
	    namedStats : function (callback) {
		bdd.query("SELECT `users`.`id`, `poll`.`pseudo`, `poll`.`response` FROM `poll` INNER JOIN `users` ON `poll`.`pseudo` = `users`.`pseudo` WHERE `roomID` = ?", [room], function(err, row) {callback(err, row)});
	    },
	    correctAnswer : function (callback) {
		bdd.query("SELECT correct FROM `question2` WHERE `id` = (SELECT `id_currentQuestion` FROM `rooms` WHERE `id` = ?)", [room], function (err, res) {callback(err, res[0].correct)});
	    }
	},
	callback);
}

/***********************************************************************/
/*       Passer à la question suivante d'une room                      */
/***********************************************************************/

exports.nextQuestionFromRoom = function (room, callback) {
    bdd.query(
	"UPDATE `rooms` SET \
        `id_currentQuestion` = (SELECT id FROM `question2` WHERE \
                                   `class` = (SELECT questionSet FROM (SELECT * FROM `rooms`) AS trick WHERE id = ?)    \
                               AND `indexSet` > (SELECT indexSet FROM `question2` WHERE \
                                                   id = (SELECT id_currentQuestion FROM (SELECT * FROM `rooms`) AS trick WHERE id = ?)\
                                                )  \
                               ORDER BY indexSet LIMIT 1\
                               )\
         WHERE `id` = ?", [room.id, room.id, room.id], function (err1, rows) {
	     if (err1) {
		 bdd.query(
		     "UPDATE `rooms` SET \
                        `id_currentQuestion` = (SELECT id FROM `question2` WHERE \
                                   `class` = (SELECT questionSet FROM (SELECT * FROM `rooms`) AS trick WHERE id = ?)    \
                               AND `indexSet` = 0 \
                               )\
                       WHERE `id` = ?", [room.id, room.id], function (err1, rows) {
			   if (err1) throw err1;
		       });
	     }
	     exports.flushOldPlayers(room, callback);
	 });
}
/***********************************************************************/
/*       Flusher les anciens participants d'une room                   */
/***********************************************************************/

exports.flushOldPlayers = function (room, callback) {
    console.log("rromid", room.id);
    bdd.query("DELETE FROM `poll` WHERE  ADDTIME(`last_activity`, '0 0:0:10')<NOW() AND `roomID` = ?", [room.id], function () {
	bdd.query("UPDATE `poll` SET `response`=-1 WHERE `roomID`= ? ", [room.id], callback);
    });
}

/***********************************************************************/
/*       Passer à une question donnée                                  */
/***********************************************************************/

exports.setQuestionFromRoom = function (room, questionID, callback) {
    bdd.query(
	"UPDATE `rooms` SET \
        `id_currentQuestion` = (SELECT id FROM `question2` WHERE \
                                   `class` = (SELECT questionSet FROM (SELECT * FROM `rooms`) AS trick WHERE id = ?)    \
                                    AND `id` = ? \
                               )\
         WHERE `id` = ?", [room.id, questionID, room.id], function (err1, rows) {
	     if (err1) throw err1;
	     bdd.query("DELETE FROM `poll` WHERE ADDTIME(`last_activity`,'0 3:0:0')<NOW() AND `roomID` = ?", [room.id], function () {
		 bdd.query("UPDATE `poll` SET `response`=-1 WHERE `roomID`= ? ", [room.id], callback);
	     });
	 });
}

/***********************************************************************/
/*       Changer les statuts d'une room                                */
/***********************************************************************/

exports.setStatusForRoom = function (room, status, callback) {
    bdd.query("UPDATE `rooms` SET `status` = ? WHERE `id` = ?", [status, room.id], function (err, rows) {
	callback();
    });
}

/***********************************************************************/
/*       Trouver la question suivante d'une room                       */
/***********************************************************************/

/*exports.findNextQuestion = function (idCurrentQuestion, setId, owner, callback) {
    console.log("pour trouver le prochain id");
    console.log("SELECT * FROM `questions` WHERE `id` > ? AND `class` = ? AND `owner` = ? ORDER BY `id` LIMIT 1;",
		[                              idCurrentQuestion,     setId,          owner ]);
    bdd.query("SELECT * FROM `questions` WHERE `id` > ? AND `class` = ? AND `owner` = ? ORDER BY `id` LIMIT 1;",
	      [                              idCurrentQuestion,     setId,           owner ], 
	      function (err3, newNextQuestion) {
		  console.log("resultat", err3, newNextQuestion);
		  if(newNextQuestion[0]) {
		      callback(newNextQuestion[0].id);
		  }
		  else
		      bdd.query("SELECT * FROM `questions` WHERE `class` = ? AND `owner`= ? ORDER BY `id` LIMIT 1;",
				[                                        setId,        owner ],
				function(err4, newNextQuestion) {
				    return callback(newNextQuestion[0].id);
				});
	      });
}

    
*/
