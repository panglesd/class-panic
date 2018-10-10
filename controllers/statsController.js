var User = require('../models/user');
var Course = require('../models/course');
var Room = require('../models/room');
var Question = require('../models/question');
var Set = require('../models/set');
var config = require('../configuration');
var async = require('async');
var courseController = require("./courseController");



exports.stats = (req, res) => {
        async.parallel(
	{
	    title : function(callback) { callback(null, "ClassPanic: Rejoindre une salle")},
	    config : function(callback) { callback(null, config) },	
	    user : function (callback) {
		callback(null, req.session.user);
	    },
	    msgs : function(callback) {
		callback(null, req.msgs);
	    },
	    course : function(callback) {
		Course.getByID(req.params.idCourse, callback)
	    },
	    server : function(callback) {
		callback(null, req.protocol + '://' + req.get('host') );
	    },
	    roomOwnedList : function (callback) {
		Room.ownedList(req.session.user, callback);
	    },
	    courseOwnedList : function(callback) {
		Course.ownedList(req.session.user, callback);
	    },
	    questionOwnedList : function(callback) {
		Question.ownedList(req.session.user, callback);
	    },
	    setOwnedList : function(callback) {
		Set.setOwnedListAll(req.session.user, callback);
	    }
	},
	function (err, results) {
//	    console.log(results);
	    res.render('stats', results)
	});
}
