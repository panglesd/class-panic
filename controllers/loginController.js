var Users = require("../models/user");
var room_controller = require('../controllers/roomController');

/*************************************************************/
/*         Controlleurs GET pour la connexion                */
/*************************************************************/

// Afficher la page de login

exports.login_get = function(req, res) {
    if(req.session.user){
	res.redirect("/classPanic/room");
    }
    res.render('login');
};

// Afficher la page d'inscription

exports.sign_in_get = function(req, res) {
    if(req.session.user){
	res.redirect("/classPanic/room");
    }
    res.render('signin');
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
    console.log("me ego");
    Users.create(req.body, function () {
	res.redirect("/classPanic")
    });
};

// Se logger

exports.login_post = function(req, res) {
    console.log("A");
    Users.userCheck(req.body.login, req.body.password, function (err, user) {
	console.log("F");
	console.log('user is ', user);
	if (!user) {
	    console.log("before/after 500 redirect error");
	    console.log("redirecting to /classPanic");
	    res.redirect("/classPanic");
	}
	else {
	    console.log("user = user");
	    req.session.user=user;
	//	room_controller.room_list(req,res);
	    res.redirect("/classPanic/room");
	}
    });    
};
