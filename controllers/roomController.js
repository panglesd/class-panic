var User = require('../models/user');
var Room = require('../models/room');
var Set = require('../models/set');

var async = require('async');


exports.room_list = function(req, res) {
    //    res.send('NOT IMPLEMENTED: Room list');
    async.parallel(
	{
	    title : function(callback) { callback(null, "ClassPanic: Rejoindre une salle")},
	    user : function (callback) {
		callback(null, req.session.user);
	    },
	    roomList : function (callback) {
		Room.list(callback);
	    }
	},
	function (err, results) {
	    //	    console.log(results);
	    res.render('rooms', results)
	});
};


exports.room_admin_all = function(req, res) {
    //    res.send('NOT IMPLEMENTED: Room list');
    async.parallel(
	{
	    title : function(callback) { callback(null, "ClassPanic: Administrer une salle")},
	    user : function (callback) {
		callback(null, req.session.user);
	    },
	    roomList : function (callback) {
		Room.list(callback);
	    },
	    roomOwnedList :  function (callback) {
		Room.ownedList(req.session.user, function (r) { callback(null, r) });
	    },
	    setOwnedList :  function (callback) {
		Set.setOwnedList(req.session.user, callback);
	    }
	},
	function (err, results) {
//	    console.log(results);
	    res.render('admin_rooms', results)
	});
};
exports.room_manage_all = function(req, res) {
    //    res.send('NOT IMPLEMENTED: Room list');
    async.parallel(
	{
	    title : function(callback) { callback(null, "ClassPanic: ... une salle")},
	    user : function (callback) {
		callback(null, req.session.user);
	    },
	    roomList : function (callback) {
		Room.list(callback);
	    },
	    roomOwnedList :  function (callback) {
		Room.ownedList(req.session.user, function (r) { callback(null, r) });
	    },
	    setOwnedList :  function (callback) {
		Set.setOwnedList(req.session.user, callback);
	    }
	},
	function (err, results) {
//	    console.log(results);
	    res.render('manage_rooms', results)
	});
};


exports.room_detail = function(req, res) {
    res.send('NOT IMPLEMENTED: Author detail: ' + req.params.id);
};



exports.room_create_post = function(req, res) {
    Room.create(req.session.user, req.body, function () {
    res.redirect('/classPanic/manage/room');
    });
};


exports.room_delete = function(req, res) {
//    Room.roomDelete(req.session.user, req.params.id, function () {
//	res.redirect("/manage/room");
//    });
};


exports.room_delete_post = function(req, res) {
    Room.delete(req.session.user, req.params.id, function () {
	res.redirect("/classPanic/manage/room");
    });
};



exports.room_update_post = function(req, res) {
    //    console.log(req.body);
    Room.update(req.session.user, req.params, req.body, function (id) {
	res.redirect('/classPanic/manage/room/');
    });
};

exports.room_manage = function (req, res) {
    Room.getOwnedByID(req.session.user, req.params.id, function (err, thisRoom) {
	async.parallel(
	    {
		title : function(callback) { callback(null, "ClassPanic: Administrer "+thisRoom.name)},
		user : function (callback) {
		    callback(null, req.session.user);
		},
		room :  function (callback) {
		    callback(null, thisRoom);
		},
	    	setOwnedList :  function (callback) {
		    Set.setOwnedList(req.session.user, callback);
		}
	    },
	    function (err, results) {
		console.log(results);
		res.render('manage_room', results);
	    });
    });
};
