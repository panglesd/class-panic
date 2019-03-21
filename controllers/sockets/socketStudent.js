var user = require('../../models/user');
var Stats = require('../../models/stats');
var Room = require('../../models/room');
var Course = require('../../models/course');
var User = require('../../models/user');
var Question = require('../../models/question');
var Set = require('../../models/set');
var game = require('../../models/game');
var async = require('async');

/**************************************************************************/
/*                 Fonction pour gérer les eleves                         */
/**************************************************************************/

module.exports = function(io) {

    let tools = require('./tools.js')(io);

    io.of("/student").on('connection', function (socket) {
	/******************************************/
	/*  Middleware de socket                  */
	/******************************************/
	
	// Si on n'a pas de room défini, la seule chose qu'on peut faire c'est choisir une room
	
	socket.use(function (packet, next) {
	    if(packet[0]=="chooseRoom")
		next();
	    if(socket.roomID) {
		Room.getByID(socket.roomID, function (err, room) {
		    socket.room = room;
		    socket.room.question = socket.room.question;
		    next();
		});
	    }
	});
	
	/******************************************/
	/*  Quelqu'un a choisi une room           */
	/******************************************/
	
	socket.on('chooseRoom', function (newRoom) {
	    if (socket.room)
		socket.leave(socket.room.id);
	    Room.getByID(parseInt(newRoom), function (err, res) {
		Course.getByID(res.courseID, (er, course) => {
		    User.getSubscription(socket.request.session.user, course, (err, subscription) => {
			if(subscription) {
			    socket.room = res;
			    socket.roomID = res.id;
			    socket.join(newRoom);
			    game.enterRoom(socket.request.session.user, socket.room, function (err) {
				tools.sendOwnedStats(socket.room);
				tools.sendRoomQuestion(socket, socket.room, function () {
				    Room.getStatus(socket.room, function (err, status) {
					if(status == "revealed") {
					    game.getStatsFromRoomID(socket.room.id, function (r,e) {
						io.of("/student").to(socket.room.id).emit("correction", e);
					    });
					}
				    });
				});
			    });
			}
		    });
		});
	    });
	});
	
	/******************************************/
	/*  On me demande la question             */
	/******************************************/
	
	socket.on('sendQuestionPlease', function () {
	    tools.sendRoomQuestion(socket, socket.room, function() {});
	});
	
	/******************************************/
	/*  On m'envoie une reponse               */
	/******************************************/
	
	socket.on('chosenAnswer', function (answer) {
	    if(answer.length == 0 || socket.room.question.type == "multi")
		game.registerAnswer(socket.request.session.user, socket.room, answer, function () {
		    tools.sendOwnedStats(socket.room);
		});
	    else 
		game.registerAnswer(socket.request.session.user, socket.room, [answer[0]], function () {
		    tools.sendOwnedStats(socket.room);
		});
	});
	
	/******************************************/
	/*  On quitte la salle                    */
	/******************************************/
	
	socket.on('disconnect', function (reason) {
	    if(socket.room) {
		game.leaveRoom(socket.request.session.user, socket.room,  function (err) {
		    if (err) throw err;
		    tools.sendOwnedStats(socket.room);
		});
	    }
	});
    });
    

    
    
};
