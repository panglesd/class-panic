var user = require('../models/user');
var room = require('../models/room');
var set = require('../models/set');
var async = require('async');

exports.set_manage_all = function(req, res) {
    //    res.send('NOT IMPLEMENTED: Room list');
    async.parallel(
	{
	    title : function(callback) { callback(null, "ClassPanic: Gérer vos sets de questions")},
	    user : function (callback) {
		callback(null, req.session.user);
	    },
/*	    roomList : function (callback) {
		room.roomList(callback);
	    },
	    roomOwnedList :  function (callback) {
		room.roomOwnedList(req.session.user, function (r) { callback(null, r) });
	    },*/
	    setOwnedList :  function (callback) {
		set.setOwnedList(req.session.user, callback);
	    }
	},
	function (err, results) {
	    console.log(results);
	    res.render('manage_sets', results)
	});
};


exports.set_manage = function(req, res) {
    //    res.send('NOT IMPLEMENTED: Room list');
    async.parallel(
	{
	    title : function(callback) { callback(null, "ClassPanic: Gérer vos sets de questions")},
	    user : function (callback) {
		callback(null, req.session.user);
	    },
	    questionList : function (callback) {
		question.questionListFromSetId(req.params.id,function (e,b) {callback(e,b)});
	    },
	    set : function (callback) {
		set.setGet(req.session.user, req.params.id, callback);
	    }
/*	    roomList : function (callback) {
		room.roomList(callback);
	    },
	    roomOwnedList :  function (callback) {
		room.roomOwnedList(req.session.user, function (r) { callback(null, r) });
	    },*/
	},
	function (err, results) {
	    console.log(results);
	    res.render('questions', results)
	});
};
