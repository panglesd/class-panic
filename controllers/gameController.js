var user = require('../models/user');
var Room = require('../models/room');
var Course = require('../models/course');
var Set = require('../models/set');
var Question = require('../models/question');
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
		Course.getByID(req.params.idCourse, callback);
	    },
	    config : function(callback) { /*console.log(config);*/ callback(null, config) },	
	    room : function (callback) {
		Room.getByID(req.params.id, callback)
	    }
	},
	function (err, results) {
	    res.render('play', results);
	});
};

// Controlleur pour administrer une room

exports.room_admin = function(req, res) {
    async.parallel(
	{
	    user : function (callback) {
		callback(null, req.session.user);
	    },
	    server : function(callback) {
		callback(null, req.protocol + '://' + req.get('host') );
	    },
	    config : function(callback) { callback(null, config) },	
	    room : function (callback) {
		Room.getOwnedByID(req.session.user, req.params.id, callback)
	    },
	    set : function (callback) {
		Question.listByRoomID(req.params.id, function (e,b) {callback(e,b)});
	    },
	    roomList : function (callback) {
		Room.listOfCourse(req.params.idCourse, callback);
	    },
	    roomOwnedList :  function (callback) {
		Room.ownedList(req.session.user, function (r) { callback(null, r) });
	    },
	    setOwnedList :  function (callback) {
		Set.setOwnedList(req.session.user, req.params.idCourse, callback);
	    }
	},
	function (err, results) {
	    res.render('play_admin', results);
	});
};
