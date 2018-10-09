var bdd = require("./bdd");
var Game = require("./game");
var async = require('async');


exports. getStats = function (user, filter, callback) {

    query = 'SELECT `stats`.id ' +
	', blocID' +
	', correct' +
	', courseID' +
	', customQuestion' +
	', response' +
	', responseText' +
	', email' +
	', fullName' +
	', institution' +
	', `users`.id' +
	', promotion' +
	', pseudo' +
	', questionID' +
	', roomID' +
	', setID' +
	', studentNumber' +
	', time' +
	', userID' +
	' FROM `stats` INNER JOIN `statsBloc` ON `stats`.`blocID` = `statsBloc`.`id` INNER JOIN  `users` ON `users`.id = `stats`.userID WHERE `roomID` IN (SELECT id FROM `rooms` WHERE ownerID = ?) ';
    
    param = [user.id]
    if(filter.courseID) {
	query += " AND `roomID` IN (SELECT id FROM `rooms` WHERE courseID = ?) ";
	param.push(filter.courseID);
    }
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
	query = "INSERT INTO `statsBloc`(`setID`, `roomID`, `questionID`, `courseID`, `customQuestion`) VALUES (?,?,?,?,?); SELECT LAST_INSERT_ID() as blocID;";
	params = [        room.questionSet , roomID ,  room.id_currentQuestion, room.courseID, room.question ];
	bdd.query(query, params, (err, res) => {
	    console.log(err);
//	    console.log(err, res);
	    blocID = res[1][0].blocID;
	    Game.getStatsFromOwnedRoomID(roomID, (err, stats) => {
		async.forEach(stats.namedStats, (oneStat, callback) => {
		    query = "INSERT INTO `stats`(`userID`, `correct`, `blocID`, `response`, `responseText`) VALUES (?,?,?,?,?)";
		    bdd.query(query,[oneStat.id, oneStat.response==stats.correctAnswer ? "juste" : (oneStat.response == -1 ? "NSPP" : "faux"), blocID, oneStat.response, oneStat.responseText], (err, res) => {callback(err, res)})
		}, (err) => {
		    console.log(err);
		    callback();
		});
	    });
	});
    });
}
/*    exports.getStatsFromOwnedRoomID(roomID, (err, stats) => {
	Room.getByID(roomID, (err, room) => {
	    Set.setGet(room.questionSet, (err, set) => {
		async.forEach(stats.namedStats, (oneStat, callback) => {
		    query = "INSERT INTO `stats`(`userID`, `roomID`, `roomName`, `setID`, `setName`, `correct`, `questionType`, `question`) VALUES (?,?,?,?,?,?,?,?)";
		    bdd.query(query,[oneStat.id, room.id, JSON.stringify(room), set.id, JSON.stringify(set), oneStat.response==stats.correctAnswer ? "juste" : (oneStat.response == -1 ? "NSPP" : "faux"), /*"fromSet"*//* "set", room.question], (err, res) => {callback(err, res)})
		}, (err) => {
//		    console.log(err);
		    callback();
		});
	    });*/
//    });
//    });
    
			  
//}

