var User = require('../models/user');
var Course = require('../models/course');
var Room = require('../models/room');
var Set = require('../models/set');
var SetController = require('./setController');
var Question = require('../models/question');
var config = require("./../configuration");
var sanit_fn = require("sanitize-filename");

var async = require('async');

/*************************************************************/
/*         Fonctions render pour les questions               */
/*************************************************************/

// render de manage_question.ejs

var renderManageQuestion = function(user, course, question, set, msgs, req, res) {
    async.parallel(
	{
	    title: function(callback) {
		callback(null, "Big Sister: Gérer vos sets de questions");
	    },
	    config: function(callback) {
		callback(null, config);
	    },	
	    user: function (callback) {
		callback(null, user);
	    },
	    newQuestion: function(callback) {
		callback(null, typeof question == "undefined");
	    },
	    question: function (callback) {
		console.log(question);
		if(typeof question != "undefined")
		    callback(null, question);
		else
		    callback(null,
			     {
				 reponses : [{
				     reponse: "",
				     validity: "to_correct",
				     coef: 1,
				     texted: false,
				     correcFilesInfo: [],
				     strategy: { selected: { vrai: 1, faux: 0}, unselected: { vrai: 0, faux: 0}},
				     maxPoints:1
				     // correcFilesInfo: [{fileName:"test.pdf"},{fileName:"test2.pdf"}]
				 }],
				 coef:1,
				 enonce: "",
				 description:"",
				 type:"multi"
			     });
	    },
	    course : function(callback) {
		callback(null, course);
	    },
	    subscription: function(callback) {
		callback(null, req.subscription);
	    },
	    title: function(callback) {
		callback(null, "Class Panic: Modification d'un set");
	    },
	    set: function (callback) {
		callback(null, set);
	    }
	},
	function (err, results) {
	    //	    console.log(results);
//	    console.log("question iiiiiiiiiiiiiiiiiis", question);
	    res.render('manage_question', results);
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
function formatQuestionFromBody(body, files) {
    console.log("body = ", body);
    let filesData = [];
    let question = {
	enonce : body.enonce,
	correct : body.correct,
	description : body.description,
	type : body.multi ? "multi" : "mono",
	strategy: body.strategy,
	coef: body.coef
    };
    let reponse = [];
    let i=0;
    while(typeof body["value-reponse-"+i] != "undefined") {
	let correcFilesInfo = [];
	if(Array.isArray(files["correcFile-"+i])) correcFilesInfo = files["correcFile-"+i];
	else if (files["correcFile-"+i]) correcFilesInfo = [files["correcFile-"+i]];
	let strategy = {
	    selected: {
		vrai: parseInt(body["selected-true-"+i]),
		faux: parseInt(body["selected-false-"+i])
	    },
	    unselected: {
		vrai: parseInt(body["unselected-true-"+i]),
		faux: parseInt(body["unselected-false-"+i])
	    }
	};
	reponse[i]= {
	    reponse: body["value-reponse-"+i] ,
	    validity: body["correctness-"+i],
	    // selectedPoints: parseInt(body["selected-points-"+i]),
	    // unSelectedPoints: parseInt(body["unselected-points-"+i]),
	    strategy: strategy,
	    coef: parseInt(body["coef-rep-"+i]),
	    maxPoints: parseInt(body["max-points-"+i]),
	    texted: body["texted-"+i]=="true" ? true : false,
	    hasFile: body["hasFile-"+i] ? (body["hasMultiple-"+i] ? "multiple" : "single") : "none",
	    correcFilesInfo: correcFilesInfo
	};
	if(reponse[i].texted) 
	    reponse[i].correction = body["correction-"+i];
	i++;
    }
    question.reponses = reponse;
    return question;
}
// Create

exports.question_create_post = function(req, res) {
    if(req.subscription.canOwnSet) {
	console.log("req.files is", req.files);
	let question = formatQuestionFromBody(req.body, req.files);
	console.log("question = ", question);
	
//	let [question, filesData] = formatQuestionFromBody(req.body, req.files);
	Question.questionCreate(req.session.user, question, /* filesData,*/ req.set.id, function(err, info) {
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
    if(req.subscription.canAllSet || (req.subscription.canOwnRoom && (req.user.id == req.set.ownerID))) {
//	let [question, filesData] = formatQuestionFromBody(req.body, req.files);
	let question = formatQuestionFromBody(req.body, req.files);
	let filesToRemove = [];
	let i=0;
	while(typeof req.body["value-reponse-"+i] != "undefined") {
	    if(!Array.isArray(req.body["delete-"+i])) {
		if(req.body["delete-"+i])
		    req.body["delete-"+i] = [req.body["delete-"+i]];
		else req.body["delete-"+i] = [];
	    }
	    filesToRemove[i] = req.body["delete-"+i];
	    i++;
	}
	Question.questionUpdate(req.session.user, req.question.id, question, filesToRemove, function(err, info) {
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
    if(req.subscription.canAllSet || (req.subscription.canOwnRoom && (req.user.id == req.set.ownerID))) {
	Question.questionDelete(req.session.user, req.question.id,  function(err, id) {
	    //	console.log(err);
//	    req.params.id = req.params.idSet; // HORRIBLE HACK
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
