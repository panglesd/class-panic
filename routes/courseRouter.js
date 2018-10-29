var express = require('express');
var router = express.Router();

// Require controller modules.
var room_controller = require('../controllers/roomController');
var set_controller = require('../controllers/setController');
var question_controller = require('../controllers/questionController');
var game_controller = require('../controllers/gameController');
var login_controller = require('../controllers/loginController');
var course_controller = require('../controllers/courseController');
var stats_controller = require('../controllers/statsController');

var config = require("../configuration");

var User = require('../models/user');
var Course = require('../models/course');
var Room = require('../models/room');
var Set = require('../models/set');
var config = require('../configuration');
var async = require('async');

var roomRouter = require('./roomRouter');
var setRouter = require('./setRouter');




router.use('/create', function (req, res, next) {
    if(req.session.user.isAdmin)
	next();
    else
	res.redirect(config.PATH);
});
// POST request for creating a course.
router.post('/create', course_controller.course_create_post);
router.get('/create', (req,res) => {res.redirect('./');});

// GET request for the main managing course page.
router.get('/', course_controller.course_manage_all);

/*************************************************************/
/*         Middleware                                        */
/*************************************************************/

router.use('/:courseID/', function (req, res, next) {
    Course.getByID(parseInt(req.params.courseID), (err, course) => {
//	console.log(parseInt(req.params.courseID));
	if(!err) {
	    User.getSubscription(req.session.user, course, (err, subscription) => {
		if(subscription) {
		    req.subscription = subscription;
		    req.course = course;
//		    console.log(subscription);
//		    if(req.subscription.isTDMan)
			next();
//		    else
//			res.redirect(config.PATH);
		}
		else
		    res.redirect(config.PATH);
	    });
	}
	else {
	    res.redirect(config.PATH);
	}
    });
});

router.get('/:courseID/log', (req, res) => {console.log(req.course);});


   /**********************************************************/
   /*              Managing courses                          */
   /**********************************************************/

// POST request for deleting a course.
/*router.use('/:courseID/delete', function (req, res, next) {
    if(req.session.user.isAdmin)
	next();
    else
	res.redirect(config.PATH);
});*/
router.post('/:courseID/delete', course_controller.course_delete_post);
router.get('/:courseID/delete', (req,res) => {res.redirect('../');});

// POST request for modifying a course.
/*router.use('/:courseID/update', function (req, res, next) {
    if(req.subscription.canCourseUpdate)
	next();
    else
	res.redirect(config.PATH);
});*/
router.post('/:courseID/update', course_controller.course_update_post);
router.get('/:courseID/update', (req,res) => {res.redirect('./');});

// GET request for managing a particular course.
router.get('/:courseID', course_controller.course_manage);


/*router.use('/:courseID/subscription', function (req, res, next) {
    if(req.subscription.canCourseSubscribe)
	next();
    else
	res.redirect(config.PATH);
});*/
// GET request for subscribing students to a course.
router.get('/:courseID/subscription/', course_controller.subscribe_list);

router.get('/:courseID/stats/', stats_controller.stats);

/*************************************************************/
/*          Rooms                                            */
/*************************************************************/

router.use("/:courseID/room", roomRouter);

/*************************************************************/
/*          Sets                                             */
/*************************************************************/

router.use("/:courseID/set", setRouter);


// GET request for entering a room.
router.get('/:courseID/play/:roomID', game_controller.room_enter);
// GET request for cc in a room.
router.get('/:courseID/cc/:roomID', game_controller.room_cc);
// GET request for admining a room.
router.get('/:courseID/control/:roomID', game_controller.room_admin);
// GET request for admining a room.
router.get('/:courseID/correct/:roomID', game_controller.room_cc_admin);



module.exports = router;
