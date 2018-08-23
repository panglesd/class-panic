var express = require('express');
var router = express.Router();

// Require controller modules.
var room_controller = require('../controllers/roomController');
var set_controller = require('../controllers/setController');
var question_controller = require('../controllers/questionController');
var game_controller = require('../controllers/gameController');
var login_controller = require('../controllers/loginController');

var config = require('../configuration');

/*************************************************************/
/*         Middleware de redirection si non loggé            */
/*************************************************************/

router.use(function (req, res, next) {
    if(req.session) {
	if(req.session.user) {
	    console.log("accepted");
	    next();
	}
	else {
	    console.log("refused");
	    res.redirect(config.PATH);
	}
    }
    else {
	console.log("refused");
	res.redirect(config.PATH);
    }
});

/*************************************************************/
/*         Routes for the game                               */
/*************************************************************/

// GET request for showing room list.
router.get('/room', room_controller.room_list);




// POST request for showing room list.
router.post('/room', room_controller.room_list);

// GET request for entering a room.
router.get('/room/:id', game_controller.room_enter);
// POST request for entering a room.
router.post('/room/:id', game_controller.room_enter);


module.exports = router;
