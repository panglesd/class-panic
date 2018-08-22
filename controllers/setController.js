var User = require('../models/user');
var Room = require('../models/room');
var Set = require('../models/set');

var async = require('async');

/*************************************************************/
/*         Controlleurs GET pour les sets                    */
/*************************************************************/

// Afficher la liste des sets

exports.set_manage_all = function(req, res) {
    //    res.send('NOT IMPLEMENTED: Room list');
    async.parallel(
	{
	    title : function(callback) { callback(null, "ClassPanic: Gérer vos sets de questions")},
	    user : function (callback) {
		callback(null, req.session.user);
	    },
	    setOwnedList :  function (callback) {
		Set.setOwnedList(req.session.user, callback);
	    }
	},
	function (err, results) {
	    console.log(results);
	    res.render('manage_sets', results)
	});
};

// Afficher le détails d'un set

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
	},
	function (err, results) {
	    console.log(results);
	    res.render('manage_set', results)
	});
};

/*************************************************************/
/*         Controlleurs POST pour modifier les sets          */
/*************************************************************/

// Create

exports.set_create_post = function(req, res) {
    Set.setCreate(req.session.user, req.body, function (err, set) {
	res.redirect('/classPanic/manage/set/'+set.id);
    });
};

//Delete

exports.set_delete_post = function(req, res) {
    Set.setDelete(req.session.user, req.params, function (err, set) {
	res.redirect('/classPanic/manage/set');
    });
};

// Update

exports.set_update_post = function(req, res) {
    Set.setUpdate(req.session.user, req.params, req.body, function (err, set) {
	res.redirect('/classPanic/manage/set');
    });
};
