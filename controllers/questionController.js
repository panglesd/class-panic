var User = require('../models/user');
var Room = require('../models/room');
var Set = require('../models/set');
var SetController = require('./setController');
var Question = require('../models/question');
var config = require("./../configuration");

var async = require('async');

/*************************************************************/
/*         Fonctions render pour les questions               */
/*************************************************************/

// render de manage_question.ejs

renderManageQuestion = function(user, questionID, setID, msgs, res) {
    async.parallel(
	{
	    title: function(callback) { callback(null, "ClassPanic: Gérer vos sets de questions")},
	    config: function(callback) { callback(null, config) },	
	    user: function (callback) {
		callback(null, user);
	    },
	    newQuestion: function(callback) { callback(null, typeof questionID == "undefined")},
	    question: function (callback) {
		if(typeof questionID != "undefined")
		    Question.getOwnedByID(user, questionID, function (e,b) {callback(e,b)});
		else
		    callback(null,
			     {
				 reponses : [{
				     reponse: "",
				     validity: false
				 }],
				 enonce: ""
			     })
	    },
	    title: function(callback) { callback(null, "Class Panic: Modification d'un set")},
	    set: function (callback) {
		Set.setOwnedGet(user, setID, function(a,b) {callback(a,b)});
	    }
	},
	function (err, results) {
//	    console.log(results);
	    res.render('manage_question', results)
	});
};

/*************************************************************/
/*         Controlleurs GET pour les questions               */
/*************************************************************/

// Pour commencer à créer une question

exports.question_create_get = function(req, res) {
    renderManageQuestion(req.session.user, undefined, req.params.idSet, [], res);
};

// Pour commencer à modifier une question 

exports.question_update_get = function(req, res) {
    renderManageQuestion(req.session.user, req.params.id, req.params.idSet, [], res);
};


/*************************************************************/
/*         Controlleurs POST pour modifier les questions     */
/*************************************************************/

// Create

exports.question_create_post = function(req, res) {
    Question.questionCreate(req.session.user, req.body, req.params.idSet, function(err, info) {
	//	res.redirect(config.PATH+"/manage/set/"+req.params.idSet) ;
	req.params.id = req.params.idSet; // HORRIBLE HACK
	if(err)
	    SetController.set_manage_msgs(req, res, ["Impossible d'ajouter la question !"]);
	else
	    SetController.set_manage_msgs(req, res, ["Question ajoutée !"]);	
    });
};

// Update

exports.question_update_post = function(req, res) {
    Question.questionUpdate(req.session.user, req.params, req.body, function(err, info) {
	//	res.redirect(config.PATH+"/manage/set/"+req.params.idSet);
	req.params.id = req.params.idSet; // HORRIBLE HACK
	if(err)
	    SetController.set_manage_msgs(req, res, ["Impossible de mettre à jour la question !"]);
	else
	    SetController.set_manage_msgs(req, res, ["Question mise à jour !"]);
    });
};

// Delete

exports.question_delete_post = function(req, res) {
    Question.questionDelete(req.session.user, parseInt(req.params.id),  function(err, id) {
//	console.log(err);
	req.params.id = req.params.idSet; // HORRIBLE HACK
	if(err)
	    SetController.set_manage_msgs(req, res, ["Impossible de supprimer la question (peut-être est-elle la question courante d'une room) !"]);
	else
	    SetController.set_manage_msgs(req, res, ["Question supprimée !"]);
//	res.redirect(config.PATH+"/manage/set/"+req.params.idSet);
    });
};
