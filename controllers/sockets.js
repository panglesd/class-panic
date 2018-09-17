var user = require('../models/user');
var room = require('../models/room');
var set = require('../models/set');
var game = require('../models/game');
var async = require('async');



module.exports = function (server, sessionMiddleware) {

    var io = require('socket.io')(server);
    
    /**************************************************************************/
    /*                 IO middlewares                                         */
    /**************************************************************************/
    
    //On ajoute une session si existante à l'objet socket
    io.use(function(socket, next) {
	sessionMiddleware(socket.request, socket.request.res, next);
    });
    
    // On n'accepte que des sessions existantes et un user défini
    io.use(function(socket, next) {
	if(socket.request.session) {
	    if(socket.request.session.user) {
		next();
	    }
	    else {
		console.log("socket refused !");
	    }
	}
	else {
	    console.log("socket refused !");
	}
    });
    
    /**************************************************************************/
    /*                 Utilitaires d'envoi                                    */
    /**************************************************************************/
    
    function sendRoomQuestion(socket, callback) {
//	console.log("io",io.of("/student").to(socket.room.id).customQuestion);
	if(io.of("/student").to(socket.room.id).customQuestion) {
	    socket.emit("newQuestion", io.of("/student").to(socket.room.id).customQuestion);
	}
	else
	    game.questionFromRoomID(socket.room.id, function (err, question) {
		socket.emit("newQuestion", question);
	    });
	callback();
    }
    function sendRoomOwnedQuestion(user, socket, callback) {
//	console.log("io",io.of("/student").to(socket.room.id).customQuestion);
	if(io.of("/student").to(socket.room.id).customQuestion) {
	    socket.emit("newQuestion", io.of("/admin").to(socket.room.id).customQuestion);
	}
	else
	    game.questionOwnedFromRoomID(user, socket.room.id, function (err, question) {
		socket.emit("newQuestion", question);
	    });
	callback();
    }

    function broadcastRoomQuestion(room, callback) {
//	console.log("io",io.of("/student").to(room.id).customQuestion);
	if(io.of("/student").to(room.id).customQuestion) {
	    io.of("/student").to(room.id).emit("newQuestion",io.of("/student").to(room.id).customQuestion);
	}
	else
	    game.questionFromRoomID(room.id, function (err, question) {
		io.of("/student").to(room.id).emit("newQuestion", question);
	    });
	callback();
    }
    
    /*    function sendStats(room) {
	  game.getStatsFromRoom(room.id, function (err, stats) {
	  io.of("/admin").to(room.id).emit("newStats", stats)
	  }); */
    function sendOwnedStats(room) {
	game.getStatsFromOwnedRoomID(room.id, function (err, stats) {
	    io.of("/admin").to(room.id).emit("newStats", stats)
	});
    }
    
    /**************************************************************************/
    /*                 Fonction pour gérer les eleves                         */
    /**************************************************************************/
    
    io.of("/student").on('connection', function (socket) {
	if(socket.request.session) {
	    if(socket.request.session.user) {
		//		console.log("socket.request.session.user is ",socket.request.session.user);
		/******************************************/
		/*  Middleware de socket                  */
		/******************************************/
		
		// Si on n'a pas de room défini, la seule chose qu'on peut faire c'est choisir une room
		
		socket.use(function (packet, next) {
		    //	    console.log("packet is", packet);
		    if(packet[0]=="chooseRoom")
			next();
		    if(socket.room)
			next();
		});
		
		/******************************************/
		/*  Quelqu'un a choisi une room           */
		/******************************************/
		
		socket.on('chooseRoom', function (newRoom) {
		    if (socket.room)
			socket.leave(socket.room.id);
		    room.getByID(parseInt(newRoom), function (err, res) {
			socket.room = res;
			socket.join(newRoom);
			//		console.log("socket.request.session.user is ",socket.request.session.user);
			game.enterRoom(socket.request.session.user, socket.room, function (err) {
			    sendOwnedStats(socket.room);
			    sendRoomQuestion(socket, function () {
				room.getStatus(socket.room, function (err, status) {
				    if(status == "revealed") {
					game.getStatsFromRoomID(socket.room.id, function (r,e) {
					    io.of("/student").to(socket.room.id).emit("correction", e);
					});
				    }
				});
/*			    game.questionFromRoomID(socket.room.id, function (err, question) {
				socket.emit("newQuestion", question);
				room.getStatus(socket.room, function (err, status) {
				    if(status == "revealed") {
					game.getStatsFromRoomID(socket.room.id, function (r,e) {
					    io.of("/student").to(socket.room.id).emit("correction", e);
					});
				    }
				});*/
			    });
			});
		    });
		});
		
		/******************************************/
		/*  On me demande la question             */
		/******************************************/
		
		socket.on('sendQuestionPlease', function () {
		    console.log(socket.room);
		    sendRoomQuestion(socket,function() {});
/*		    game.questionFromRoomID(socket.room.id, function (err, question) {
			socket.emit("newQuestion", question);
		    });*/
		});
		
		/******************************************/
		/*  On m'envoie une reponse               */
		/******************************************/
		
		socket.on('chosenAnswer', function (answer) {
		    game.registerAnswer(socket.request.session.user, socket.room, answer, function () {
			sendOwnedStats(socket.room)
		    });
		});
		
		/******************************************/
		/*  On quitte la salle                    */
		/******************************************/
		
		socket.on('disconnect', function (reason) {
		    game.leaveRoom(socket.request.session.user, socket.room,  function (err) {
			if (err) throw err;
			sendOwnedStats(socket.room);
		    });
		});
	    }
	}
    });
    
    /**************************************************************************/
    /*                 Fonction pour gérer les admins                         */
    /**************************************************************************/
    
    io.of('/admin').on('connection', function(socket) {
	
	if(socket.request.session) {
	    if(socket.request.session.user) {
		
		/******************************************/
		/*  Middlesware de socket                 */
		/******************************************/
		
		// Si on n'a pas de room défini, la seule chose qu'on peut faire c'est choisir une room
		
		socket.use(function (packet, next) {
		    //	    console.log("packet is", packet);
		    if(packet[0]=="chooseRoom")
			next();
		    if(socket.room)
			next();
		});
		
		/******************************************/
		/*  On a choisi la room a administrer     */
		/******************************************/
		
		socket.on('chooseRoom', function (newRoom) {
		    if (socket.room)
			socket.leave(socket.room.id);
		    //	    console.log(socket.request.session);
		    room.getOwnedByID(socket.request.session.user, parseInt(newRoom), function (err, res) {
			socket.room = res;
			socket.join(socket.room.id);
			sendRoomOwnedQuestion(socket.request.session.user, socket, function () {});
/*			game.questionOwnedFromRoomID(socket.request.session.user, socket.room.id, function (err, question) {
			    socket.emit("newQuestion", question);
			});*/
			sendOwnedStats(socket.room);
		    });
		});
		
		/******************************************/
		/*  On souhaite diffuser les resultats    */
		/******************************************/
		
		socket.on('revealResults', function () {
		    //	    console.log("should emit to", socket.room.id, "the correction");
		    game.getStatsFromRoomID(socket.room.id, function (r,e) {
			io.of("/student").to(socket.room.id).emit("correction", e);
			room.setStatusForRoom(socket.room, "revealed", function () {});
		    });	    
		});
		
		/******************************************/
		/*  On souhaite aller direct à une question*/
		/******************************************/
		
		socket.on('changeToQuestion', function (i) {
		    //	    console.log("on souhaite changer à la question", i)
		    game.setQuestionFromRoom(socket.room, parseInt(i), function () {
			room.setStatusForRoom(socket.room, "pending", function () {
			    sendOwnedStats(socket.room);
			    sendRoomQuestion(socket, function () {});
			    sendRoomOwnedQuestion(socket.request.session.user, socket, function () {});
			    /*			    game.questionFromRoomID(socket.room.id, function (err, question) {
						    io.of("/student").to(socket.room.id).emit("newQuestion", question);
						    io.of('/admin').to(socket.room.id).emit("newQuestion", question);
						    });*/
			})
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
		    io.of("/student").to(socket.room.id).customQuestion = undefined;
		    game.nextQuestionFromRoom(socket.room, function () {
			room.setStatusForRoom(socket.room, "pending", function () {			    
			    sendRoomQuestion(socket, function () {});
			    sendRoomOwnedQuestion(socket.request.session.user, socket, function () {});
			    /*			    game.questionFromRoomID(socket.room.id, function (err, question) {
						    io.of("/student").to(socket.room.id).emit("newQuestion", question);
						    io.of('/admin').to(socket.room.id).emit("newQuestion", question);*/
			    sendOwnedStats(socket.room);
			});
		    });
		})

		/******************************************/
		/*  On souhaite une question custom       */
		/******************************************/
		
		socket.on('customQuestion', function (customQuestion) {
		    
		    console.log(customQuestion);
		    io.of("/student").to(socket.room.id).customQuestion = customQuestion;
		    broadcastRoomQuestion(socket, function() {})
		    
		});
		
	    }
	}
    });
    
    /**************************************************************************/
    /*                 Fonction pour le management de questions en direct     */
    /**************************************************************************/
    
    
    io.of('/manage').on('connection', function(socket) {
	if(socket.request.session) {
	    if(socket.request.session.user) {
		socket.on('new order', function (newOrder) {
		    if(socket.request.session) {
			set.reOrder(socket.request.session.user, newOrder);
		    }
		    else {
		    }
		});
	    }
	}
    });
    
    return io;
};

