bdd = require("./bdd");
var async = require('async');

Room = require("./room");
question = require("./question");
user = require("./user");
set = require("./set");

/***********************************************************************/
/*       Récupérer la question active d'une room                       */
/***********************************************************************/

exports.questionFromRoom = function (room, callback) {
    bdd.query("SELECT id_currentQuestion FROM `rooms` WHERE `name` = ?", [room],
	      function (err, rows) {
//		  console.log(rows);
		  bdd.query("SELECT * FROM `questions` WHERE `id` = ?", [rows[0].id_currentQuestion],
			    function (err2, rows2) {
				callback(rows2[0]);
			    });
	      });
}

/***********************************************************************/
/*       Enregistrer la réponse d'un utilisateur dans une room         */
/***********************************************************************/

exports.registerAnswer = function (user, room, newAnswer, callback) {
//    console.log(user, "now vote for", newAnswer);
    bdd.query("SELECT status FROM `rooms` WHERE `name`= ?", [room], function (err, rooms) {
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
    });    
}

/***********************************************************************/
/*       Récupérer les statistiques d'une room                         */
/***********************************************************************/

exports.getAnonStatsFromRoom = function (room, callback) {
    async.parallel(
	{
	    anonStats : function (callback) {
		bdd.query("SELECT response AS answer,COUNT(response) AS count FROM `poll` WHERE `room` = ? GROUP BY response", [room], callback);
	    },
	    correctAnswer : function (callback) {
		bdd.query("SELECT correct FROM `question` WHERE `id` = (SELECT `id_currentQuestion` FROM `rooms` WHERE `name` = ?", [room], callback);
	    }
	},
	callback);
    
}
exports.getStatsFromRoom = function (room, callback) {
    async.parallel(
	{
	    namedStats : function (callback) {
		bdd.query("SELECT `users`.`id`, `poll`.`pseudo`, `poll`.`response` FROM `poll` INNER JOIN `users` ON `poll`.`pseudo` = `users`.`pseudo` WHERE `room` = ?", [room], function(err, row) {callback(err, row)});
	    },
	    correctAnswer : function (callback) {
		bdd.query("SELECT correct FROM `questions` WHERE `id` = (SELECT `id_currentQuestion` FROM `rooms` WHERE `name` = ?)", [room], function (err, res) {callback(err, res[0].correct)});
	    }
	},
	callback);
}

/***********************************************************************/
/*       Passer à la question suivante d'une room                      */
/***********************************************************************/

exports.nextQuestionFromRoom = function (room, callback) {
    bdd.query("UPDATE `rooms` SET `id_currentQuestion` = (SELECT nextQuestion FROM `questions` WHERE `id` = (SELECT id_currentQuestion FROM (SELECT * FROM `rooms`) AS trick WHERE `name` = ?)) WHERE `name` = ?", [room, room], function (err1, rows) {
	if (err1) throw err1;
	bdd.query("DELETE FROM `poll` WHERE `last_activity`+5*60<NOW() AND `room` = ?", [room], function () {
	    bdd.query("UPDATE `poll` SET `response`=-1 WHERE `room`= ? ", [room], callback);
	});
    });
}

/***********************************************************************/
/*       Changer les statuts d'une room                                */
/***********************************************************************/

exports.setStatusForRoom = function (room, status, callback) {
    bdd.query("UPDATE `rooms` SET `status` = ? WHERE `name` = ?", [status, room], function (err, rows) {
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
