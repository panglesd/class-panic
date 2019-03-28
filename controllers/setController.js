var User = require('../models/user');
var Course = require('../models/course');
var Room = require('../models/room');
var Set = require('../models/set');
var Question = require('../models/question');
var config = require("./../configuration");

var async = require('async');

/*************************************************************/
/*         Fonctions render pour les sets                    */
/*************************************************************/

// render pour manage_sets.ejs

let renderManageSets = function(user, course, msgs, req, res) {
    async.parallel(
	{
	    title : function(callback) { callback(null, "Big Sister: Gérer vos sets de questions");},
	    config : function(callback) { callback(null, config); },	
	    user : function (callback) {
		callback(null, user);
	    },
	    subscription: function(callback) {
		callback(null, req.subscription);
	    },
	    course : function(callback) {
		callback(null, course);
	    },
	    msgs: function(callback) {
		callback(null, msgs);
	    },
	    setOwnedList :  function (callback) {
		Set.setOwnedList(user, course.id, callback);
	    }
	},
	function (err, results) {
	    res.render('manage_sets', results);
	});
};

// render pour managet_set.ejs

let renderManageSet = function(req, user, course, set, msgs, req, res) {
    async.parallel(
	{
	    title : function(callback) { callback(null, "Big Sister: Gérer vos sets de questions");},
	    server : function(callback) {
		callback(null, req.protocol + '://' + req.get('host') );
	    },
	    config : function(callback) { callback(null, config); },	
	    user : function (callback) {
		callback(null, user);
	    },
	    course : function(callback) {
		callback(null, course);
	    },
	    subscription: function(callback) {
		callback(null, req.subscription);
	    },
	    questionList : function (callback) {
		Question.listBySetID(set.id, function(a,b) {callback(a,b);});
	    },
	    msgs: function(callback) { callback(null, msgs); },
	    set : function (callback) {
		callback(null, set);
	    }
	},
	function (err, results) {
	    res.render('manage_set', results);
	});
};

/*************************************************************/
/*         Controlleurs GET pour les sets                    */
/*************************************************************/

// Afficher la liste des sets

exports.set_manage_all = function(req, res) {
    renderManageSets(req.session.user, req.course, req.msgs, req, res);
};
/*exports.set_manage_all_msgs = function(req, res, msgs) {
    renderManageSets(req.session.user, msgs, res);
};*/

// Afficher le détails d'un set

exports.set_manage = function(req, res) {
    renderManageSet(req, req.session.user, req.course, req.set, req.msgs, req, res);
};
/*exports.set_manage_msgs = function(req, req, res, msgs) {
    renderManageSet(req, req.session.user, req.params.id, msgs, res);
};*/

/*************************************************************/
/*         Controlleurs POST pour modifier les sets          */
/*************************************************************/

// Create

exports.set_create_post = function(req, res) {
    if(req.subscription.canOwnSet) {
	Set.setCreate(req.session.user, req.course.id, req.body, function (err, set) { //HACK DEGUEU
	    if(err) {
		req.msgs.push("Impossible de créer le set !");
		renderManageSets(req.session.user, req.course, req.msgs, req, res);
//		renderManageSet(req, req.session.user, req.course, req.set, req.msgs, res);
	    }
	    else {
		req.msgs.push("Set créé !");
		renderManageSet(req, req.session.user, req.course, set, req.msgs, req, res);
	    }
	});
    }
    else {
	req.msgs.push("Vous n'avez pas le droit de créer des sets !");
	renderManageSets(req.session.user, req.course, req.msgs, req, res);
//	renderManageSet(req, req.session.user, req.course, req.set, req.msgs, res);
	//	res.redirect(config.PATH+'/manage/room');
    }
};

//Delete

exports.set_delete_post = function(req, res) {
    if(req.subscription.canAllSet || (req.subscription.canOwnRoom && (req.user.id == req.set.ownerID))) {
	Set.setDelete(req.session.user, req.set, function (err, set) {
	    //	console.log(err);
	    if(err) {
		req.msgs.push("Impossible de supprimer le set, sans doute est-il utilisé dans une room");
		renderManageSets(req.session.user, req.course, req.msgs, req, res);
	    }
	    else {
		req.msgs.push("Set supprimé");
		renderManageSets(req.session.user, req.course, req.msgs, req, res);
	    }
	});
    }
    else {
	req.msgs.push("Vous n'avez pas le droit de supprimer des sets");
	renderManageSets(req.session.user, req.course, req.msgs, req, res);
    }
};

// Update

exports.set_update_post = function(req, res) {
    if(req.subscription.canAllSet || (req.subscription.canOwnRoom && (req.user.id == req.set.ownerID))) {
	Set.setUpdate(req.session.user, req.set, req.body, function (err, set) { //HACK DEGUEU
	    if(err)  {
		req.msgs.push("Impossible de modifier le set");
		renderManageSets(req.session.user, req.course, req.msgs, req, res);
	    }
	    else {
		req.msgs.push("Set mis à jour");
		renderManageSets(req.session.user, req.course, req.msgs, req, res);
	    }
	});
    }
    else {
	req.msgs.push("Vous n'avez pas le droit de modifier de set");
	renderManageSets(req.session.user, req.course, req.msgs, req, res);
    }
};
