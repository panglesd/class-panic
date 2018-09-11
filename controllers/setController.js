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
		Question.listOwnedBySetID(user, setID, callback);
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

// Afficher le détails d'un set

exports.set_manage = function(req, res) {
    renderManageSet(req, req.session.user, req.params.id, [], res);
};

/*************************************************************/
/*         Controlleurs POST pour modifier les sets          */
/*************************************************************/

// Create

exports.set_create_post = function(req, res) {
    Set.setCreate(req.session.user, req.body, function (err, set) {
	renderManageSet(req, req.session.user, set.id, ["Set créé !"], res);
    });
};

//Delete

exports.set_delete_post = function(req, res) {
    Set.setDelete(req.session.user, req.params, function (err, set) {
	renderManageSets(req.session.user, ["Set supprimé"], res);
    });
};

// Update

exports.set_update_post = function(req, res) {
    Set.setUpdate(req.session.user, req.params, req.body, function (err, set) {
	renderManageSets(req.session.user, ["Set mis à jour"], res);
    });
};
