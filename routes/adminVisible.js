var express = require('express');
var router = express.Router();

// Require controller modules.
var room_controller = require('../controllers/roomController');
var set_controller = require('../controllers/setController');
var question_controller = require('../controllers/questionController');
var game_controller = require('../controllers/gameController');
var login_controller = require('../controllers/loginController');
var course_controller = require('../controllers/courseController');

var config = require("../configuration");

/*************************************************************/
/*         Middleware de redirrection si non admin           */
/*************************************************************/

router.use(function (req, res, next) {
    if(req.session.user.isAdmin)
	next();
    else {
	res.redirect(config.PATH);
    }
});



/*************************************************************/
/*         Routes for managing                               */
/*************************************************************/

   /**********************************************************/
   /*              Managing courses                          */
   /**********************************************************/

// POST request for deleting a course.
router.post('/manage/course/:idCourse/delete', course_controller.course_delete_post);
router.get('/manage/room/:idCourse/delete', (req,res) => {res.redirect('../');});

// POST request for modifying a course.
router.post('/manage/course/:idCourse/update', course_controller.course_update_post);
router.get('/manage/course/:idCourse/update', (req,res) => {res.redirect('./');});

// POST request for creating a course.
router.post('/manage/course/create', course_controller.course_create_post);
router.get('/manage/course/create', (req,res) => {res.redirect('./');});

// GET request for managing a particular course.
router.get('/manage/course/:idCourse', course_controller.course_manage);

// GET request for the main managing course page.
router.get('/manage/course', course_controller.course_manage_all);

// GET request for subscribing students to a course.
router.get('/manage/course/:idCourse/subscribeStudent/', course_controller.subscribe_list);

   /**********************************************************/
   /*              Managing rooms                            */
   /**********************************************************/

// POST request for deleting a room.
router.post('/manage/course/:idCourse/room/:id/delete', room_controller.room_delete_post);
router.get('/manage/course/:idCourse/room/:id/delete', (req,res) => {res.redirect('../');});

// POST request for modifying a room.
router.post('/manage/course/:idCourse/room/:id/update', room_controller.room_update_post);
router.get('/manage/course/:idCourse/room/:id/update', (req,res) => {res.redirect('./');});

// POST request for creating a room.
router.post('/manage/course/:idCourse/room/create', room_controller.room_create_post);
router.get('/manage/course/:idCourse/room/create', (req,res) => {res.redirect('../');});

// GET request for managing a particular room.
router.get('/manage/course/:idCourse/room/:id', room_controller.room_manage);

// GET request for the main managing room page.
//router.get('/manage/course/:idCourse/room', room_controller.room_manage_all);

   /**********************************************************/
   /*              Managing sets of questions                */
   /**********************************************************/

// POST request for deleting a set.
router.post('/manage/set/:id/delete', set_controller.set_delete_post);
router.get('/manage/set/:id/delete', (req,res) => {res.redirect('../');});

// POST request for modifying a set.
router.post('/manage/set/:id/update', set_controller.set_update_post);
router.get('/manage/set/:id/update', (req,res) => {res.redirect('./');});

// POST request for creating a set.
router.post('/manage/set/create', set_controller.set_create_post);
router.get('/manage/set/create', (req,res) => {res.redirect('./');});

// GET request for managing a particular set.
router.get('/manage/set/:id', set_controller.set_manage);

// GET request for the main managing set page.
router.get('/manage/set', set_controller.set_manage_all);

   /**********************************************************/
   /*              Managing one question                     */
   /**********************************************************/

// POST request for creating a question.
router.get('/manage/set/:idSet/question/create', question_controller.question_create_get);
router.post('/manage/set/:idSet/question/create', question_controller.question_create_post);

// POST request for deleting a question.
router.post('/manage/set/:idSet/question/:id/delete', question_controller.question_delete_post);
router.get('/manage/set/:idSet/question/:id/delete', (req,res) => {res.redirect('../');});

// POST request for modifying a question.
router.get('/manage/set/:idSet/question/:id/', question_controller.question_update_get);
router.post('/manage/set/:idSet/question/:id/', question_controller.question_update_post);

// POST request for modifying a question.
router.post('/manage/set/:idSet/question/:id/update', question_controller.question_update_post);
router.get('/manage/set/:idSet/question/:id/update', question_controller.question_update_get);

/*************************************************************/
/*         Routes for playing                                */
/*************************************************************/

// GET request for admining a room.
router.get('/course/:idCourse/admin/:id', game_controller.room_admin);
// POST request for admining a room.
router.post('/course/:idCourse/admin/:id', game_controller.room_admin);

/*************************************************************/
/*         Routes for testing                                */
/*************************************************************/



module.exports = router;
