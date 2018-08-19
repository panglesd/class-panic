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
	game.getStatsFromRoom(room.id, function (err, stats) {
	    io.of("/admin").to(room.id).emit("newStats", stats)
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
	    if (socket.room)
		socket.leave(socket.room.id);
	    room.getByID(parseInt(newRoom), function (err, res) {
		socket.room = res;
		socket.join(newRoom);
//		setTimeout(function () {console.log("socket is now in room", socket.room.name, "!");},1000);
		game.questionFromRoomID(socket.room.id, function (err, question) {
		    socket.emit("newQuestion", question);
		    room.getStatus(socket.room, function (err, status) {
//			console.log(status);
			if(status == "revealed") {
			    game.getAnonStatsFromRoom(socket.room.id, function (r,e) {
				io.to(socket.room.id).emit("correction", e);
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
	    if (socket.room)
		socket.leave(socket.room.id);
	    room.getOwnedByID(socket.request.session.user, parseInt(newRoom), function (err, res) {
		socket.room = res;
		socket.join(socket.room.id);
//		console.log("admin socket has joined room", newRoom, "!");
		game.questionOwnedFromRoomID(socket.request.session.user, socket.room.id, function (err, question) {
//		    console.log("fromadmin", question);
		    socket.emit("newQuestion", question);
		});
		sendStats(socket.room);
	    });
	});

	/******************************************/
	/*  On souhaite diffuser les resultats    */
	/******************************************/

	socket.on('revealResults', function () {
	    console.log("should emit to", socket.room.id, "the correction");
	    game.getAnonStatsFromRoom(socket.room.id, function (r,e) {
		io.to(socket.room.id).emit("correction", e);
		game.setStatusForRoom(socket.room, "revealed", function () {});
	    });	    
	});

	/******************************************/
	/*  On souhaite aller direct à une question*/
	/******************************************/

	socket.on('changeToQuestion', function (i) {
	    console.log("on souhaite changer à la question", i)
	    game.setQuestionFromRoom(socket.room, parseInt(i), function () {
		game.questionFromRoomID(socket.room.id, function (err, question) {
//		    console.log("had", question);
		    io.to(socket.room.id).emit("newQuestion", question);
		    io.of('/admin').to(socket.room.id).emit("newQuestion", question);
		    game.setStatusForRoom(socket.room, "pending", function () {sendStats(socket.room);});
		});
	    })
//	    console.log("should emit to", socket.room, "the correction");
//	    game.getAnonStatsFromRoom(socket.room, function (r,e) {
//		console.log(r,e);
//		io.to(socket.room.id).emit("correction", e);
//		game.setStatusForRoom(socket.room, "revealed", function () {});
//	    });	    
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
		game.questionFromRoomID(socket.room.id, function (err, question) {
//		    console.log("had", question);
		    io.to(socket.room.id).emit("newQuestion", question);
		    io.of('/admin').to(socket.room.id).emit("newQuestion", question);
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
    io.of('/manage').on('connection', function(socket) {

	/******************************************/
	/*  On a choisi la room a administrer     */
	/******************************************/

	socket.on('new order', function (newOrder) {
	    if(socket.request.session) {
//		console.log(newOrder);
		set.reOrder(socket.request.session.user, newOrder);
	    }
	    else {
	    }
	});
    });

    return io;
};

