var User = require('../models/user');
var Room = require('../models/room');
var Set = require('../models/set');
var Question = require('../models/question');
var config = require("./../configuration");

var async = require('async');

/*************************************************************/
/*         Controlleurs GET pour les questions               */
/*************************************************************/

// Afficher la liste des questions

exports.question_list = function(req, res) {
    async.parallel(
	{
	    title: function(callback) { callback(null, "ClassPanic: Gérer vos sets de questions")},
	    config: function(callback) { callback(null, config) },	
	    user: function (callback) {
		callback(null, req.session.user);
	    },
	    questionList: function (callback) {
		Question.listOwnedFromSetId(req.params.setId,function (e,b) {callback(e,b)});
	    },
	    set: function (callback) {
		Set.setOwnedGet(req.session.user, req.params.setId, callback);
	    },
	    title: function(callback) { callback(null, "Class Panic: Modification d'un set")}
	},
	function (err, results) {
	    console.log(results.questionList);
	    res.render('questions', results)
	});
};

// Afficher le détails d'une question

exports.questionShow = function(req, res) {
    async.parallel(
	{
	    title: function(callback) { callback(null, "ClassPanic: Gérer vos sets de questions")},
	    config: function(callback) { callback(null, config) },	
	    user: function (callback) {
		callback(null, req.session.user);
	    },
	    question: function (callback) {
		Question.getOwnedByID(req.params.questionId,function (e,b) {callback(e,b)});
	    },
	    title: function(callback) { callback(null, "Class Panic: Modification d'un set")},
	    set: function (callback) {
		Set.setOwnedGet(req.session.user, req.params.setId, callback);
	    }
	},
	function (err, results) {
	    console.log(results.questionList);
	    res.render('questioqzdn', results)
	});
};

// Pour commencer à créer une question

exports.question_create_get = function(req, res) {
    tmp = {};
    Set.setOwnedGet(req.session.user, req.params.idSet, function(err, r) {
	options = {
	    title: "ClassPanic : créer une nouvelle question",
	    user: req.session.user,
	    config: function(callback) { callback(null, config) },	
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
	res.render('manage_question', options);
    });
};

// Pour commencer à modifier une question 

exports.question_update_get = function(req, res) {
    async.parallel(
	{
	    title: function(callback) { callback(null, "ClassPanic: Gérer vos sets de questions")},
	    config: function(callback) { callback(null, config) },	
	    user: function (callback) {
		callback(null, req.session.user);
	    },
	    question: function (callback) {
		Question.getOwnedByID(req.session.user, req.params.id,function (e,b) {callback(e,b)});
	    },
	    newQuestion: function (callback) { callback(null, false) },
	    title: function(callback) { callback(null, "Class Panic: Modification d'un set")},
	    set: function (callback) {
		Set.setOwnedGet(req.session.user, req.params.idSet, callback);
	    }
	},
	function (err, results) {
	    res.render('manage_question', results)
	});
};


/*************************************************************/
/*         Controlleurs POST pour modifier les questions     */
/*************************************************************/

// Create

exports.question_create_post = function(req, res) {
    Question.questionCreate(req.session.user, req.body, {id:req.params.idSet}, function(err, id) { res.redirect(config.PATH+"/manage/set/"+req.params.idSet) ; });
};

// Update

exports.question_update_post = function(req, res) {
    Question.questionUpdate(req.session.user, req.params, req.body, function() {
	res.redirect(config.PATH+"/manage/set/"+req.params.idSet);
    });
};

// Delete

exports.question_delete_post = function(req, res) {
    Question.questionDelete(req.session.user, req.params,  function(err, id) { res.redirect(config.PATH+"/manage/set/"+req.params.idSet) ; });
};
