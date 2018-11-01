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
			let query = "INSERT INTO `stats`(`userID`, `correct`, `blocID`, `response`, `strategy`, `customQuestion`) VALUES (?,?,?,?,?,?)";
			let params = [oneStat.id, Question.correctSubmission(room.question, oneStat.response), blocID, oneStat.response, result.question.strategy, JSON.stringify(room.question)];
			bdd.query(query,params, (err, res) => {callback(err, res);});
			console.log("result.question.strategy = ", result.question.strategy);
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
	console.log("room = ", room);
	Course.students(room.courseID, (err, stList) => {
	    callback(err, stList);
	});
//	callback(err, []);
    });
//    let params = [roomID];
//    bdd.query(query, params, (err, rows) => {
//	console.log(err, rows);
//	callback(err, rows);
//    });
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
	if(subm)
	    callback(err, subm);
	else
	    exports.fillSubmissions(userID, roomID, () => {
		exports.getSubmission(userID, roomID, questionID, callback);
	    });
    });
};

exports.fillSubmissions = function(userID, roomID, callback) {
    console.log("fillSubmission is called");
    console.log("userID = ", userID);
    User.userByID(userID, (err, user) => {
	console.log("user111 is", user);
	Room.getByID(roomID, (err, room) => {
//	    console.log("room = ", room);
	    Question.listBySetID(room.questionSet, (err, qList) => {
//		console.log("qList = ", qList);
		async.forEach(qList, (question, callback2) => {
		    tryGetSubmission(userID, roomID, question.id, (err, subm) => {
//			console.log("subm = ", subm);

			if(!subm){
			    console.log("user is = ", user);
			    Game.registerAnswerCC(user, room, question.indexSet, [], callback2);
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
	console.log("subm = ", subm);
	
	subm.customQuestion.reponses[i].validity = validity;
	let query2 = "SELECT `statsBloc`.id FROM statsBloc INNER JOIN stats on `stats`.blocID = `statsBloc`.id WHERE roomID = ? AND userID = ? AND questionID = ?";
	let params2 = [roomID, userID, questionID];
	bdd.query(query2, params2, (err, res) => {
	    let query = "UPDATE stats SET customQuestion = ? WHERE blocID = ?";
	    let params = [JSON.stringify(subm.customQuestion), res[0].id];
	    let q = bdd.query(query, params, (err, res) => {
		if (err) {
		    console.log("err = ", err);
		    console.log(q.sql);
		}
		callback(err, res);
	    });
	});
    });
};
