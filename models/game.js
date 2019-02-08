var bdd = require("./bdd");
var async = require('async');
var Room = require("./room");
var Question = require("./question");
var User = require("./user");
var Set = require("./set");
var Course = require("./course");
var Stats = require("./stats");

var fs = require("fs");
var mkdirp = require("mkdirp");
var sanit_fn = require("sanitize-filename");

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
//	console.log("questionListForCC", rows);
	rows.forEach((row) => {
	    if(row.questionID){
		console.log(row);
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

exports.logAnswer = function(user, room, newAnswer, callback) {
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
};

exports.registerAnswer = function (user, room, newAnswer, callback) {
    Room.getByID(room.id, function (err, room) {
	User.getSubscription(user.id,room.courseID, (err, subscription) => {
	    if(!subscription.isTDMan && room.status.acceptSubm) {
		exports.logAnswer(user, room, newAnswer, callback);
	    }
	    else
		callback();
	});
    });
};

exports.logAnswerCC = function (user, room, questionIndex, newAnswer, callback) {
    console.log("newAnswer = ", newAnswer);
    async.parallel({
	set : function (callback) { Set.getByID(room.questionSet, callback); },
	question : function (callback) {
	    Question.getByIndex(questionIndex, room.id, callback);
	},
	course : function (callback) { Course.getByID(room.courseID, callback); }
    }, (err, result) => {
	let set = result.set, question = result.question, course = result.course ;
	let query = "SELECT * FROM flatStats WHERE `roomID`= ? AND `userID`= ? AND questionID = ?;" + //;
	    "SELECT * FROM flatStats WHERE `roomID`= ? AND questionID = ?";
	bdd.query(query, [room.id, user.id, question.id, room.id, question.id], function(err, answ) {
	    	    console.log("err flatStats", err);		    
	    // Si jamais on a déjà une entrée statsBloc qui correspond
	    // Et une entrée stats qui correspond
	    if(answ[1][0] && answ[0][0]) {                  
		console.log("we will update", user.id);
		// On recopie les données de fichier déjà présentes.
		let oldAnswer = answ[0][0];
		oldAnswer.response = JSON.parse(oldAnswer.response);
		console.log("oldAnswer = ", oldAnswer);
		oldAnswer.response.forEach((rep, index) => {
		    newAnswer[index].filesInfo = rep.filesInfo;
		});
		Question.correctSubmission(question, newAnswer, (err, value) => {
		    let query2 = "UPDATE `stats` SET `response` = ?,  `correct` = ? WHERE userID = ? AND blocID = ?";
		    let toLog = bdd.query(
			query2,
			[JSON.stringify(newAnswer), value, user.id, answ[1][0].blocID],
			(err, res) => { callback(err, false);}
		    );
		});
	    }
	    // Si jamais on a déjà une entrée statsBloc qui correspond
	    // Mais pas d'entrée stats qui correspond
	    else if (answ[1][0]) {
		Question.correctSubmission(question, newAnswer, (err, value) => {
		    let query2 = "INSERT INTO `stats`(`userID`, `correct`, `blocID`, `response`, `customQuestion`) VALUES (?,?,?,?,?)";     // Puis on insère un stats
		    let params2 = [user.id, value, answ[1][0].blocID, JSON.stringify(newAnswer), JSON.stringify(question)];
		    bdd.query(query2, params2, (err, res) => {
			callback(err, true);
		    });
		});
	    }
	    // Si jamais on n'a pas d'entrée statsBloc qui correspond
	    else {
		Question.correctSubmission(question, newAnswer, (err, value) => {
		    let query = "INSERT INTO `statsBloc`(`setID`,`setText`, `roomID`, `roomText`, `questionID`,`questionText`, `courseID`, `courseText`) VALUES (?,?,?,?,?,?,?,?); SELECT LAST_INSERT_ID() as blocID;";   // On commence par insérer un statsBloc
		    let params = [ set.id, JSON.stringify(set),
				   room.id, JSON.stringify(room) ,
				   question.id, JSON.stringify(question) ,
				   course.id, JSON.stringify(course) ];
		    bdd.query(query, params, (err, tabID) => {
			let blocID = tabID[1][0].blocID;
			let query2 = "INSERT INTO `stats`(`userID`, `correct`, `blocID`, `response`, `customQuestion`) VALUES (?,?,?,?,?)";     // Puis on insère un stats
			let params2 = [user.id, value, blocID, JSON.stringify(newAnswer), JSON.stringify(question)];
			bdd.query(query2, params2, (err, res) => {
			    callback(err, true);
			});
		    });
		});
	    }		    
	});
    });
};

exports.registerAnswerCC = function (user, room, questionIndex, newAnswer, callback) {
    console.log("registerAnswerCC is called");
    User.getSubscription(user.id, room.courseID, (err, subscription) => {
	console.log("err async", err);
	if(subscription && room.status.acceptSubm) {
	    exports.logAnswerCC(user, room, questionIndex, newAnswer, (err, hasCreatedNewBloc) => {
		if(hasCreatedNewBloc)
		    Stats.fillSubmissions(user.id, room.id, callback);
		else
		    callback();
	    });
	}
	else
	    callback();
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
		// GROS PROBLEME ICI, CODE TROP VIEUX POUR L'EVOLUTION IL VA FALLOIR RASSEMBLER CC ET SONDAGE DANS STATS ET STATSBLOC !
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
	// GROS PROBLEME ICI, CODE TROP VIEUX POUR L'EVOLUTION IL VA FALLOIR RASSEMBLER CC ET SONDAGE DANS STATS ET STATSBLOC !
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



exports.logFile = function(userID, roomID, questionID, n_ans, path, fileName, hash, timestamp, callback) {
    Stats.getSubmission(userID, roomID, questionID, (err, submission) => {
	let index = submission.response[n_ans].filesInfo.findIndex((fileInfo)=>{return (fileInfo.fileName == fileName);});
	console.log("index is ", index);
	if(index>=0)
	    submission.response[n_ans].filesInfo[index]={fileName:fileName, hash:hash, timestamp:timestamp};
	else
	    submission.response[n_ans].filesInfo.push({fileName:fileName, hash:hash, timestamp:timestamp});
	if(submission.response[n_ans].filesInfo.length > 0)
	    submission.response[n_ans].selected=true;
	console.log("we will save this response", submission.response);
	let query = "UPDATE `stats` SET `response` = ? WHERE id = ?";
	bdd.query(query, [JSON.stringify(submission.response), submission.statsID], (err, res) => {
	    console.log("errfromLogFile", err);
	    callback();
	});
	
    });
};

exports.removeFile = function(userID, roomID, questionID, n_ans, fileName, callback) {
    Stats.getSubmission(userID, roomID, questionID, (err, submission) => {
	let index = submission.response[n_ans].filesInfo.findIndex((fileInfo)=>{return (fileInfo.fileName == fileName);});
	console.log("index is ", index);
	if(index>=0)
	    submission.response[n_ans].filesInfo.splice(index,1);
	if(submission.response[n_ans].filesInfo.length == 0)
	    submission.response[n_ans].selected=false;
	console.log("we will save this response", submission.response[1]);
	let query = "UPDATE `stats` SET `response` = ? WHERE id = ?";
	bdd.query(query, [JSON.stringify(submission.response), submission.statsID], (err, res) => {
	    console.log("errfromRemoveFile", err);
	    callback();
	});
	
    });
};


exports.getFileFromSubmission= function(userID, room, question, answerNumber, fileName, callback) {
    Stats.getSubmission(userID, room.id, question.id, (err, subm) => {
	let path = "storage/course"+room.courseID+"/room"+room.id+"/question"+question.id+"/user"+userID+"/answer"+answerNumber+"/"+fileName;
	console.log(path);
	fs.readFile(path, callback);
    });

};
