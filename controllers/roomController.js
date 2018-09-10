var User = require('../models/user');
var Room = require('../models/room');
var Set = require('../models/set');
var config = require('../configuration');
var async = require('async');



/*************************************************************/
/*         Fonctions render pour les rooms                   */
/*************************************************************/

// Render rooms.ejs

renderRooms = function(req, res, msgs) {
    async.parallel(
	{
	    title : function(callback) { callback(null, "ClassPanic: Rejoindre une salle")},
	    config : function(callback) { callback(null, config) },	
	    user : function (callback) {
		callback(null, req.session.user);
	    },
	    msgss : function(callback) {
		callback(null, msgs);
	    },
	    roomList : function (callback) {
		Room.list(callback);
	    }
	},
	function (err, results) {
	    console.log(results);
	    res.render('rooms', results)
	});
}

// Render manage_room.ejs

renderRoomManage = function (req, res, msgs) {
    Room.getOwnedByID(req.session.user, req.params.id, function (err, thisRoom) {
	async.parallel(
	    {
		title : function(callback) { callback(null, "ClassPanic: Administrer "+thisRoom.name)},
		config : function(callback) { callback(null, config) },	
		user : function (callback) {
		    callback(null, req.session.user);
		},
		room :  function (callback) {
		    callback(null, thisRoom);
		},
		msgs : function(callback) {
		    callback(null, msgs);
		},
	    	setOwnedList :  function (callback) {
		    Set.setOwnedList(req.session.user, callback);
		}
	    },
	    function (err, results) {
		res.render('manage_room', results);
	    });
    });
};

// Render manage_rooms.ejs

renderManageRooms = function(req, res, msgs) {
    async.parallel(
	{
	    title : function(callback) { callback(null, "ClassPanic: ... une salle")},
	    config : function(callback) { callback(null, config) },	
	    user : function (callback) {
		callback(null, req.session.user);
	    },
	    roomList : function (callback) {
		Room.list(callback);
	    },
	    msgs : function(callback) {
		callback(null, msgs);
	    },
	    roomOwnedList :  function (callback) {
		Room.ownedList(req.session.user, function (r) { callback(null, r) });
	    },
	    setOwnedList :  function (callback) {
		Set.setOwnedList(req.session.user, callback);
	    }
	},
	function (err, results) {
	    res.render('manage_rooms', results)
	});
};

/*************************************************************/
/*         Controlleurs GET pour les rooms                   */
/*************************************************************/

// Afficher la liste des rooms afin d'y participer

exports.room_list = function(req, res) {
    renderRooms(req,res,[]);
};


// Afficher le détails d'une room pour la modifier

exports.room_manage = function (req, res) {
    renderRoomManage(req, res, []);
};

// Afficher la liste des rooms afin de les manager

exports.room_manage_all = function(req, res) {
    renderManageRooms(req, res, []);
};


/*************************************************************/
/*         Controlleurs POST pour modifier les rooms         */
/*************************************************************/

// Create

exports.room_create_post = function(req, res) {
    if(req.body.questionSet) {
	Room.create(req.session.user, req.body, function (err) {
	    //	    res.redirect(config.PATH+'/manage/room');
	    console.log(req.body);
	    renderRoomManage(req, res, "Room  créée !");
	});
    }
    else {
	res.redirect(config.PATH+'/manage/room');
    }
};

//Delete

exports.room_delete_post = function(req, res) {
    Room.delete(req.session.user, req.params.id, function () {
	res.redirect(config.PATH+"/manage/room");
    });
};

//Update

exports.room_update_post = function(req, res) {
    Room.update(req.session.user, req.params, req.body, function (id) {
	res.redirect(config.PATH+'/manage/room/');
    });
};
