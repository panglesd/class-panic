var user = require('../../models/user');
var Stats = require('../../models/stats');
var Room = require('../../models/room');
var Course = require('../../models/course');
var User = require('../../models/user');
var Question = require('../../models/question');
var Set = require('../../models/set');
var game = require('../../models/game');
var async = require('async');


module.exports = function (io) {

    let tools = {};

    tools.sendRoomQuestion = function(socket, room, callback) {
	game.questionFromRoomID(room.id, function (err, question) {
	    Room.getStatus(room, function (err, status) {
		//	    question.reponses.sort(function() { return 0.5 - Math.random() });
		if(status != "revealed" ) {
		    question.reponses.forEach((reponse) => {
			delete(reponse.validity);
			if(reponse.texted)
			    delete(reponse.correction);
		    });
		    socket.emit("newQuestion", question);
		    callback();
		}
		else {
		    game.getStatsFromRoomID(room.id, function (r,e) {
			socket.emit("newQuestion", question, e);
			callback();
		    });
		}
	    });
	});
    };
    tools.sendRoomOwnedQuestion = function (user, socket, room, callback) {
	game.questionFromRoomID(room.id, function (err, question) {
	    socket.emit("newQuestion", question);
	    callback();
	});
    };
    
    tools.sendListQuestion = function (user, socket, room, callback) {
	game.questionListForCC(user, room.id, function (err, question) {
	    socket.emit("newList", question);
	    console.log("oooooooooooooooo");
	    callback();
	});
    };

    tools.sendQuestionFromIndex = function (socket, room, index, callback)  {
	Question.getByIndexCC(index,socket.request.session.user, room.id, (err, question) => {
	    question.allResponses.forEach((rep) => {
		delete(rep.validity);
	    });
	    socket.emit("newQuestion", question);
	    callback();
	});
    };

    tools.broadcastRoomQuestion = function (room, callback) {
//	console.log("room", room);
	tools.sendRoomOwnedQuestion(null, io.of("/admin").to(room.id), room, () => {
	    tools.sendRoomQuestion(io.of("/student").to(room.id), room, () => {
		callback();
	    });
	});
    };
    
    tools.sendStats = function (socket, room, callback) {
	game.getStatsFromRoom(room.id, function (err, stats) {
	    io.of("/admin").to(room.id).emit("newStats", stats);
	});
    };
    tools.sendOwnedStats = function (room) {
	game.getStatsFromOwnedRoomID(room.id, function (err, stats) {
	    io.of("/admin").to(room.id).emit("newStats", stats);
	});
    };


    return tools;
};
