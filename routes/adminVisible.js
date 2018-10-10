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

var courseRouter = require("./courseRouter");

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

/********************************************/
// Autorisation d''être TDMan d'un cours
// POST request for admining a room.


router.use("/manage/course", courseRouter);

router.post('/course/:idCourse/admin/:id', game_controller.room_admin);



// Autorisation de modifier les rooms
   /**********************************************************/
   /*              Managing rooms                            */
   /**********************************************************/
/*

*/

// Autorisation de modifier ses sets d'un cours
// Autorisation de modifier les sets d'un cours
// Autorisation de modifier les inscriptions


/*************************************************************/
/*         Routes for managing                               */
/*************************************************************/






/*************************************************************/
/*         Routes for playing                                */
/*************************************************************/

// GET request for admining a room.
router.get('/course/:idCourse/admin/:id', game_controller.room_admin);


/*************************************************************/
/*         Routes for testing                                */
/*************************************************************/

router.get('/manage/course/:idCourse/stats/', stats_controller.stats);

module.exports = router;
