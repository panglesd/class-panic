var user = require('../models/user');
var room = require('../models/room');
var set = require('../models/set');
var game = require('../models/game');
var async = require('async');



module.exports = function (server) {

    var io = require('socket.io')(server);

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
		game.questionFromRoomID(socket.room.id, function (err, question) {
		    socket.emit("newQuestion", question);
		    room.getStatus(socket.room, function (err, status) {
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
	    console.log(socket.request.session);
	    room.getOwnedByID(socket.request.session.user, parseInt(newRoom), function (err, res) {
		socket.room = res;
		socket.join(socket.room.id);
		game.questionOwnedFromRoomID(socket.request.session.user, socket.room.id, function (err, question) {
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
	    game.getStatsFromOwnedRoom(socket.room.id, function (r,e) {
		io.to(socket.room.id).emit("correction", e);
		room.setStatusForRoom(socket.room, "revealed", function () {});
	    });	    
	});

	/******************************************/
	/*  On souhaite aller direct à une question*/
	/******************************************/

	socket.on('changeToQuestion', function (i) {
	    console.log("on souhaite changer à la question", i)
	    game.setQuestionFromRoom(socket.room, parseInt(i), function () {
		game.questionFromRoomID(socket.room.id, function (err, question) {
		    io.to(socket.room.id).emit("newQuestion", question);
		    io.of('/admin').to(socket.room.id).emit("newQuestion", question);
		    room.setStatusForRoom(socket.room, "pending", function () {sendStats(socket.room);});
		});
	    })
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
		    io.to(socket.room.id).emit("newQuestion", question);
		    io.of('/admin').to(socket.room.id).emit("newQuestion", question);
		    room.setStatusForRoom(socket.room, "pending", function () {sendStats(socket.room);});
		});
	    })
	});
    });

    /**************************************************************************/
    /*                 Fonction pour le management de questions en direct     */
    /**************************************************************************/


    io.of('/manage').on('connection', function(socket) {

	socket.on('new order', function (newOrder) {
	    if(socket.request.session) {
		set.reOrder(socket.request.session.user, newOrder);
	    }
	    else {
	    }
	});
    });

    return io;
};

