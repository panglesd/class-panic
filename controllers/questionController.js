var User = require('../models/user');
var Room = require('../models/room');
var Set = require('../models/set');
var Question = require('../models/question');
var async = require('async');

exports.question_list = function(req, res) {
    //    res.send('NOT IMPLEMENTED: Room list');
    async.parallel(
	{
	    title : function(callback) { callback(null, "ClassPanic: Gérer vos sets de questions")},
	    user : function (callback) {
		callback(null, req.session.user);
	    },
	    questionList : function (callback) {
		Question.listOwnedFromSetId(req.params.setId,function (e,b) {callback(e,b)});
	    },
	    set : function (callback) {
		Set.setOwnedGet(req.session.user, req.params.setId, callback);
	    },
	    title : function(callback) { callback(null, "Class Panic: Modification d'un set")}
/*	    roomList : function (callback) {
		room.roomList(callback);
	    },
	    roomOwnedList :  function (callback) {
		room.roomOwnedList(req.session.user, function (r) { callback(null, r) });
	    },*/
	},
	function (err, results) {
	    console.log(results.questionList);
	    res.render('questions', results)
	});
};

exports.questionShow = function(req, res) {
    //    res.send('NOT IMPLEMENTED: Room list');
    async.parallel(
	{
	    title : function(callback) { callback(null, "ClassPanic: Gérer vos sets de questions")},
	    user : function (callback) {
		callback(null, req.session.user);
	    },
	    question : function (callback) {
		Question.getOwnedByID(req.params.questionId,function (e,b) {callback(e,b)});
	    },
	    title : function(callback) { callback(null, "Class Panic: Modification d'un set")},
	    set : function (callback) {
		Set.setOwnedGet(req.session.user, req.params.setId, callback);
	    }
/*	    roomList : function (callback) {
		room.roomList(callback);
	    },
	    roomOwnedList :  function (callback) {
		room.roomOwnedList(req.session.user, function (r) { callback(null, r) });
	    },*/
	},
	function (err, results) {
	    console.log(results.questionList);
	    res.render('questioqzdn', results)
	});
};


exports.question_update_post = function(req, res) {
    //    res.send('NOT IMPLEMENTED: Room list');
    Question.questionUpdate(req.session.user, req.params, req.body, function() {
	//	exports.question_update_get(req, res);
	res.redirect("/classPanic/manage/set/"+req.params.idSet);
    });
};

exports.question_update_get = function(req, res) {
    //    res.send('NOT IMPLEMENTED: Room list');
    async.parallel(
	{
	    title : function(callback) { callback(null, "ClassPanic: Gérer vos sets de questions")},
	    user : function (callback) {
		callback(null, req.session.user);
	    },
	    question : function (callback) {
		Question.getOwnedByID(req.session.user, req.params.id,function (e,b) {callback(e,b)});
	    },
	    newQuestion : function (callback) { callback(null, false) },
	    title : function(callback) { callback(null, "Class Panic: Modification d'un set")},
	    set : function (callback) {
		Set.setOwnedGet(req.session.user, req.params.idSet, callback);
	    }
/*	    roomList : function (callback) {
		room.roomList(callback);
	    },
	    roomOwnedList :  function (callback) {
		room.roomOwnedList(req.session.user, function (r) { callback(null, r) });
	    },*/
	},
	function (err, results) {
//	    console.log(results.questionList);
	    res.render('manage_question', results)
	});
};

exports.question_create_get = function(req, res) {
    //    res.send('NOT IMPLEMENTED: Room list');
    tmp = {};
    Set.setOwnedGet(req.session.user, req.params.idSet, function(err, r) {
	options = {
	    title: "ClassPanic : créer une nouvelle question",
	    user : req.session.user,
	    newQuestion: true,
	    question: {
		reponses : [{
		    reponse: "",
		    validity: false
		}],
		enonce: ""
	    },
	    set : r
	};
//	console.log(options);
	res.render('manage_question', options);
    });
//    Question.questionCreate(req.session.user, req.params, req.body, function() { exports.question_update_get(req, res);});
};

exports.question_create_post = function(req, res) {
    //    res.send('NOT IMPLEMENTED: Room list');
//    console.log("petit poucet");
    Question.questionCreate(req.session.user, req.body, {id:req.params.idSet}, function(err, id) { res.redirect("/classPanic/manage/set/"+req.params.idSet) ; });
};


exports.question_delete_post = function(req, res) {
    //    res.send('NOT IMPLEMENTED: Room list');
//    console.log("petit poucet");
    Question.questionDelete(req.session.user, req.params,  function(err, id) { res.redirect("/classPanic/manage/set/"+req.params.idSet) ; });
};
