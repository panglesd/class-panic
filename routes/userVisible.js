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
	    res.redirect(config.PATH);
	}
    }
    else {
//	console.log("refused");
	res.redirect(config.PATH);
    }
});

/*************************************************************/
/*         Routes for the game                               */
/*************************************************************/

// GET request for showing room list.
router.get('/room', room_controller.room_list);


// GET request for showing subscribed courses list.
router.get('/course', course_controller.courses_list);

// GET request for subscribing to a courses.
//router.get('/subscribe', course_controller.courses_subscribe);

// GET request for showing a course.
router.get('/course/:idCourse', course_controller.course);




// POST request for showing room list.
router.post('/room', room_controller.room_list);



// GET request for entering a room.
router.use('/course/:idCourse/room/:id', (req, res, next) => {
    
});
router.get('/course/:idCourse/room/:id', game_controller.room_enter);







router.post('/course/:idCourse/admin/:id', game_controller.room_admin);


router.use("/manage/course", courseRouter);

// GET request for admining a room.
router.get('/course/:idCourse/admin/:id', game_controller.room_admin);


module.exports = router;
