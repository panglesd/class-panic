var Users = require("../models/user");
var room_controller = require('../controllers/roomController');
var config = require("./../configuration");

/*************************************************************/
/*         Controlleurs GET pour la connexion                */
/*************************************************************/

// Afficher la page de login

exports.login_get = function(req, res) {
    if(req.session.user){
	res.redirect(config.PATH+"/room");
    }
    res.render('login', {config: config, msgs: []});
};

// Afficher la page d'inscription

exports.sign_in_get = function(req, res) {
    if(req.session.user){
	res.redirect(config.PATH+"/room");
    }
    res.render('signin', {config: config, msgs: []});
};

// Se délogger

exports.logout = function(req, res) {
    req.session.user = null;
    // exports.login_get(req, res);
    res.redirect(config.PATH+"/login");
};

/*************************************************************/
/*         Controlleurs POST pour la connexion               */
/*************************************************************/

// Créer un utilisateur

exports.user_create_post = function(req, res) {
    Users.create(req.body, function (err, rows) {
	if(err) {
	    console.log(err);
	    res.render('signin', {config: config, msgs: ["Impossible de créer votre compte : sans doute le pseudo est-il déjà utilisé."]});
	}
	else {
	    res.redirect(config.PATH)
	}
    });
};

// Se logger

exports.login_post = function(req, res) {
    Users.userCheck(req.body.login, req.body.password, function (err, user) {
	if (!user)
	    res.render('login', {config: config, msgs: ["Connexion impossible, vérifiez vos identifiants"]});
	else {
	    req.session.user=user;
	    res.redirect(config.PATH+"/room");
	}
    });    
};
