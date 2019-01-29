var bdd = require("./bdd");
var Game = require("./game");
var User = require("./user");
var Set = require("./set");
var Course = require("./course");
var Question = require("./question");
var Room = require("./room");
var async = require('async');


exports. getStats = function (filter, callback) {

    let query = 'SELECT `stats`.id ' +
	', blocID' +
	', `users`.id as userID' +
	', correct' +
	', courseID' +
	', customQuestion' +
	', response' +
	', email' +
	', fullName' +
	', institution' +
	', `users`.id' +
	', promotion' +
	', pseudo' +
	', questionID' +
	', questionText' +
	', roomID' +
	', roomText' +
	', setID' +
	', setText' +
	', studentNumber' +
	', time' +
	', userID' +
	' FROM `stats` INNER JOIN `statsBloc` ON `stats`.`blocID` = `statsBloc`.`id` INNER JOIN  `users` ON `users`.id = `stats`.userID WHERE `roomID` IN (SELECT id FROM `rooms` WHERE 1=1) ';
    
    let param = [];
    //    if(filter.courseID) {
    query += " AND `roomID` IN (SELECT id FROM `rooms` WHERE courseID = ?) ";
    param.push(filter.courseID);
    //    }
    if(filter.studentID) {
	query += " AND `userID` = ? ";
	param.push(filter.studentID);
    }
    if(filter.studentNumber) {
	query += " AND `studentNumber` = ? ";
	param.push(filter.studentNumber);
    }
    if(filter.studentName) {
	query += " AND `fullName` LIKE ? ";
	param.push("%"+filter.studentName+"%");
    }
    if(filter.questionID) {
	query += " AND `questionID` = ? ";
	param.push(filter.questionID);
    }
    if(filter.setID) {
	query += " AND `setID` = ? ";
	param.push(filter.setID);
    }

    bdd.query(query, param, function(err, rows) {
//	console.log(this.sql);
//	console.log(err, rows);
	console.log(err);
	callback(err, rows);
    });

};


/***********************************************************************/
/*       Logger les statistiques d'une room                            */
/***********************************************************************/

exports.logStats = function (roomID,  callback) {
    Room.getByID(roomID, (err, room) => {
//	console.log(room);
	async.parallel({
	    set : function (callback) { Set.getByID(room.questionSet, callback); },
	    question : function (callback) {
		if(room.question.id)
		    Question.getByID(room.question.id, callback);
		else
		    callback(null, {id:null});
	    },
	    room : function (callback) { callback(null, room); },
	    course : function (callback) { Course.getByID(room.courseID, callback); }
	}, (err, result) => {
	    let query = "INSERT INTO `statsBloc`(`setID`,`setText`, `roomID`, `roomText`, `questionID`,`questionText`, `courseID`, `courseText`) VALUES (?,?,?,?,?,?,?,?); SELECT LAST_INSERT_ID() as blocID;";
	    let params = [ result.set.id, JSON.stringify(result.set),
			   result.room.id, JSON.stringify(result.room) ,
			   result.question.id, /*JSON.stringify(result.question)*/ JSON.stringify(room.question) ,
			   result.course.id, JSON.stringify(result.course) //,
			   /*JSON.stringify(room.question)*/ ];
	    bdd.query(query, params, (err, res) => {
		console.log(err);
		let blocID = res[1][0].blocID;
		Game.getStatsFromOwnedRoomID(roomID, (err, stats) => {
		    async.forEachSeries(stats,(oneStat, callback) => {
			let query = "INSERT INTO `stats`(`userID`, `correct`, `blocID`, `response`, `strategy`, `customQuestion`, `fileInfo`) VALUES (?,?,?,?,?,?,?)";
			let params = [oneStat.id, Question.correctSubmission(room.question, oneStat.response), blocID, oneStat.response, result.question.strategy, JSON.stringify(room.question), "[]"];
			bdd.query(query,params, (err, res) => {callback(err, res);});
//			console.log("result.question.strategy = ", result.question.strategy);
		    }, (err) => {
			console.log(err);
			callback();
		    });
		});
	    });
	});
    });
};

/***********************************************************************/
/*       Récupérer la liste des réponses d'une room                    */
/***********************************************************************/

exports.studentListForCC = function(user, roomID, callback) {
    //    let query = "SELECT userID, pseudo, fullName, studentNumber FROM users INNER JOIN flatStats ON userID = `users`.id WHERE roomID = ? GROUP BY userID";
    Room.getByID(roomID, (err, room) => {
//	console.log("room = ", room);
	Course.students(room.courseID, (err, stList) => {
	    async.forEach(stList, (student, callback) => {
		exports.grade(student, roomID, (err, grade) => {
		    student.grade = grade;
		    callback();
		});
	    }, (err) => {
		callback(err, stList);		
	    });
	});
    });
};

exports.grade = function(student, roomID, callback) {
    let query = "SELECT * FROM flatStats WHERE roomID = ? AND userID = ?";
    let params = [roomID, student.id];
    bdd.query(query, params, (err, submList) => {
	let tot = 0;
	let totCoef = 0;
	submList.forEach((subm) => {
	    let cQ = JSON.parse(subm.customQuestion);
	    totCoef += parseInt(cQ.coef);
//	    console.log("totCoef = ", totCoef);
	    
	    if (tot != "unknown" && subm.correct != "unknown") {
		tot += parseFloat(subm.correct)*parseInt(cQ.coef);
//		tot += parseFloat(subm.correct)*parseInt(subm.customQuestion.coef);
//		tot += parseFloat(subm.correct);
//		console.log("subm.customQuestion.coef = ", subm.customQuestion.coef);
	    }
	    else
		tot = "unknown";
	});
//	console.log("totCoef",totCoef);
//	console.log("student",student.fullName);
	if(tot != "unknown")
//	    callback(err, (tot)/(submList.length));	
	    callback(err, (tot)/(totCoef == 0 ? 1 : totCoef));	
	else
	    callback(err, tot);	
    });
};

function tryGetSubmission(userID, roomID, questionID, callback) {
    console.log("tryGetSubmission is called");
    let query = "SELECT * FROM flatStats WHERE userID = ? AND roomID = ? AND questionID = ?";
    let params = [userID, roomID, questionID];
    let a = bdd.query(query, params, (err, res) => {
//	console.log(err, a.sql, res);
	callback(err, res[0]);
    });
};

exports.getSubmission = function(userID, roomID, questionID, callback) {
    tryGetSubmission(userID, roomID, questionID, (err, subm) => {
	if(subm) {
	    subm.customQuestion = JSON.parse(subm.customQuestion);
	    subm.response = JSON.parse(subm.response);
	    subm.customQuestion.allResponses = subm.customQuestion.reponses;

	    callback(err, subm);
	}
	else
	    exports.fillSubmissions(userID, roomID, () => {
		exports.getSubmission(userID, roomID, questionID, callback);
	    });
    });
};

exports.fillSubmissions = function(userID, roomID, callback) {
    console.log("fillSubmission is called");
//    console.log("userID = ", userID);
    User.userByID(userID, (err, user) => {
//	console.log("user111 is", user);
	Room.getByID(roomID, (err, room) => {
	    Question.listBySetID(room.questionSet, (err, qList) => {
		//		console.log("qList = ", qList);
		async.forEach(qList, (question, callback2) => {
		    tryGetSubmission(userID, roomID, question.id, (err, subm) => {
			//			console.log("subm = ", subm);
//			console.log("*********************", question);
			if(!subm){
//			    console.log("user is = ", user);
			    //			    Game.registerAnswerCC(user, room, question.indexSet, [], callback2);
			    Game.logAnswerCC(user, room, question.indexSet, [], callback2);
			}
			else
			    callback2();
		    });
		}, () => {
		    console.log("finished fillSubmission");
		    callback();
		});
	    });
	});
    });
};
// = function(userID, roomID, questionID, callback) {
exports.setValidity = function(roomID, userID, questionID, i, validity, callback) {
    exports.getSubmission(userID, roomID, questionID, (err, subm) => {
	subm.customQuestion = JSON.parse(subm.customQuestion);
//	console.log("subm = ", subm);
	
	subm.customQuestion.reponses[i].validity = validity;
	let query2 = "SELECT `statsBloc`.id FROM statsBloc INNER JOIN stats on `stats`.blocID = `statsBloc`.id WHERE roomID = ? AND userID = ? AND questionID = ?";
	let params2 = [roomID, userID, questionID];
	let validity2 = Question.correctSubmission(subm.customQuestion, JSON.parse(subm.response), subm.customQuestion.strategy);
//	console.log("validity2 = ", validity2);
	
	bdd.query(query2, params2, (err, res) => {
	    let query = "UPDATE stats SET customQuestion = ?, correct = ? WHERE blocID = ? AND userID = ?";
	    let params = [JSON.stringify(subm.customQuestion), validity2, res[0].id, userID];
	    let q = bdd.query(query, params, (err, res) => {
		if (err) {
		    console.log("err = ", err);
//		    console.log(q.sql);
		}
		callback(err, res);
	    });
	});
    });
};

exports.setStrategy = function(roomID, userID, questionID, [strategy, mark], callback) {
    exports.getSubmission(userID, roomID, questionID, (err, subm) => {
	subm.customQuestion.strategy = strategy;
	if(strategy == "manual") {
	    subm.customQuestion.mark = "" + mark;
	}
	let query2 = "SELECT `statsBloc`.id FROM statsBloc INNER JOIN stats on `stats`.blocID = `statsBloc`.id WHERE roomID = ? AND userID = ? AND questionID = ?";
	let params2 = [roomID, userID, questionID];
	let validity2 = Question.correctSubmission(subm.customQuestion, subm.response, subm.customQuestion.strategy);
//	console.log("validity2 = ", validity2);
	
	bdd.query(query2, params2, (err, res) => {
	    let query = "UPDATE stats SET customQuestion = ?, correct = ? WHERE blocID = ? AND userID = ?";
	    let params = [JSON.stringify(subm.customQuestion), validity2, res[0].id, userID];
	    let q = bdd.query(query, params, (err, res) => {
		if (err) {
		    console.log("err = ", err);
//		    console.log(q.sql);
		}
		callback(err, res);
	    });
	});
    });
};
