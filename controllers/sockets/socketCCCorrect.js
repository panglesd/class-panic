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

    /******************************************/
    /*  Outils spécifiques                    */
    /******************************************/

/*    function sendListQuestion(socket, callback) {
	game.questionListForCC(socket.request.session.user, socket.room.id, function (err, questionList) {
	    socket.emit("newList", questionList);
	    callback();
	});
    }
*/

    function sendQuestionFromIndex (socket, index, callback)  {
	// Question.getByIndexCC(index,socket.request.session.user, socket.room.id, (err, question) => {
	//     socket.emit("newQuestion", question);
	//     callback();
	// });
	Question.getByIndex(index, socket.room.id, (err, question) => {
		socket.emit("newQuestion", question);
		callback();
	    // Stats.getSubmission(socket.request.session.user.id, socket.room.id, question.id, (err, submission) => {
	    // 	question.submission = submission;
	    // });
	});
    };

    function sendListStudents (user, socket, room, callback) {
	Stats.studentListForCC(user, room.id, function (err, question) {
	    socket.emit("newUserList", question);
	    callback();
	});
    };

    function sendAnswer (socket, room, studentID, questionID, callback)  {
	console.log("sendAnswer");
	Stats.getSubmission(studentID, room.id, questionID, (err, submission) => {
	    socket.emit("newSubmission", submission);
	    callback();
	});
    };

    io.of('/ccAdmin').on('connection', function(socket) {

	
	/******************************************/
	/*  Middlesware de socket                 */
	/******************************************/
	
	// Si on n'a pas de room défini, la seule chose qu'on peut faire c'est choisir une room
	
	socket.use(function (packet, next) {
	    console.log("packet is", packet[0]);
	    // On vérifie que le TDMan est bien un TDMan
	    if(packet[1])
		async.waterfall([
		    (callback) => {Room.getByID(parseInt(packet[1]), callback);},
		    (room, callback) => {socket.room = room, Course.getByID(room.courseID,(err, course) => {callback(err, course, room); });},
		    (course, room, callback) => {socket.course = course; User.getSubscription(socket.request.session.user, course,(err, subs) => {callback(err, subs);});},
		], (err, subsAdmin) => {
		    // Si c'est bien un TDMan, on accepte toutes les requetes sans mention de student
		    if(subsAdmin.isTDMan) {
			if(packet[0]=="sendList" || packet[0]=="sendStudentList")
			    next();
			else
			    // On vérifie que le student est bien enregistré dans le cours
			    if(packet[2])
				User.getSubscription({id:packet[2]}, socket.course, (err, subsStudent) => {
				    if(subsStudent) {
					socket.studentID = packet[2];
					next();
				    }
					
				    else
					console.log("not accepted, because student not registered to the course");
				});
		    }
		    else
			console.log("not accepted because not TDMan");
		});
	});
	
	/******************************************/
	/*  On souhaite aller direct à une question*/
	/******************************************/
	
	socket.on('sendAnswer', function (roomID, studentID, questionID) {
	    sendAnswer(socket, socket.room, studentID, questionID, function (err) {
		if(err) throw err;
	    });
	});
	
	socket.on('sendQuestion', function (roomID, studentID, questionIndex) {
	    sendQuestionFromIndex(socket, questionIndex, function (err) {
		if(err) throw err;
	    });
	});
	
	/******************************************/
	/*                                         */
	/******************************************/
	
	socket.on('setValidity', function (roomID, studentID, questionID, i, validity) {
	    Stats.setValidity(socket.room.id, studentID, questionID, i, validity,function (err) {
		if(err) //throw err;
		    console.error(err);
		sendListStudents(socket.request.session.user, socket, socket.room, function() {});
	    });
	});
	socket.on('setCustomComment', function (roomID, studentID, questionID, i, customComment) {
	    Stats.setCustomComment(socket.room.id, studentID, questionID, i, customComment,function (err) {
		if(err) //throw err;
		    console.error(err);
		sendListStudents(socket.request.session.user, socket, socket.room, function() {});
	    });
	});
	socket.on('setGlobalGrade', function (roomID, studentID, questionID, mark) {
	    Stats.setGlobalGrade(roomID, studentID, questionID, mark, (err) => {
		if(err) throw err;
		sendListStudents(socket.request.session.user, socket, socket.room, function() {});
	    });
	});
	socket.on('setGlobalComment', function (roomID, studentID, questionID, comment) {
	    Stats.setGlobalComment(roomID, studentID, questionID, comment, (err) => {
		if(err) throw err;
		sendListStudents(socket.request.session.user, socket, socket.room, function() {});
	    });
	});

	socket.on('gradeCriteria', function (roomID, studentID, questionID, i, grade) {
	    Stats.gradeCriteria(roomID, studentID, questionID, i, grade, (err) => {
		if(err) throw err;
		sendListStudents(socket.request.session.user, socket, socket.room, function() {});
	    });
	});
	
	socket.on('setAutoCorrect', function (roomID, studentID, questionID) {
	    Stats.setAutoCorrect(roomID, studentID, questionID, (err) => {
		if(err) throw err;
		sendListStudents(socket.request.session.user, socket, socket.room, function() {});
	    });
	});
	
	/******************************************/
	/*  Un admin me demande la liste des questions*/
	/******************************************/
	
	socket.on('sendList', function (roomID, studentID) {
	    User.userByID(studentID, (err, user) => {
		game.questionListForCC(user, socket.room.id, function (err, questionList) {
		    socket.emit("newList", questionList);
		});
		
	    });
	});

	socket.on('sendStudentList', function () {
	    sendListStudents(socket.request.session.user, socket, socket.room, function() {});
	});
	
    });
};
