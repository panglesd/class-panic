var User = require('../models/user');
var Course = require('../models/course');
var Room = require('../models/room');
var Set = require('../models/set');
var config = require('../configuration');
var async = require('async');
var courseController = require("./courseController");


/*************************************************************/
/*         Fonctions render pour les rooms                   */
/*************************************************************/

// Render rooms.ejs

renderRooms = function(user, msgs, res) {
    async.parallel(
	{
	    title : function(callback) { callback(null, "ClassPanic: Rejoindre une salle")},
	    config : function(callback) { callback(null, config) },	
	    user : function (callback) {
		callback(null, user);
	    },
	    msgs : function(callback) {
		callback(null, msgs);
	    },
	    roomList : function (callback) {
		Room.list(callback);
	    }
	},
	function (err, results) {
	    //	    console.log(results);
	    res.render('courses', results)
	});
}

// Render manage_room.ejs

// renderRoomManage = function (req, res, msgs) {
renderRoomManage = function (user, course, room, msgs, res) {
    async.parallel(
	{
	    title : function(callback) { callback(null, "ClassPanic: Administrer "+room.name)},
	    config : function(callback) { callback(null, config) },	
	    user : function (callback) {
		callback(null, user);
	    },
	    room :  function (callback) {
		callback(null, room);
	    },
	    course : function(callback) {
		callback(null, course);
	    },
	    msgs : function(callback) {
		callback(null, msgs);
	    },
	    setOwnedList :  function (callback) {
		Set.setOwnedList(user, course.id, callback);
	    }
	},
	function (err, results) {
	    res.render('manage_room', results);
	});
};

// Render manage_rooms.ejs

renderManageRooms = function(user, course, msgs, res) {
    async.parallel(
	{
	    title : function(callback) { callback(null, "ClassPanic: ... une salle")},
	    config : function(callback) { callback(null, config) },	
	    user : function (callback) {
		callback(null, user);
	    },
	    roomList : function (callback) {
		Room.listOfCourse(course.id, callback);
	    },
	    course : function(callback) {
		callback(null, course);
	    },
	    msgs : function(callback) {
		callback(null, msgs);
	    },
	    roomOwnedList :  function (callback) {
		Room.listOfCourse(course.id, callback);
	    },
	    setOwnedList :  function (callback) {
		Set.setOwnedList(user, course.id, callback);
	    }
	},
	function (err, results) {
	    console.log(results);
	    res.render('manage_rooms', results)
	});
};

/*************************************************************/
/*         Controlleurs GET pour les rooms                   */
/*************************************************************/

// Afficher la liste des rooms afin d'y participer

exports.room_list = function(req, res) {
    renderRooms(req.session.user, req.msgs, res);
};


// Afficher le détails d'une room pour la modifier

exports.room_manage = function (req, res) {
    renderRoomManage(req.session.user, req.course, req.room, req.msgs, res);
};

// Afficher la liste des rooms afin de les manager

exports.room_manage_all = function(req, res) {
    renderManageRooms(req.session.user, req.course, req.msgs, res);
    
};


/*************************************************************/
/*         Controlleurs POST pour modifier les rooms         */
/*************************************************************/

// Create

exports.room_create_post = function(req, res) {
    if(req.subscription.canRoomCreate) {
	if(req.body.questionSet) { 
	    Room.create(req.session.user, req.body, req.course.id, function (err,r) { // HACK DEGEU
		//	    res.redirect(config.PATH+'/manage/room');
		//	    console.log(req.body);
		if(err) {
		    console.log("err is", err)
		    req.msgs.push("Impossible de créer la room !");
		    courseController.course_manage(req,res);
		}
		else {
		    req.msgs.push("Room  créée !");
		    courseController.course_manage(req,res);
		}
	    });
	}
	else {
	    req.msgs.push("Impossible de créer la room : merci de spécifier un set valide à associer");
	    renderManageRooms(req.session.user, req.course, req.msgs, res);
	    //	res.redirect(config.PATH+'/manage/room');
	}
    }
    else {
	req.msgs.push("Vous n'avez pas la permission de créer une room");
	renderManageRooms(req.session.user, req.course, req.msgs, res);
	//	res.redirect(config.PATH+'/manage/room');
    }
};

//Delete

exports.room_delete_post = function(req, res) {
    if(req.subscription.canRoomDelete) {
	Room.delete(req.session.user, req.room.id, function (err, info) {
	    if(err) {
		req.msgs.push("Impossible de supprimer la room");
		courseController.course_manage(req,res);
	    }
	    else {
		req.msgs.push("Room supprimée");
		courseController.course_manage(req,res);
		//	res.redirect(config.PATH+"/manage/room");
	    }
	});
    }
    else {
	req.msgs.push("Vous n'avez pas les droits pour supprimer la room");
	courseController.course_manage(req,res);
	//	res.redirect(config.PATH+'/manage/room');
    }
};

//Update

exports.room_update_post = function(req, res) {
    if(req.subscription.canRoomUpdate) {
	Room.update(req.session.user, req.room, req.body, function (err, id) {
	    if(err) {
		req.msgs.push("Impossible de modifier la room");
		renderRoomManage(req.session.user, req.course, req.room, req.msgs, res);
	    }
	    else {
		req.msgs.push("Room updaté");
		Room.getByID(req.room.id, (err, roomUpdated) => {
		    req.room=roomUpdated;
		    renderRoomManage(req.session.user, req.course, req.room, req.msgs, res);
		});
		//	res.redirect(config.PATH+'/manage/room/');
	    }
	});
    }
    else {
	req.msgs.push("Vous n'avez pas le droit de modifier la room");
	renderRoomManage(req.session.user, req.course, req.room, req.msgs, res);
	//	res.redirect(config.PATH+'/manage/room');
    }
};
