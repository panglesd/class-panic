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
		Room.roomList(callback);
	    },
	    roomOwnedList :  function (callback) {
		Room.roomOwnedList(req.session.user, function (r) { callback(null, r) });
	    },
	    setOwnedList :  function (callback) {
		Set.setOwnedList(req.session.user, callback);
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
		Room.roomList(callback);
	    },
	    roomOwnedList :  function (callback) {
		Room.roomOwnedList(req.session.user, function (r) { callback(null, r) });
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
		Room.roomList(callback);
	    },
	    roomOwnedList :  function (callback) {
		Room.roomOwnedList(req.session.user, function (r) { callback(null, r) });
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
    Room.roomCreate(req.session.user, req.body, function () {
    res.redirect('/classPanic/manage/room');
    });
};


exports.room_delete = function(req, res) {
//    Room.roomDelete(req.session.user, req.params.id, function () {
//	res.redirect("/manage/room");
//    });
};


exports.room_delete_post = function(req, res) {
    Room.roomDelete(req.session.user, req.params.id, function () {
	res.redirect("/classPanic/manage/room");
    });
};



exports.room_update_post = function(req, res) {
    //    console.log(req.body);
    Room.roomUpdate(req.session.user, req.params, req.body, function (id) {
	res.redirect('/classPanic/manage/room/');
    });
};

exports.room_manage = function (req, res) {
    bdd.query("SELECT * FROM `rooms` WHERE `id` = ? AND `owner` = ?", [req.params.id, req.session.user.pseudo], function (err, rows) {
	thisRoom = rows[0];
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
