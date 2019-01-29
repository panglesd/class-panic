var user = require('../../models/user');
var Stats = require('../../models/stats');
var Room = require('../../models/room');
var Course = require('../../models/course');
var User = require('../../models/user');
var Question = require('../../models/question');
var Set = require('../../models/set');
var game = require('../../models/game');
var async = require('async');

var fs = require("fs");
var mkdirp = require("mkdirp");
var sanit_fn = require("sanitize-filename");
var md5File = require("md5-file");

/**************************************************************************/
/*                 Fonction pour gérer les Controles Continus             */
/**************************************************************************/

module.exports = function(io) {
    
    let tools = require('./tools.js')(io);

    /******************************************/
    /*  Outils spécifiques                    */
    /******************************************/

    function sendListQuestion(socket, callback) {
	game.questionListForCC(socket.request.session.user, socket.room.id, function (err, questionList) {
	    questionList.forEach((question) => {
		delete(question.correct);
//		if(question.texted)   // Pas besoin car on n'envoie pas les réponses possibles...
//		    delete(question.correction);
	    });
	    socket.emit("newList", questionList);
	    callback();
	});
    }
    function sendCorrection(socket, i, callback) {
	Question.getByID(i, (err, question) => {
	    if(question.class == socket.room.questionSet)
		socket.emit("newCorrection", question);
	});
    };
    function sendQuestionFromIndex (socket, index, callback)  {
	Question.getByIndexCC(index,socket.request.session.user, socket.room.id, (err, question) => {
	    question.allResponses.forEach((rep) => {
		delete(rep.validity);
		if(rep.texted) {
		    delete(rep.correction);
		}
	    });
	    socket.emit("newQuestion", question);
	    callback();
	});
    };

    
    io.of('/cc').on('connection', function(socket) {

	
	/******************************************/
	/*  Middlesware de socket                 */
	/******************************************/
	
	// Si on n'a pas de room défini, la seule chose qu'on peut faire c'est choisir une room
	
	socket.use(function (packet, next) {
	    console.log("packet is", packet[0]);
	    console.log("arg is", packet[1], packet[2]);
	    if(packet[0]=="chooseRoom")
		next();
	    if(socket.room)
		Room.getByID(socket.room.id, (err, room) => {
		    socket.room = room;
		    next();
		});
	});
	
	/******************************************/
	/*  On a choisi la room                   */
	/******************************************/

	socket.on('chooseRoom', function (newRoom) {
	    console.log("chooseRoom");
	    if (socket.room)
		socket.leave(socket.room.id);
	    Room.getByID(parseInt(newRoom), function (err, res) {
		if(res && res.status != "closed") {
		    Course.getByID(res.courseID,(er, course) => {
			User.getSubscription(socket.request.session.user, course, (err, subscription) => {
			    if(subscription) {
				socket.room = res;
				socket.join(socket.room.id);
				sendQuestionFromIndex(socket, 0, function (err) {if(err) throw err;});
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
	    sendQuestionFromIndex(socket, i, function (err) {
		if(err) throw err;
	    });
	});
	
	/******************************************/
	/*  Un admin me demande la liste des questions*/
	/******************************************/
	
	socket.on('sendList', function () {
	    sendListQuestion(socket, function() {});
	});

	/******************************************/
	/*  Un admin me demande la liste des questions*/
	/******************************************/
	
	socket.on('sendCorrection', function (i) {
	    if(socket.room.status == "revealed")
		sendCorrection(socket, i, function() {});
	});

	/******************************************/
	/*  On m'envoie une reponse               */
	/******************************************/
		
	socket.on('chosenAnswer', function (answer, questionIndex) {
	    	    console.log("answer = ", answer);
	    if(socket.room.status == "pending") {
		Question.getByIndexCC(questionIndex, socket.request.session.user,socket.room.id,(err, question) => {
		    // A gérer autrement à cause de la réorganisation
		    // if(answer.length != 0 && question.type != "multi")
		    // 	answer = [answer[0]];
		    game.registerAnswerCC(socket.request.session.user, socket.room, questionIndex, answer, function () {
			sendListQuestion(socket, function() {});
			//			tools.sendListQuestion(socket.request.session.user, socket, socket.room, function() {});
		    });
		});
	    }
	});
	/******************************************/
	/*  On m'envoie une reponse avec un fichier*/
	/******************************************/
		
	socket.on('chosenFile', function (fileName, n_ans, questionIndex, data) {
	    if(socket.room.status == "pending"){
		Question.getByIndexCC(questionIndex, socket.request.session.user,socket.room.id,(err, question) => {
		    if(question.allResponses[n_ans].hasFile != "none") {
			let path = "storage/course"+socket.room.courseID+"/room"+socket.room.id+"/question"+question.id+"/user"+socket.request.session.user.id+"/answer"+n_ans+"/";
			console.log("path = ", path);
			mkdirp(path, (err) => {
			    fileName = sanit_fn(fileName);
			    if(fileName)
				fs.writeFile(path+fileName, data, (err) => {
				    if(err) throw err;
				    md5File(path+fileName, (err, hash) => {
					console.log("calling logFile");
					game.logFile(socket.request.session.user.id, socket.room.id, question.id, n_ans, path, fileName, hash, Date.now(),(err) => {
					    sendQuestionFromIndex(socket, questionIndex,() => {});
//					socket.emit("fileReceived", n_ans, fileName, hash);
					});
					//socket.emit("fileReceived", n_ans, fileName, hash);
				    });
				    // prévenir le client (et update bdd ?)
				});
			});
			// if(answer.length != 0 && question.type != "multi")
			//     answer = [answer[0]];
		    }
		});
	    }
	});

	/******************************************/
	/*  On veux supprimer un fichier          */
	/******************************************/
		 
	socket.on('removeFile', function (n_ans, fileName, questionIndex) {
	    if(socket.room.status == "pending"){
		Question.getByIndexCC(questionIndex, socket.request.session.user,socket.room.id,(err, question) => {
		    console.log("calling logFile");
		    game.removeFile(socket.request.session.user.id, socket.room.id, question.id, n_ans, fileName,(err) => {
			sendQuestionFromIndex(socket, questionIndex,() => {});
		    });
		});
	    };
	});
	
	/******************************************/
	/*  Un admin me demande les stats         */
	/******************************************/
	
	// socket.on('sendStatsPlease', function () {
	//     //		    console.log(socket.room);
	//     tools.sendOwnedStats(socket.room);
	// });
	
    });
};
