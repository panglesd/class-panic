var User = require('../models/user');
var Course = require('../models/course');
var Room = require('../models/room');
var Set = require('../models/set');
var config = require('../configuration');
var async = require('async');



/*************************************************************/
/*         Fonctions render pour les courses                 */
/*************************************************************/

// Render courses.ejs

let renderCourses = function(user, msgs, req, res) {
    async.parallel(
	{
	    title : function(callback) { callback(null, "Big Sister: Rejoindre une salle");},
	    config : function(callback) { callback(null, config); },	
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
	    res.render('courses', results);
	});
};

// Render course.ejs

let renderCourse = function(user, course, msgs, req, res) {
    async.parallel(
	{
	    title : function(callback) { callback(null, "Big Sister: Rejoindre une salle");},
	    config : function(callback) { callback(null, config); },	
	    user : function (callback) {
		callback(null, user);
	    },
	    roomList : function(callback) {
		Room.listOfCourse(courseID, callback);
	    },
	    subscription: function(callback) {
		callback(null, req.subscription);
	    },
	    course : function(callback) {
		callback(null, course);
	    },
	    msgs : function(callback) {
		callback(null, msgs);
	    }
	},
	function (err, results) {
	    res.render('course', results);
	});
};

// Render manage_room.ejs

// renderRoomManage = function (req, res, msgs) {
let renderCourseManage = function (user, course, msgs, req, res) {
    async.parallel(
	{
	    title : function(callback) { callback(null, "Big Sister: Administrer "+course.name);},
	    config : function(callback) { callback(null, config); },	
	    user : function (callback) {
		callback(null, user);
	    },
	    course :  function (callback) {
		callback(null, course);
	    },
	    msgs : function(callback) {
		callback(null, msgs);
	    },
	    roomList : function(callback) {
		Room.listOfCourse(course.id, callback);
	    },
	    subscription: function(callback) {
		callback(null, req.subscription);
	    },
	    roomOwnedList :  function (callback) {
		Room.getFromOwnedCourse(user, course.id, callback);
	    },
	    setOwnedList :  function (callback) {
		Set.setOwnedList(user, course.id, callback);
	    }
	},
	function (err, results) {
	    res.render('manage_course', results);
	});
};

// Render manage_courses.ejs

let renderManageCourses = function(user, msgs, req, res) {
    async.parallel(
	{
	    title : function(callback) { callback(null, "Big Sister: ... une salle");},
	    config : function(callback) { callback(null, config); },	
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
		Course.subscribedCourses(user, callback);
	    }
/*	    setOwnedList :  function (callback) {
		Set.setOwnedList(user, callback);
	    }*/
	},
	function (err, results) {
	    res.render('manage_courses', results);
	});
};

/*************************************************************/
/*         Controlleurs GET pour les rooms                   */
/*************************************************************/

// User Space

// Afficher la liste des cours

exports.courses_list = function(req, res) {
    renderCourses(req.session.user, req.msgs, req, res);
};

exports.course = function(req, res) {
    renderCourse(req.session.user, req.course, req.msgs, req, res);
}

// Admin Space

// Afficher le détails d'une room pour la modifier

exports.course_manage = function (req, res) {
    renderCourseManage(req.session.user, req.course, req.msgs, req, res);
};

// Afficher la liste des rooms afin de les manager

exports.course_manage_all = function(req, res) {
    renderManageCourses(req.session.user, req.msgs, req, res);
};



/*************************************************************/
/*         Controlleurs GET pour la souscription             */
/*************************************************************/

exports.subscribe_list = function(req, res) {
    async.parallel(
	{
	    title : function(callback) { callback(null, "Big Sister: ... une salle")},
	    config : function(callback) { callback(null, config) },	
	    server : function(callback) {
		callback(null, req.protocol + '://' + req.get('host') );
	    },
	    user : function (callback) {
		callback(null, req.session.user);
	    },
	    subscription: function(callback) {
		callback(null, req.subscription);
	    },
	    course :  function (callback) {
		callback(null, req.course);
	    },
	    students :  function (callback) {
		Course.students(req.course.id, (err, res) => {if(err) console.log(err); callback(err, res)});
	    },
	    msgs : function(callback) {
		callback(null, "");
	    },
	},
	function (err, results) {
	    res.render('manage_subscription', results);
	});
}

/*************************************************************/
/*         Controlleurs POST pour modifier les courses       */
/*************************************************************/

// Create

exports.course_create_post = function(req, res) {
    if(req.body.name) {
	Course.create(req.session.user, req.body, function (err,r) {
	    //	    res.redirect(config.PATH+'/manage/room');
	    if(err) {
		renderManageCourses(req.session.user, ["Impossible de créer le cours !"], req, res);
	    }
	    else
		renderManageCourses(req.session.user, ["Cours  créée !"], req, res);
		// Le mieux serait de rediriger avec un message
	});
    }
    else {
	renderManageCourses(req.session.user, ["Impossible de créer le course, insultez Paul-Elliot pour vous en plaindre"], req, res);
//	res.redirect(config.PATH+'/manage/room');
    }
};

//Delete

exports.course_delete_post = function(req, res) {
    Course.delete(req.session.user, req.course.id, function (err, info) {
	if(err) {
	    req.msgs.push("Impossible de supprimer le cours");
	    exports.course_manage_all(req, res);
	}
	else {
	    req.msgs.push("Cours supprimé");
	    exports.course_manage_all(req, res);
	    //	res.redirect(config.PATH+"/manage/room");
	}
    });
};

//Update

exports.course_update_post = function(req, res) {
    Course.update(req.session.user, req.course.id, req.body, function (err, id) {
	if(err) {
	    console.log(err);
	    req.msgs.push("Impossible de modifier le cours");
	    exports.course_manage(req, res);
//	    renderRoomManage(req.session.user, req.params.id, req.msgs, res);
	}
	else {
	    req.msgs.push("Cours updaté");
	    Course.getByID(req.course.id, (err, courseUpdated) => {
		req.course = courseUpdated;
		exports.course_manage(req, res);
	    });
	    //	res.redirect(config.PATH+'/manage/room/');
	}
    });
};
