var user = require('../models/user');
var Stats = require('../models/stats');
var room = require('../models/room');
var Course = require('../models/course');
var User = require('../models/user');
var Question = require('../models/question');
var Set = require('../models/set');
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
	game.questionFromRoomID(socket.room.id, function (err, question) {
//	    question.reponses.sort(function() { return 0.5 - Math.random() });
	    socket.emit("newQuestion", question);
	    callback();
	});
    }
    function sendRoomOwnedQuestion(user, socket, callback) {
	game.questionControlledFromRoomID(user, socket.room.id, function (err, question) {
	    socket.emit("newQuestion", question);
	    callback();
	});
    }
    
    function broadcastRoomQuestion(room, callback) {
//	console.log("room", room);
	game.questionFromRoomID(room.id, function (err, question) {
//	    question.reponses.sort(function() { return 0.5 - Math.random() });
	    io.of("/student").to(room.id).emit("newQuestion", question);
	    io.of("/admin").to(room.id).emit("newQuestion", question);
	    callback();
	});
    }
    
    function sendStats(socket, room, callback) {
	game.getStatsFromRoom(room.id, function (err, stats) {
	    io.of("/admin").to(room.id).emit("newStats", stats)
	});
    }
    function sendOwnedStats(room) {
	game.getStatsFromOwnedRoomID(room.id, function (err, stats) {
	    io.of("/admin").to(room.id).emit("newStats", stats)
	});
    }
    
    /**************************************************************************/
    /*                 Fonction pour gérer les eleves                         */
    /**************************************************************************/
    
    io.of("/student").on('connection', function (socket) {
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
	    console.log("user try to enter room");
	    if (socket.room)
		socket.leave(socket.room.id);
	    room.getByID(parseInt(newRoom), function (err, res) {
		console.log("user got room", res);
		Course.getByID(res.courseID, (er, course) => {
		    User.getSubscription(socket.request.session.user, course, (err, subscription) => {
			console.log("user got subscription", subscription);
			if(subscription) {
			    socket.room = res;
			    console.log("user enter room");
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
	    //		    console.log(socket.room);
	    sendRoomQuestion(socket,function() {});
	});
	
	/******************************************/
	/*  On m'envoie une reponse               */
	/******************************************/
	
	socket.on('chosenAnswer', function (answer) {
//	    console.log(answer);
	    game.registerAnswer(socket.request.session.user, socket.room, answer, function () {
		sendOwnedStats(socket.room)
	    });
	});
	
	/******************************************/
	/*  On quitte la salle                    */
	/******************************************/
	
	socket.on('disconnect', function (reason) {
	    if(socket.room) {
		game.leaveRoom(socket.request.session.user, socket.room,  function (err) {
		    if (err) throw err;
		    sendOwnedStats(socket.room);
		});
	    }
	});
    });
    
    /**************************************************************************/
    /*                 Fonction pour gérer les admins                         */
    /**************************************************************************/
    
    io.of('/admin').on('connection', function(socket) {
	
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
	    room.getByID(parseInt(newRoom), function (err, res) {
		if(res) {
		    Course.getByID(res.courseID,(er, course) => {
			User.getSubscription(socket.request.session.user, course, (err, subscription) => {
			    if(subscription && subscription.isTDMan) {
				socket.room = res;
				socket.join(socket.room.id);
				sendRoomOwnedQuestion(socket.request.session.user, socket, function (err) {if(err) throw err});
				//		sendOwnedStats(socket.room);
			    }
			});
		    });
		}
	    });
	});
	
	/******************************************/
	/*  On souhaite diffuser les resultats    */
	/******************************************/
	
	socket.on('revealResults', function () {
	    //	    console.log("should emit to", socket.room.id, "the correction");
	    room.getStatus(socket.room, function (err, status) {
		if(status != "revealed") {
		    game.getStatsFromRoomID(socket.room.id, function (r,e) {
			io.of("/student").to(socket.room.id).emit("correction", e);
			room.setStatusForRoomID(socket.room.id, "revealed", function () {});
			game.getStatsFromOwnedRoomID(/*socket.request.session.user, */socket.room.id, (err, res) => { /*console.log(res);*/ });
			Stats.logStats(socket.room.id, (err) => {console.log(err);});
			//				e.forEach((personnalStat) => {
			//				    console.log(personnalStat);
			//				});
			
		    });
		}
	    });
	});
	
	/******************************************/
	/*  On souhaite aller direct à une question*/
	/******************************************/
	
	socket.on('changeToQuestion', function (i) {
	    //	    console.log("on souhaite changer à la question", i)
	    game.setQuestionFromRoomID(socket.room.id, parseInt(i), function () {
		room.setStatusForRoomID(socket.room.id, "pending", function () {
		    sendOwnedStats(socket.room);
		    broadcastRoomQuestion(socket.room, function (err) {if(err) throw err});
		    sendRoomOwnedQuestion(socket.request.session.user, socket, function () {});
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
	/*  Un admin me demande la question       */
	/******************************************/
	
	socket.on('sendQuestionPlease', function () {
	    //		    console.log(socket.room);
	    sendRoomOwnedQuestion(socket.request.session.user, socket, function() {});
	});
	
	/******************************************/
	/*  Un admin me demande les stats         */
	/******************************************/
	
	socket.on('sendStatsPlease', function () {
	    //		    console.log(socket.room);
	    sendOwnedStats(socket.room)
	});
	
	/******************************************/
	/*  On souhaite passer à la question suivante */
	/******************************************/
	
	socket.on('changeQuestionPlease', function (nextQuestion) {
	    game.nextQuestionFromRoomID(socket.room.id, function (err) {
		room.setStatusForRoomID(socket.room.id, "pending", function () {
		    broadcastRoomQuestion(socket.room, function () {});
		    sendRoomOwnedQuestion(socket.request.session.user, socket, function () {});
		    sendOwnedStats(socket.room);
		});
	    });
	})
	
	/******************************************/
	/*  On souhaite une question custom       */
	/******************************************/
	
	socket.on('customQuestion', function (customQuestion) {
	    //		    console.log(customQuestion);
	    delete(customQuestion.id);
	    game.setQuestion(socket.room.id, customQuestion, function () {
		broadcastRoomQuestion(socket.room, function(err, res) {});
		sendOwnedStats(socket.room);
	    });
	});
	
	/******************************************/
	/*  On souhaite revenir aux questions du set*/
	/******************************************/
	
	/*		socket.on('backToSet', function () {
	//		    console.log("backToSet");
	game.backToSet(socket.room.id, function(err, res) {
	broadcastRoomQuestion(socket.room, function(err,res) {})
	});
	});*/
    });
    
    /**************************************************************************/
    /*                 Fonction pour le management de questions en direct     */
    /**************************************************************************/
    
    
    io.of('/manage').on('connection', function(socket) {
	socket.on('new order', function (newOrder) {
	    if(newOrder)
		if(newOrder[0]) {
		    async.waterfall( [
			(callback) => { Question.getByID(newOrder[0], callback) },
			(question, callback) => { Set.setGet(question.class, callback) },
			(set, callback) => { Course.getByID(set.courseID, (err, res) => {callback(err, set, res)}) },
			(set, course, callback) => {User.getSubscription(socket.request.session.user, course, (err, res) => {callback(err, set, course, res)}) },
			(set, course, subs) => {
			    console.log(subs);
			    if(subs.canSetUpdate)
				Set.reOrder(course, set, newOrder);
			}]);
		}
	});
    });
    
    /**************************************************************************/
    /*                 Fonction pour l'inscription de students à un cours     */
    /**************************************************************************/
    
    io.of('/users').on('connection', function(socket) {
	
	/******************************************/
	/*  Middleware de socket                  */
	/******************************************/
	
	// Si on n'a pas de room défini, la seule chose qu'on peut faire c'est choisir une room
	
	socket.use(function (packet, next) {
	    //	    console.log("packet is", packet);
	    if(packet[0]=="chooseCourse")
		next();
	    else if(socket.course)
		next();
	    else
		console.log("refused");
	});
	
	
	socket.on("chooseCourse", function(courseID) {
	    Course.getByID(parseInt(courseID), function (err, course) {
		User.getSubscription(socket.request.session.user, course, function(err, subs) {
		    if(subs && subs.canSubscribe)
			socket.course = course;
		});
	    });
	});

	socket.on('getUser', function (filter) {
//	    console.log(filter);
	    socket.filter = filter;
	    socket.filter.courseID = socket.course.id;
	    User.userListByFilter(filter, (err, results) => {
		socket.emit("users", results);
	    });
	});
	
	socket.on('subscribeList', function (studentList) {
//	    console.log("studentList is", studentList);
	    async.forEach(studentList,
			  (studentID, callback) => {
//			      console.log("I am going to register ", studentID);
			      Course.subscribeStudent(studentID, socket.course.id, callback);
			  },
			  (err, results) => {
			      if(!socket.filter)
				  socket.filter={};
			      socket.filter.courseID = socket.course.id;
			      User.userListByFilter(socket.filter, (err, results) => {
				  socket.emit("users", results);
			      });
			  });
	});
	socket.on('subscribeListTDMan', function (studentList, permission) {
	    console.log("we got this pemission", permission);
	    console.log("socket.course.ownerID",socket.course.ownerID);
	    console.log("socket.request.session.user.id",socket.request.session.user.id);
	    if(socket.course.ownerID == socket.request.session.user.id) {
		//	    console.log("studentList is", studentList);
		async.forEach(studentList,
			      (studentID, callback) => {
				  //			      console.log("I am going to register ", studentID);
				  Course.subscribeTDMan(studentID, socket.course.id, permission, callback);
			      },
			      (err, results) => {
				  if(!socket.filter)
				      socket.filter={};
				  socket.filter.courseID = socket.course.id;
				  User.userListByFilter(socket.filter, (err, results) => {
				      socket.emit("users", results);
				  });
			      });
	    }
	});
	socket.on('unSubscribeList', function (studentList) {
	    //	    console.log("studentList is", studentList);
	    async.forEach(studentList,
			  (studentID, callback) => {
			      //			      console.log("I am going to unregister ", studentID);
			      if(studentID != socket.request.session.user.id)
				  Course.unSubscribeStudent(studentID, socket.course.id, callback);
			  },
			  (err, results) => {
			      if(!socket.filter)
				  socket.filter={};
			      socket.filter.courseID = socket.course.id;
			      User.userListByFilter(socket.filter, (err, results) => {
				  socket.emit("users", results);
			      });
			  });
	});
	//		    studentList.forEach((studentID) => {
	//			Course.registerStudent(studentID, socket.course.id, function(err) {
	//			    
	//			}
	
	//		    }
	//		    User.userListByFilter(filter, (err, results) => {
	//			socket.emit("users", results);
	//		    });
    });

    /**************************************************************************/
    /*                 Fonction pour les statistiques                         */
    /**************************************************************************/
    
    io.of('/stats').on('connection', function(socket) {
	
	/******************************************/
	/*  Middleware de socket                  */
	/******************************************/
	
 	//rien

	/******************************************/
	/*  Fonction getStats                     */
	/******************************************/

	// !!!!!!!!! A voir si ça n'est pas mieux de faire ça côté client !
	
	socket.on("stats", function(filter) {
	    console.log(filter);
	    if(filter.courseID) {
		Course.getByID(filter.courseID, (err, course) => {
		    User.getSubscription(socket.request.session.user, course, (err, subs) => {
			if(subs.isTDMan) {
			    Stats.getStats(filter, function (err, res) {
				socket.emit("newStats", filter, res);
			    });
			}
		    });
		});
	    }
	});
    });

    return io;
    
};

		      
