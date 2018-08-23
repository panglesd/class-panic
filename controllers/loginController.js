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
    res.render('login', {config: config});
};

// Afficher la page d'inscription

exports.sign_in_get = function(req, res) {
    if(req.session.user){
	res.redirect(config.PATH+"/room");
    }
    res.render('signin', {config: config});
};

// Se délogger

exports.logout = function(req, res) {
    req.session.user = null;
    exports.login_get(req, res);
};

/*************************************************************/
/*         Controlleurs POST pour la connexion               */
/*************************************************************/

// Créer un utilisateur

exports.user_create_post = function(req, res) {
    Users.create(req.body, function () {
	res.redirect(config.PATH)
    });
};

// Se logger

exports.login_post = function(req, res) {
    console.log("A");
    Users.userCheck(req.body.login, req.body.password, function (err, user) {
	console.log("F");
	console.log('user is ', user);
	if (!user)
	    res.redirect(config.PATH);
	else {
	    console.log("user = user");
	    req.session.user=user;
	    res.redirect(config.PATH+"/room");
	}
    });    
};
