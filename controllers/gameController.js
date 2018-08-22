var user = require('../models/user');
var Room = require('../models/room');
var set = require('../models/set');
var async = require('async');

// Controlleur pour entrer dans une room

exports.room_enter = function(req, res) {
    async.parallel(
	{
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
	    room : function (callback) {
		Room.getOwnedByID(req.session.user, req.params.id, callback)
	    },
	    set : function (callback) {
		question.listByRoomID(req.params.id, function (e,b) {callback(e,b)});
	    },
	    roomList : function (callback) {
		Room.list(callback);
	    },
	    roomOwnedList :  function (callback) {
		Room.ownedList(req.session.user, function (r) { callback(null, r) });
	    },
	    setOwnedList :  function (callback) {
		set.setOwnedList(req.session.user, callback);
	    }
	},
	function (err, results) {
	    res.render('play_admin', results);
	});
};
