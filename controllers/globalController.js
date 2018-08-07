var Users = require("../models/user");
var room_controller = require('../controllers/roomController');

exports.login_get = function(req, res) {
    if(req.session.user){
	res.redirect("/classPanic/room");
    }
    res.render('login');
};

exports.login_post = function(req, res) {
    Users.userCheck(req.body.login, req.body.password, function (user) {
	console.log('user is ', user);
	if (!user) {
	    res.redirect("/classPanic");
	}
	req.session.user=user;
	room_controller.room_list(req,res);
    });    
};



exports.logout = function(req, res) {
    req.session.user = null;
    exports.login_get(req, res);
};
