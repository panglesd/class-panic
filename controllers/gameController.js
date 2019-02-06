var sanit_fn = require("sanitize-filename");
var docController = require('./docController');

var user = require('../models/user');
var Room = require('../models/room');
var Course = require('../models/course');
var Set = require('../models/set');
var Question = require('../models/question');
var Game = require('../models/game');
var Stats = require('../models/stats');
var async = require('async');
var config = require("./../configuration");

// Controlleur pour entrer dans une room

exports.room_enter = function(req, res) {
    async.parallel(
	{
	    server : function(callback) {
		callback(null, req.protocol + '://' + req.get('host') );
	    },
	    course: function(callback) {
		//		Course.getByID(req.params.idCourse, callback);
		callback(null, req.course);
	    },
	    config : function(callback) { /*console.log(config);*/ callback(null, config); },	
	    room : function (callback) {
		Room.getByID(req.params.roomID, (err, res) => {callback(err, res); });
	    }
	},
	function (err, results) {
//	    console.log("resultsssssss", results, req.params);
	    res.render('play', results);
	});
};

// Controlleur pour administrer une room

exports.room_admin = function(req, res) {
    if(req.subscription.isTDMan) {
//    if(true) {
	async.parallel(
	    {
		user : function (callback) {
		    callback(null, req.session.user);
		},
		server : function(callback) {
		    callback(null, req.protocol + '://' + req.get('host') );
		},
		config : function(callback) { callback(null, config); },	
		course: function(callback) {
		    //		Course.getByID(req.params.idCourse, callback);
		    callback(null, req.course);
		},
		room : function (callback) {
		    Room.getByID(req.params.roomID, callback);
//		    Room.getByID( req.params.id, callback)
		},
		set : function (callback) {
		    Question.listByRoomID(req.params.roomID, function (e,b) {callback(e,b);});
		},
		roomList : function (callback) {
		    Room.listOfCourse(req.course.id, callback);
		},
		roomOwnedList :  function (callback) {
		    Room.ownedList(req.session.user, function (r) { callback(null, r); });
		},
		setOwnedList :  function (callback) {
		    Set.setOwnedList(req.session.user, req.course.id, callback);
		}
	    },
	    function (err, results) {
//		console.log(results);
		res.render('play_admin', results);
	    });
    }
    else
	exports.room_enter(req, res);
};

// Controlleur pour cc une room

exports.room_cc = function(req, res) {
    //    if(req.subscription.isTDMan) {
    //    if(true) {
    async.parallel(
	{
	    user : function (callback) {
		callback(null, req.session.user);
	    },
	    server : function(callback) {
		callback(null, req.protocol + '://' + req.get('host') );
	    },
	    config : function(callback) { callback(null, config); },	
	    course: function(callback) {
		//		Course.getByID(req.params.idCourse, callback);
		callback(null, req.course);
	    },
	    room : function (callback) {
		Room.getByID(req.params.roomID, callback);
		//		    Room.getByID( req.params.id, callback)
	    },
	    set : function (callback) {
		Question.listByRoomID(req.params.roomID, function (e,b) {callback(e,b);});
	    },
	    roomList : function (callback) {
		Room.listOfCourse(req.course.id, callback);
	    },
	    roomOwnedList :  function (callback) {
		Room.ownedList(req.session.user, function (r) { callback(null, r); });
	    },
	    setOwnedList :  function (callback) {
		Set.setOwnedList(req.session.user, req.course.id, callback);
	    }
	},
	function (err, results) {
//	    console.log(results);
	    res.render('play_CC', results);
	});
};

// Controlleur pour cc admin une room

exports.room_cc_admin = function(req, res) {
    if(req.subscription.isTDMan) {
    //    if(true) {
	async.parallel(
	    {
		user : function (callback) {
		    callback(null, req.session.user);
		},
		server : function(callback) {
		    callback(null, req.protocol + '://' + req.get('host') );
		},
		config : function(callback) { callback(null, config); },	
		course: function(callback) {
		    //		Course.getByID(req.params.idCourse, callback);
		callback(null, req.course);
		},
		room : function (callback) {
		    Room.getByID(req.params.roomID, callback);
		    //		    Room.getByID( req.params.id, callback)
		},
		set : function (callback) {
		    Question.listByRoomID(req.params.roomID, function (e,b) {callback(e,b);});
		},
		roomList : function (callback) {
		    Room.listOfCourse(req.course.id, callback);
		},
		roomOwnedList :  function (callback) {
		    Room.ownedList(req.session.user, function (r) { callback(null, r); });
		},
		setOwnedList :  function (callback) {
		    Set.setOwnedList(req.session.user, req.course.id, callback);
		}
	    },
	    function (err, results) {
		//	    console.log(results);
		res.render('play_CC_admin', results);
	    });
    }
    else
	exports.room_cc(req,res);
};


exports.fileForStudent = function(req, res) {
//    console.log(req.params);
    Game.getFileFromSubmission(req.session.user.id, req.room, req.question, req.params.answerNumber, sanit_fn(req.params.fileName), (err, data) => {
	console.log("yo");
	docController.serveFile(data, sanit_fn(req.params.fileName), res);
    });
};
exports.fileCorrectForStudent = function(req, res) {
//    console.log(req.params);
    if(req.room.status.showTruth) {
	Question.getFileCorrect(req.question, req.params.answerNumber, sanit_fn(req.params.fileName), (err, data) => {
	    console.log("yo");
	    docController.serveFile(data, sanit_fn(req.params.fileName), res);
	});
    }
    else
	res.end("Impossible de voir la correction car la salle n'est pas dans le bon mode...");
};
exports.fileForAdmin = function(req, res) {
    console.log("yooo");
    if(req.subscription.isTDMan){
//	console.log(req.params);
	Game.getFileFromSubmission(req.params.userID, req.room, req.question, req.params.answerNumber, sanit_fn(req.params.fileName), (err, data) => {
	    console.log("yo");
	    docController.serveFile(data, sanit_fn(req.params.fileName), res);
	});
    }
    else
	exports.room_cc(req, res);
};

exports.fileCorrectForAdmin = function(req, res) {
    console.log("yooo");
    if(req.subscription.isTDMan){
	exports.fileCorrectForStudent(req,res);
//	console.log(req.params);
    }
    else
	exports.room_cc_admin(req, res);
};
