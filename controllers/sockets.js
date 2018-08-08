var user = require('../models/user');
var room = require('../models/room');
var set = require('../models/set');
var game = require('../models/game');
var async = require('async');



module.exports = function (server) {

//    var socket_io    = require( "socket.io" );
    var io = require('socket.io')(server);
    // Socket.io
//    var io           = socket_io();
    /**************************************************************************/
    /*                 Utilitaires d'envoi                                    */
    /**************************************************************************/

    function sendRoomQuestion(room, socket) {
	game.questionFromRoom(room, function (question) {
	    socket.emit("question", question);
	});
    }

    function sendStats(room) {
	game.getStatsFromRoom(room, function (err, stats) {
	    io.of("/admin").to(room).emit("newStats", stats)
	});
    }

    /**************************************************************************/
    /*                 Fonction pour gérer les eleves                         */
    /**************************************************************************/

    io.on('connection', function (socket) {

	/******************************************/
	/*  Quelqu'un a choisi une room           */
	/******************************************/

	socket.on('chooseRoom', function (newRoom) {
	    socket.leave(socket.room);
	    socket.room=newRoom;
	    socket.join(newRoom);
//	    console.log("socket has joined room", newRoom, "!");
	    setTimeout(function () {console.log("socket is now in room", socket.rooms, "!");},1000);
	    game.questionFromRoom(socket.room, function (question) {
		socket.emit("newQuestion", question);
	    });
	});

	/******************************************/
	/*  On me demande la question             */
	/******************************************/

	socket.on('sendQuestionPlease', function () {
	    game.questionFromRoom(socket.room, function (question) {
		socket.emit("newQuestion", question);
	    });
	});

	/******************************************/
	/*  On m'envoie une reponse               */
	/******************************************/

	socket.on('chosenAnswer', function (answer) {
//	    console.log("jai une reponse");
	    game.registerAnswer(socket.request.session.user, socket.room, answer, function () {
		sendStats(socket.room)
	    });
	});
    });

    /**************************************************************************/
    /*                 Fonction pour gérer les admins                         */
    /**************************************************************************/

    io.of('/admin').on('connection', function(socket) {

	/******************************************/
	/*  On a choisi la room a administrer     */
	/******************************************/

	socket.on('chooseRoom', function (newRoom) {
	    if(socket.request.session) {
		room.roomIsOwnedBy(newRoom, socket.request.session.user, function(owned) {
		    if(owned) {
			socket.leave(socket.room);
			socket.room=newRoom;
			socket.join(newRoom);
//			console.log("admin socket has joined room", newRoom, "!");
			game.questionFromRoom(socket.room, function (question) {
			    socket.emit("newQuestion", question);
			});
			sendStats(socket.room);
		    }
		});
	    }
	    else {
		socket.room=newRoom;
		socket.join(newRoom);
//		console.log("admin socket has joined room", newRoom, "!");
		game.questionFromRoom(socket.room, function (question) {
		    socket.emit("newQuestion", question);
		});
	    }
	});

	/******************************************/
	/*  On souhaite diffuser les resultats    */
	/******************************************/

	socket.on('revealResults', function () {
//	    console.log("should emit to", socket.room, "the correction");
	    game.getAnonStatsFromRoom(socket.room, function (r,e) {
		console.log(r,e);
		io.to(socket.room).emit("correction", e);
		game.setStatusForRoom(socket.room, "revealed", function () {});
	    });
	    
	});
	
	/******************************************/
	/*  On souhaite changer le set            */
	/******************************************/

	socket.on('changeSet', function (set) {
	    //TO BE IMPLEMENTED
	});

	/******************************************/
	/*  On souhaite passer à la question suivante */
	/******************************************/

	socket.on('changeQuestionPlease', function (nextQuestion) {
	    game.nextQuestionFromRoom(socket.room, function () {
		game.questionFromRoom(socket.room, function (question) {
		    io.to(socket.room).emit("newQuestion", question);
		    io.of('/admin').to(socket.room).emit("newQuestion", question);
		    game.setStatusForRoom(socket.room, "pending", function () {sendStats(socket.room);});
		});
	    })

	    //TO BE IMPLEMENTED
	});

	/******************************************/
	/*  On m'envoie l'id de la prochaine question*/
	/******************************************/

	socket.on('chosenNextQuestion', function () {
	    game.registerAnswer(socket.request.session.user, socket.room, answer, function () {
		// TO IMPLEMENT!!!!!!
	    });
	});
    });

    return io;
};

