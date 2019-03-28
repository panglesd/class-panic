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
var doc_controller = require('../controllers/docController');

var config = require("../configuration");

var User = require('../models/user');
var Course = require('../models/course');
var Room = require('../models/room');
var Question = require('../models/question');
var Set = require('../models/set');
var async = require('async');

var roomRouter = require('./roomRouter');
var setRouter = require('./setRouter');
var docRouter = require('./docRouter');




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
	if(!err) {
	    User.getSubscription(req.session.user, course, (err, subscription) => {
		if(subscription) {
		    req.subscription = subscription;
		    req.course = course;
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

//router.get('/:courseID/log', (req, res) => {console.log(req.course);});


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


// router.get('/:courseID/doc/:docID/:name', (req, res) => {doc_controller.doc_get(req, res);;});
// router.get('/:courseID/doc', (req,res) => {doc_controller.doc_list(req, res);;});

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
/*          Documents                                        */
/*************************************************************/

router.use("/:courseID/doc", docRouter);

/*************************************************************/
/*          Sets                                             */
/*************************************************************/

router.use("/:courseID/set", setRouter);


router.use('/:courseID/:command/:roomID', (req, res, next) => {
    Room.getByID(req.params.roomID, (err, room) => {
	req.room = room;
	next();
    });
});
router.use('/:courseID/:command/:roomID/:fileType/:questionID', (req, res, next) => {
    Question.getByID(req.params.questionID, (err, question) => {
	req.question = question;
	next();
    });
});
// GET request for entering a room.
router.get('/:courseID/play/:roomID', game_controller.room_enter);
// GET request for cc in a room.
router.get('/:courseID/cc/:roomID/filePerso/:questionID/:answerNumber/:fileName', game_controller.fileForStudent);
router.get('/:courseID/cc/:roomID/fileCorrect/:questionID/:answerNumber/:fileName', game_controller.fileCorrectForStudent);
// GET request for cc in a room.
router.get('/:courseID/cc/:roomID', game_controller.room_cc);
// GET request for admining a room.
router.get('/:courseID/control/:roomID', game_controller.room_admin);
// GET request for admining a room.
router.get('/:courseID/correct/:roomID', game_controller.room_cc_admin);
router.get('/:courseID/correct/:roomID/filePerso/:questionID/:answerNumber/:userID/:fileName', game_controller.fileForAdmin);
router.get('/:courseID/correct/:roomID/fileCorrect/:questionID/:answerNumber/:fileName', game_controller.fileCorrectForAdmin);



module.exports = router;
