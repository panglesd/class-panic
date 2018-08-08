var user = require('../models/user');
var room = require('../models/room');
var set = require('../models/set');
var async = require('async');

// Display Author update form on GET.
exports.room_enter = function(req, res) {
    async.parallel(
	{
	    room : function (callback) {
		room.roomGetFromID(req.params.id, callback)
	    }
	},
	function (err, results) {
	    //	    console.log(results);
	    res.render('play', results);
	});
};

exports.room_admin = function(req, res) {
    //res.send('NOT IMPLEMENTED: Roome enter GET');
    async.parallel(
	{
	    user : function (callback) {
		callback(null, req.session.user);
	    },
	    room : function (callback) {
		room.roomGetFromID(req.params.id, callback)
	    },
	    set : function (callback) {
		question.questionListFromRoomId(req.params.id, callback);
	    },
	    roomList : function (callback) {
		room.roomList(callback);
	    },
	    roomOwnedList :  function (callback) {
		room.roomOwnedList(req.session.user, function (r) { callback(null, r) });
	    },
	    setOwnedList :  function (callback) {
		set.setOwnedList(req.session.user, callback);
	    }
	},
	function (err, results) {
	    console.log("this one", results);
	    res.render('admin', results);
//	    res.render('rooms', results)
	});
};
