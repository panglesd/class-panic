var express = require('express');
var router = express.Router();

// Require controller modules.
var room_controller = require('../controllers/roomController');
var course_controller = require('../controllers/courseController');
var set_controller = require('../controllers/setController');
var question_controller = require('../controllers/questionController');
var game_controller = require('../controllers/gameController');
var login_controller = require('../controllers/loginController');

var config = require('../configuration');

var courseRouter = require("./courseRouter");

/*************************************************************/
/*         Middleware de redirection si non loggé            */
/*************************************************************/

router.use(function (req, res, next) {
    if(req.session) {
	if(req.session.user) {
//	    console.log("accepted");
	    next();
	}
	else {
//	    console.log("refused");
	    res.redirect(config.PATH+"/");
	}
    }
    else {
//	console.log("refused");
	res.redirect(config.PATH+"/");
    }
});

router.use("/course", courseRouter);

module.exports = router;
