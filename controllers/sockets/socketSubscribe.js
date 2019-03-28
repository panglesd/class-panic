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
/*                 Fonction pour l'inscription de students à un cours     */
/**************************************************************************/

module.exports = function(io) {
    io.of('/users').on('connection', function(socket) {
	
	/******************************************/
	/*  Middleware de socket                  */
	/******************************************/
	
	// Si on n'a pas de room défini, la seule chose qu'on peut faire c'est choisir une room
	
	socket.use(function (packet, next) {
	    console.log("packet is", packet);
	    if(packet[1]) {
		let courseID=packet[1];
		Course.getByID(parseInt(courseID), function (err, course) {
		    User.getSubscription(socket.request.session.user, course, function(err, subs) {
			if(subs && subs.canSubscribe) {
			    socket.course = course;
			    next();
			}
		    });
		});
	    }
	    else
		console.log("refused");
	});
	
	
/*	socket.on("chooseCourse", function(courseID) {
	    Course.getByID(parseInt(courseID), function (err, course) {
		User.getSubscription(socket.request.session.user, course, function(err, subs) {
		    if(subs && subs.canSubscribe)
			socket.course = course;
		});
	    });
	});
*/
	socket.on('getUser', function (courseID, filter) {
	    socket.filter = filter;
	    socket.filter.courseID = socket.course.id;
	    User.userListByFilter(filter, (err, results) => {
		socket.emit("users", results);
	    });
	});
	
	socket.on('subscribeList', function (courseID, studentList) {
	    async.forEach(studentList,
			  (studentID, callback) => {
			      Course.subscribeStudent(studentID, socket.course.id, callback);
			  },
			  (err, results) => {
			      if(err) console.log(err);
			      if(!socket.filter)
				  socket.filter={};
			      socket.filter.courseID = socket.course.id;
			      User.userListByFilter(socket.filter, (err, results) => {
				  socket.emit("users", results);
			      });
			  });
	});

	socket.on('subscribeListTDMan', function (courseID, studentList, permission) {
	    if(socket.course.ownerID == socket.request.session.user.id) {
		async.forEach(studentList,
			      (studentID, callback) => {
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
	socket.on('unSubscribeList', function (courseID, studentList) {
	    async.forEach(studentList,
			  (studentID, callback) => {
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
};
