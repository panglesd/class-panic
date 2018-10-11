var User = require('../models/user');
var Course = require('../models/course');
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

renderManageQuestion = function(user, course, question, set, msgs, req, res) {
    async.parallel(
	{
	    title: function(callback) { callback(null, "ClassPanic: Gérer vos sets de questions")},
	    config: function(callback) { callback(null, config) },	
	    user: function (callback) {
		callback(null, user);
	    },
	    newQuestion: function(callback) { callback(null, typeof question == "undefined")},
	    question: function (callback) {
		if(typeof question != "undefined")
		    callback(null, question);
		else
		    callback(null,
			     {
				 reponses : [{
				     reponse: "",
				     validity: false
				 }],
				 correct:0,
				 enonce: ""
			     })
	    },
	    course : function(callback) {
		callback(null, course)
	    },
	    subscription: function(callback) {
		callback(null, req.subscription);
	    },
	    title: function(callback) { callback(null, "Class Panic: Modification d'un set")},
	    set: function (callback) {
		callback(null, set)
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
    renderManageQuestion(req.session.user, req.course, undefined, req.set, req.msgs, req, res);
};

// Pour commencer à modifier une question 

exports.question_update_get = function(req, res) {
    renderManageQuestion(req.session.user, req.course, req.question, req.set, req.msgs, req, res);
};


/*************************************************************/
/*         Controlleurs POST pour modifier les questions     */
/*************************************************************/

// Create

exports.question_create_post = function(req, res) {
    if(req.subscription.canSetUpdate) {
	question = {
	    enonce : req.body.enonce,
	    correct : req.body.correct,
	    description : req.body.description
	}
	reponse = [];
	i=0;
	while(req.body[i]) {
	    reponse[i]= {
		reponse: req.body[i] ,
		validity: false,
		texted:req.body["text-"+i]=="true" ? true : false,
	    };
	    if(reponse[i].texted) 
		reponse[i].correction=req.body["correction-"+i]
	    i++;
	}
	
	Question.questionCreate(req.session.user, question, reponse, req.set.id, function(err, info) {
	    //	res.redirect(config.PATH+"/manage/set/"+req.params.idSet) ;
	    //	req.params.id = req.params.idSet; // HORRIBLE HACK
	    if(err) {
		req.msgs.push("Impossible d'ajouter la question !");
		SetController.set_manage(req, res);
	    }
	    else {
		req.msgs.push("Question ajoutée !");
		SetController.set_manage(req, res);
	    }
	});
    }
    else {
	req.msgs.push("Vous n'avez pas le droit de créer des question !");
	SetController.set_manage(req, res);
    }
};

// Update

exports.question_update_post = function(req, res) {
    if(req.subscription.canSetUpdate) {
	question = {
	    enonce : req.body.enonce,
	    correct : req.body.correct,
	    description : req.body.description
	}
	i=0
	reponse = [];
	while(req.body[i]) {
	    reponse[i]= {
		reponse: req.body[i] ,
		validity: false,
		texted:req.body["text-"+i]=="true" ? true : false
	    };
	    i++;
	}
	Question.questionUpdate(req.session.user, req.question.id, question, reponse, function(err, info) {
	    //	res.redirect(config.PATH+"/manage/set/"+req.params.idSet);
	    //	req.params.id = req.params.idSet; // HORRIBLE HACK
	    if(err) {
		req.msgs.push("Impossible de mettre à jour la question !");
		SetController.set_manage(req, res);
	    }
	    else {
		req.msgs.push("Question mise à jour !");
		SetController.set_manage(req, res);
	    }
	});
    }
    else {
	req.msgs.push("Vous n'avez pas le droit de modifier des question !");
	SetController.set_manage(req, res);
    }
};

// Delete

exports.question_delete_post = function(req, res) {
    if(req.subscription.canSetUpdate) {
	Question.questionDelete(req.session.user, req.question.id,  function(err, id) {
	    //	console.log(err);
	    req.params.id = req.params.idSet; // HORRIBLE HACK
	    if(err) {
		req.msgs.push("Impossible de supprimer la question (peut-être est-elle la question courante d'une room) !");
		SetController.set_manage(req, res);
	    }
	    else {
		req.msgs.push("Question supprimée !");
		SetController.set_manage(req, res);
		//	res.redirect(config.PATH+"/manage/set/"+req.params.idSet);
	    }
	});
    }
    else {
	req.msgs.push("Vous n'avez pas le droit de supprimer des question !");
	SetController.set_manage(req, res);
    }
};
