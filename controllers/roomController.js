var user = require('../models/user');
var room = require('../models/room');
var set = require('../models/set');
var async = require('async');

// Display list of all Authors.
exports.room_list = function(req, res) {
    //    res.send('NOT IMPLEMENTED: Room list');
    async.parallel(
	{
	    user : function (callback) {
		callback(null, req.session.user);
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
//	    console.log(results);
	    res.render('rooms', results)
	});
};

// Display detail page for a specific Author.
exports.room_detail = function(req, res) {
    res.send('NOT IMPLEMENTED: Author detail: ' + req.params.id);
};

// Display Author create form on GET.
exports.room_create = function(req, res) {
    res.send('NOT IMPLEMENTED: Room create GET');
};

// Handle Author create on POST.
exports.room_create_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Author create POST');
};

// Display Author delete form on GET.
exports.room_delete = function(req, res) {
    res.send('NOT IMPLEMENTED: Room delete GET');
};

// Handle Author delete on POST.
exports.room_delete_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Author delete POST');
};

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

// Display Author update form on GET.
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

// Handle Author update on POST.
exports.room_update_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Author update POST');
};
