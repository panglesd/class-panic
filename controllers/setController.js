var User = require('../models/user');
var Room = require('../models/room');
var Set = require('../models/set');
var Question = require('../models/question');
var config = require("./../configuration");

var async = require('async');

/*************************************************************/
/*         Fonctions render pour les sets                    */
/*************************************************************/

// render pour manage_sets.ejs

renderManageSets = function(user, msgs, res) {
    async.parallel(
	{
	    title : function(callback) { callback(null, "ClassPanic: Gérer vos sets de questions")},
	    config : function(callback) { callback(null, config) },	
	    user : function (callback) {
		callback(null, user);
	    },
	    msgs: function(callback) {
		callback(null, msgs)
	    },
	    setOwnedList :  function (callback) {
		Set.setOwnedList(user, callback);
	    }
	},
	function (err, results) {
//	    console.log(results);
	    res.render('manage_sets', results)
	});
};

// render pour managet_set.ejs

renderManageSet = function(req, user, setID, msgs, res) {
    async.parallel(
	{
	    title : function(callback) { callback(null, "ClassPanic: Gérer vos sets de questions")},
	    server : function(callback) {
		callback(null, req.protocol + '://' + req.get('host') );
	    },
	    config : function(callback) { callback(null, config) },	
	    user : function (callback) {
		callback(null, user);
	    },
	    questionList : function (callback) {
		Question.listOwnedBySetID(user, setID, function(a,b) {callback(a,b)});
	    },
	    msgs: function(callback) { callback(null, msgs) },
	    set : function (callback) {
		Set.setOwnedGet(user, setID, callback);
	    }
	},
	function (err, results) {
	    res.render('manage_set', results)
	});
};

/*************************************************************/
/*         Controlleurs GET pour les sets                    */
/*************************************************************/

// Afficher la liste des sets

exports.set_manage_all = function(req, res) {
    renderManageSets(req.session.user, [], res);
};
exports.set_manage_all_msgs = function(req, res, msgs) {
    renderManageSets(req.session.user, msgs, res);
};

// Afficher le détails d'un set

exports.set_manage = function(req, res) {
    renderManageSet(req, req.session.user, req.params.id, [], res);
};
exports.set_manage_msgs = function(req, res, msgs) {
    renderManageSet(req, req.session.user, req.params.id, msgs, res);
};

/*************************************************************/
/*         Controlleurs POST pour modifier les sets          */
/*************************************************************/

// Create

exports.set_create_post = function(req, res) {
    Set.setCreate(req.session.user, req.body, function (err, set) {
	if(err)
	    renderManageSet(req, req.session.user, set.id, ["Impossible de créer le set !"], res);
	else
	    renderManageSet(req, req.session.user, set.id, ["Set créé !"], res);
    });
};

//Delete

exports.set_delete_post = function(req, res) {
    Set.setDelete(req.session.user, req.params, function (err, set) {
	console.log(err);
	if(err) 
	    renderManageSets(req.session.user, ["Impossible de supprimer le set, sans doute est-il utilisé dans une room"], res);
	else
	    renderManageSets(req.session.user, ["Set supprimé"], res);
    });
};

// Update

exports.set_update_post = function(req, res) {
    Set.setUpdate(req.session.user, req.params, req.body, function (err, set) {
	if(err) 
	    renderManageSets(req.session.user, ["Impossible de modifier le set"], res);
	else
	    renderManageSets(req.session.user, ["Set mis à jour"], res);
    });
};
