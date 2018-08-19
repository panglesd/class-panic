var User = require('../models/user');
var Room = require('../models/room');
var Set = require('../models/set');
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
		Set.setOwnedList(req.session.user, callback);
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
		question.listOwnedBySetID(req.session.user, req.params.id,function (e,b) {callback(e,b)});
	    },
	    set : function (callback) {
		Set.setOwnedGet(req.session.user, req.params.id, callback);
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
	    res.render('manage_set', results)
	});
};


exports.set_create_post = function(req, res) {
    Set.setCreate(req.session.user, req.body, function (err, set) {
//	console.log("what I got ",set);
	res.redirect('/classPanic/manage/set/'+set.id);
    });
};

exports.set_delete_post = function(req, res) {
    Set.setDelete(req.session.user, req.params, function (err, set) {
//	console.log("what I got ",set);
	res.redirect('/classPanic/manage/set');
    });
};

exports.set_update_post = function(req, res) {
    Set.setUpdate(req.session.user, req.params, req.body, function (err, set) {
//	console.log("what I got ",set);
	res.redirect('/classPanic/manage/set');
    });
};
