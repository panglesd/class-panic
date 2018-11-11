var bdd = require("./bdd");
var async = require('async');
var Room = require("./room");
var Question = require("./question");
var User = require("./user");
var Set = require("./set");
var Course = require("./course");
var Stats = require("./stats");

/***********************************************************************/
/*       Récupérer la question active d'une room                       */
/***********************************************************************/

exports.questionFromRoomID = function (roomID, callback) {
    bdd.query("SELECT question FROM rooms WHERE id = ?", roomID, function(err, row) {
	callback(err,JSON.parse(row[0].question));
    });
};

exports.questionListForCC = function (user, roomID, callback) {
/*    let query = 
	"SELECT enonce, questionID, questions.id as id, indexSet, questions.reponses as allResponses, statsOfUser.response as userResponse  FROM "+
	"questions LEFT OUTER JOIN "+
	"(SELECT questionID, response FROM stats INNER JOIN statsBloc ON statsBloc.id = blocID WHERE userID = ? AND roomID = ?) statsOfUser " +
	"ON statsOfUser.questionID = questions.id WHERE indexSet = ?";*/
    let query2 =
	"SELECT enonce, questionID, questions.id as id, indexSet, `statsOfUser`.response,`statsOfUser`.correct FROM"+
	" questions LEFT OUTER JOIN "+
	"(SELECT questionID, correct, response FROM stats INNER JOIN statsBloc ON "+
	"statsBloc.id = blocID WHERE userID = ? AND roomID = ?) statsOfUser "+
	"ON statsOfUser.questionID = questions.id WHERE questions.class = (SELECT questionSet FROM rooms WHERE id = ?) ORDER BY indexSet";
//    console.log("params = ", [user.id, roomID, roomID]);
    bdd.query(query2, [user.id, roomID, roomID], function(err, rows) {
	console.log(err);
	console.log("questionListForCC", rows);
	rows.forEach((row) => {
	    if(row.questionID){
		row.response = JSON.parse(row.response);
		row.answered = row.response.length > 0;
	    }
	    else
		row.answered = false;
	});
//	console.log("avant =", rows);
	callback(err, rows);
    });
};

exports.questionOwnedFromRoomID = function (user, roomID, callback) {
    bdd.query("SELECT question FROM rooms WHERE id = ? AND ownerID = ?", [roomID, user.id], function(err, row) {
	callback(err, JSON.parse(row[0].question));
    });
};

exports.questionControlledFromRoomID = function (user, roomID, callback) {
    bdd.query("SELECT question FROM rooms WHERE id = ? AND (courseID IN (SELECT courseID from subscription WHERE userID = ? AND isTDMan=1) OR courseID IN (SELECT id FROM courses WHERE ownerID = ?))", [roomID, user.id,user.id], function(err, row) {
//	console.log(this.sql);
//	console.log(row[0].question);
	callback(err, JSON.parse(row[0].question));
    });
};

/***********************************************************************/
/*       Enregistrer la réponse d'un utilisateur dans une room         */
/***********************************************************************/

exports.registerAnswer = function (user, room, newAnswer, callback) {
    Room.getByID(room.id, function (err, room) {
	User.getSubscription(user.id,room.courseID, (err, subscription) => {
	    if(!subscription.isTDMan && room.status == "pending") {
		let query = "SELECT COUNT(*) as count FROM `poll` WHERE `roomID`= ? AND `pseudo`= ?";
		bdd.query(query, [room.id, user.pseudo], function(err, answ) {
		    if(answ[0].count>0) 
			bdd.query("UPDATE `poll` SET `response`= ? WHERE `roomID`= ? AND `pseudo`= ?",
				  [JSON.stringify(newAnswer), room.id, user.pseudo],
				  callback);
		    else {
			bdd.query("INSERT INTO `poll`(`pseudo`,`response`,`roomID`) VALUES (?, ?, ?)",
				  [user.pseudo, JSON.stringify(newAnswer), room.id],
				  callback);
		    }
		});
	    }
	    else
		callback();
	});
    });
};

exports.registerAnswerCC = function (user, room, questionIndex, newAnswer, callback) {
    console.log("registerAnswerCC is called");
    Room.getByID(room.id, function (err, room) {
	async.parallel({
	    set : function (callback) { Set.getByID(room.questionSet, callback); },
	    question : function (callback) {
		Question.getByIndex(questionIndex, room.id, callback);
	    },
	    room : function (callback) { callback(null, room); },
	    subscription : function (callback) { User.getSubscription(user.id, room.courseID, callback); },
	    course : function (callback) { Course.getByID(room.courseID, callback); }
	}, (err, result) => {
	    console.log("err async", err);
	    if(result.subscription && result.room.status == "pending") {
		let query = "SELECT * FROM flatStats WHERE `roomID`= ? AND `userID`= ? AND questionID = ?";
		bdd.query(query, [result.room.id, user.id, result.question.id], function(err, answ) {
//		    console.log("err flatStats", err, answ);		    
		    if(answ[0]) {
//			console.log("result.question = ", result.question);
			let toLog = bdd.query("UPDATE `statsBloc` SET `id`= `id` WHERE `roomID`= ? AND `questionID`= ?;"+
					      "UPDATE `stats` SET `response` = ?, strategy = ?, `correct` = ? WHERE userID = ? AND blocID = ?",
					      [room.id, result.question.id, JSON.stringify(newAnswer), result.question.strategy, Question.correctSubmission(result.question, newAnswer, result.question.strategy), user.id, answ[0].blocID], (err, res) => {
//						  console.log(err, res);
						  //						  console.log(toLog.sql);
						  callback();
					      });
		    }
		    else {
			let query = "INSERT INTO `statsBloc`(`setID`,`setText`, `roomID`, `roomText`, `questionID`,`questionText`, `courseID`, `courseText`) VALUES (?,?,?,?,?,?,?,?); SELECT LAST_INSERT_ID() as blocID;";
			let params = [ result.set.id, JSON.stringify(result.set),
				       room.id, JSON.stringify(room) ,
				       result.question.id, JSON.stringify(result.question) ,
				       result.course.id, JSON.stringify(result.course) //,
				       /*JSON.stringify(result.question)*/ ];
			bdd.query(query, params, (err, tabID) => {
			    let blocID = tabID[1][0].blocID;
			    let query2 = "INSERT INTO `stats`(`userID`, `correct`, `blocID`, `response`, `strategy`, `customQuestion`) VALUES (?,?,?,?,?,?)";
			    let params2 = [user.id, Question.correctSubmission(result.question, newAnswer, result.question.strategy), blocID, JSON.stringify(newAnswer), result.question.strategy, JSON.stringify(result.question)];
//			    console.log("query2", tabID);
			    bdd.query(query2, params2, (err, res) => {
//				console.log("erreur is", err, res);
				Stats.fillSubmissions(user.id, room.id,callback);
//				callback(err, res);
			    });
			});
		    }		    
		});
	    }
	    else
		callback();
	});
    });
};

/***********************************************************************/
/*       Récupérer les statistiques d'une room                         */
/***********************************************************************/

exports.getStatsFromRoomID = function (roomID, callback) {
    bdd.query("SELECT response AS answer FROM `poll` WHERE `roomID` = ?", [roomID], function(err, row) {
	callback(err,row);
    });
};

exports.getStatsFromOwnedRoomID = function (roomID, callback) {
    bdd.query("SELECT `users`.`id`, `poll`.`pseudo`, `users`.`fullName`, `poll`.`response`  FROM `poll` INNER JOIN `users` ON `poll`.`pseudo` = `users`.`pseudo` WHERE `roomID` = ?", [roomID], function(err, row) {
	/*console.log(row);*/
	callback(err, row);
    });
};

/***********************************************************************/
/*       Passer à la question suivante d'une room                      */
/***********************************************************************/

exports.nextQuestionFromRoomID = function (roomID, callback) {
    async.waterfall([
	function(callback) {    // 1 Récupérer l'indice vers lequel on pointe,
	    bdd.query("SELECT * FROM `questions` INNER JOIN `rooms` ON `questions`.id = id_currentQuestion WHERE `rooms`.id = ?", [roomID],
		      function(err,rows) { callback(err, rows[0]);});
	},
	function(currentQ, callback) {    // 2 Voir s'il existe une question après
	    bdd.query("SELECT * FROM `questions` WHERE `class` = ? AND `indexSet` = ?", [currentQ.class, currentQ.indexSet+1], function(err, row) { callback(err, row[0], currentQ.class); });
	},
	function(nextQ, currentClass, callback) {    // 3 Sinon, chercher la première question
	    if(nextQ) 
		callback(null, nextQ);
	    else 
		bdd.query("SELECT * FROM `questions` WHERE `class` = ? AND `indexSet` = ?", [currentClass, 0], function(err, row) { callback(err, row[0]); });
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
};

/***********************************************************************/
/*       Entrer et sortir d'une room                                   */
/***********************************************************************/

// Flusher les anciens participants d'une room

exports.flushOldPlayers = function (roomID, callback) {
    bdd.query("DELETE FROM `poll` WHERE  ADDTIME(`last_activity`, '0 3:0:0')<NOW() AND `roomID` = ?", [roomID], function () {
	bdd.query("UPDATE `poll` SET `response`=\"[]\" WHERE `roomID`= ? ", [roomID], callback);
    });
};

// Partir d'une salle

exports.leaveRoom = function (user, room, callback) {
    bdd.query("DELETE FROM `poll` WHERE  `pseudo`= ? AND `roomID` = ?", [user.pseudo, room.id], callback);
};

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
};

/***********************************************************************/
/*       Passer à une question donnée                                  */
/***********************************************************************/

exports.setQuestion = function(roomID, question, callback) {
    exports.flushOldPlayers(roomID, function(err) {
	let query = "UPDATE rooms SET status = \"pending\", question = ? "+(question.id ? (", id_currentQuestion = " + question.id) : "") +" WHERE id = ?";
//	console.log(query);
	bdd.query(query, [JSON.stringify(question), roomID], function(err, res) { callback(err, res);});
    });
};

/***********************************************************************/
/*       Passer à une question donnée par son ID                       */
/***********************************************************************/

exports.setQuestionFromRoomID = function (roomID, questionID, callback) {
    Question.getByID(questionID, function(err, question) {exports.setQuestion(roomID, question, callback);});
};

/***********************************************************************/
/*       Passer d'une question custom à celle du set                   */
/***********************************************************************/

exports.backToSet = function (roomID, callback) {
    let query = "SELECT * FROM `questions` WHERE id = (SELECT id_currentQuestion FROM rooms WHERE id = ?)";
    bdd.query(query, [roomID], function (err, questionL) {
	let question = questionL[0];
	question.reponses = JSON.parse(question.reponses);
	exports.setQuestion(roomID, questionL[0], callback);
    });
};

