var bdd = require("./bdd");
var Game = require("./game");
var Set = require("./set");
var Course = require("./course");
var Question = require("./question");
var Room = require("./room");
var async = require('async');


exports. getStats = function (filter, callback) {

    query = 'SELECT `stats`.id ' +
	', blocID' +
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
    
    param = []
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

}


/***********************************************************************/
/*       Logger les statistiques d'une room                            */
/***********************************************************************/

exports.logStats = function (roomID,  callback) {
    Room.getByID(roomID, (err, room) => {
	console.log(room);
	async.parallel({
	    set : function (callback) { Set.getByID(room.questionSet, callback) },
	    question : function (callback) { Question.getByID(JSON.parse(room.question).id, callback) },
	    room : function (callback) { callback(null, room) },
	    course : function (callback) { Course.getByID(room.courseID, callback) }
	}, (err, result) => {
	    query = "INSERT INTO `statsBloc`(`setID`,`setText`, `roomID`, `roomText`, `questionID`,`questionText`, `courseID`, `courseText`, `customQuestion`) VALUES (?,?,?,?,?,?,?,?,?); SELECT LAST_INSERT_ID() as blocID;";
	    params = [ result.set.id, JSON.stringify(result.set),
		       result.room.id, JSON.stringify(result.room) ,
		       result.question.id, JSON.stringify(result.question) ,
		       result.course.id, JSON.stringify(result.course) ,
		       room.question ];
	    bdd.query(query, params, (err, res) => {
		console.log(err);
		blocID = res[1][0].blocID;
		Game.getStatsFromOwnedRoomID(roomID, (err, stats) => {
		    async.forEachSeries(stats,(oneStat, callback) => {
			query = "INSERT INTO `stats`(`userID`, `correct`, `blocID`, `response`) VALUES (?,?,?,?)";
			bdd.query(query,[oneStat.id, Question.correctSubmission(JSON.parse(room.question), oneStat.reponse), blocID, JSON.stringify(oneStat.response)], (err, res) => {callback(err, res)})
		    }, (err) => {
			console.log(err);
			callback();
		    });
		});
	    });
	});
    });
}

