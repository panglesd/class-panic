var User = require('../models/user');
var Course = require('../models/course');
var Room = require('../models/room');
var Set = require('../models/set');
var config = require('../configuration');
var async = require('async');



/*************************************************************/
/*         Fonctions render pour les rooms                   */
/*************************************************************/

// Render courses.ejs

renderCourses = function(user, msgs, res) {
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
	    courseList : function (callback) {
		Course.subscribedCourses(user,callback);
	    }          
	},
	function (err, results) {
//	    console.log(results);
	    res.render('courses', results)
	});
}

// Render manage_room.ejs

// renderRoomManage = function (req, res, msgs) {
renderCourseManage = function (user, courseID, msgs, res) {
    Course.getOwnedByID(user, courseID, function (err, course) {
	async.parallel(
	    {
		title : function(callback) { callback(null, "ClassPanic: Administrer "+course.name)},
		config : function(callback) { callback(null, config) },	
		user : function (callback) {
		    callback(null, user);
		},
		course :  function (callback) {
		    callback(null, course);
		},
		msgs : function(callback) {
		    callback(null, msgs);
		},
		roomOwnedList :  function (callback) {
		    Room.getFromOwnedCourse(user, courseID, callback);
		},
		students :  function (callback) {
		    Course.students(user, courseID, (err, res) => {callback(err, res)});
		},
		setOwnedList :  function (callback) {
		    Set.setOwnedList(user, callback);
		}
	    },
	    function (err, results) {
		res.render('manage_course', results);
	    });
    });
};

// Render manage_rooms.ejs

renderManageCourses = function(user, msgs, res) {
    async.parallel(
	{
	    title : function(callback) { callback(null, "ClassPanic: ... une salle")},
	    config : function(callback) { callback(null, config) },	
	    user : function (callback) {
		callback(null, user);
	    },
/*	    courseList : function (callback) {
		Course.list(callback);
	    },*/
	    msgs : function(callback) {
		callback(null, msgs);
	    },
	    courseOwnedList :  function (callback) {
		Course.ownedList(user, callback);
	    }
/*	    setOwnedList :  function (callback) {
		Set.setOwnedList(user, callback);
	    }*/
	},
	function (err, results) {
	    res.render('manage_courses', results)
	});
};

/*************************************************************/
/*         Controlleurs GET pour les rooms                   */
/*************************************************************/

// Afficher la liste des rooms afin d'y participer

exports.courses_list = function(req, res) {
    console.log("yo");
    renderCourses(req.session.user, [], res);
};


// Afficher le détails d'une room pour la modifier

exports.course_manage = function (req, res) {
    renderCourseManage(req.session.user, req.params.idCourse, [], res);
};

// Afficher la liste des rooms afin de les manager

exports.course_manage_all = function(req, res) {
    renderManageCourses(req.session.user, [], res);
};

exports.subscribe_list = function(req, res) {
    Course.getOwnedByID(req.session.user, req.params.idCourse, function (err, course) {
	async.parallel(
	    {
		title : function(callback) { callback(null, "ClassPanic: ... une salle")},
		config : function(callback) { callback(null, config) },	
		server : function(callback) {
		    callback(null, req.protocol + '://' + req.get('host') );
		},
		user : function (callback) {
		    callback(null, req.session.user);
		},
		course :  function (callback) {
		    callback(null, course);
		},
		msgs : function(callback) {
		    callback(null, "");
		},
	    },
	    function (err, results) {
		res.render('manage_subscription', results);
	    });
    });	
}

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
/*************************************************************/
/*         Controlleurs POST pour modifier les rooms         */
/*************************************************************/

// Create

exports.room_create_post = function(req, res) {
    if(req.body.questionSet) {
	Room.create(req.session.user, req.body, function (err,r) {
	    //	    res.redirect(config.PATH+'/manage/room');
	    //	    console.log(req.body);
	    if(err)
		renderManageRooms(req.session.user, ["Impossible de créer la room !"], res);
	    else
		renderManageRooms(req.session.user, ["Room  créée !"], res);
	});
    }
    else {
	renderManageRooms(req.session.user, ["Impossible de créer la room : merci de spécifier un set valide à associer"], res);
//	res.redirect(config.PATH+'/manage/room');
    }
};

//Delete

exports.room_delete_post = function(req, res) {
    Room.delete(req.session.user, req.params.id, function (err, info) {
	if(err)
	    renderManageRooms(req.session.user, ["Impossible de supprimer la room"], res);
	else
	    renderManageRooms(req.session.user, ["Room supprimée"], res);
//	res.redirect(config.PATH+"/manage/room");
    });
};

//Update

exports.room_update_post = function(req, res) {
    Room.update(req.session.user, req.params, req.body, function (id) {
	if(err)
	    renderRoomManage(req.session.user, req.params.id, ["Impossible de modifier la room"], res);
	else
	    renderRoomManage(req.session.user, req.params.id, ["Room updaté"], res);
//	res.redirect(config.PATH+'/manage/room/');
    });
};