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
/*                 Fonction pour gérer les Controles Continus             */
/**************************************************************************/

module.exports = function(io) {
    
    let tools = require('./tools.js')(io);
    
    io.of('/cc').on('connection', function(socket) {

	
	/******************************************/
	/*  Middlesware de socket                 */
	/******************************************/
	
	// Si on n'a pas de room défini, la seule chose qu'on peut faire c'est choisir une room
	
	socket.use(function (packet, next) {
	    console.log("packet is", packet[0]);
	    if(packet[0]=="chooseRoom")
		next();
	    if(socket.room)
		next();
	});
	
	/******************************************/
	/*  On a choisi la room                   */
	/******************************************/
	
	socket.on('chooseRoom', function (newRoom) {
	    console.log("chooseRoom");
	    if (socket.room)
		socket.leave(socket.room.id);
	    Room.getByID(parseInt(newRoom), function (err, res) {
		if(res) {
		    Course.getByID(res.courseID,(er, course) => {
			User.getSubscription(socket.request.session.user, course, (err, subscription) => {
			    if(subscription) {
				socket.room = res;
				socket.join(socket.room.id);
				tools.sendQuestionFromIndex(socket, socket.room, 3, function (err) {if(err) throw err;});
				tools.sendListQuestion(socket.request.session.user, socket, socket.room, function() {});
			    }
			});
		    });
		}
	    });
	});
	
	/******************************************/
	/*  On souhaite aller direct à une question*/
	/******************************************/
	
	socket.on('changeToQuestion', function (i) {
	    tools.sendQuestionFromIndex(socket, socket.room, i, function (err) {if(err) throw err;});
	    tools.sendListQuestion(socket.request.session.user, socket, socket.room, function() {});
	});
	
	/******************************************/
	/*  On m'envoie une reponse               */
	/******************************************/
	
	socket.on('chosenAnswer', function (answer) {
//	    console.log("answer is", answer);
//	    console.log("room is", socket.room);
	    if(answer.length == 0 || socket.room.question.type == "multi")
		game.registerAnswer(socket.request.session.user, socket.room, answer, function () {
		    tools.sendOwnedStats(socket.room);
		});
	    else 
		game.registerAnswer(socket.request.session.user, socket.room, [answer[0]], function () {
		    tools.sendOwnedStats(socket.room);
		});
	});

	// /******************************************/
	// /*  Un admin me demande la question       */
	// /******************************************/
	
	// socket.on('sendQuestionPlease', function () {
	//     //		    console.log(socket.room);
	//     tools.sendRoomOwnedQuestion(socket.request.session.user, socket, socket.room, function() {});
	// });
	
	/******************************************/
	/*  Un admin me demande la liste des questions*/
	/******************************************/
	
	socket.on('sendList', function () {
	    console.log("socket list on room", socket.room);
	    tools.sendListQuestion(socket.request.session.user, socket, socket.room, function() {});
	});
	
	/******************************************/
	/*  Un admin me demande les stats         */
	/******************************************/
	
	// socket.on('sendStatsPlease', function () {
	//     //		    console.log(socket.room);
	//     tools.sendOwnedStats(socket.room);
	// });
	
	// /******************************************/
	// /*  On souhaite passer à la question suivante */
	// /******************************************/
	
	// socket.on('changeQuestionPlease', function (nextQuestion) {
	//     game.nextQuestionFromRoomID(socket.room.id, function (err) {
	// 	Room.setStatusForRoomID(socket.room.id, "pending", function () {
	// 	    tools.broadcastRoomQuestion(socket.room, function () {});
	// 	    tools.sendRoomOwnedQuestion(socket.request.session.user, socket, socket.room, function () {});
	// 	    tools.sendOwnedStats(socket.room);
	// 	});
	//     });
	// });	
    });
};
