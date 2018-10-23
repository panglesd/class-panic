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
var Question = require('../models/question');
var config = require('../configuration');
var async = require('async');

// POST request for creating a question.
router.use('/create', function (req, res, next) {
    if(req.subscription.canSetUpdate)
	next();
    else
	res.redirect(config.PATH);
});
router.get('/create', question_controller.question_create_get);
router.post('/create', question_controller.question_create_post);

/*************************************************************/
/*         Middleware                                        */
/*************************************************************/

router.use('/:questionID/', function (req, res, next) {
    if(req.params.questionID) {
	Question.getByID(parseInt(req.params.questionID), (err, question) => {
	    if(!err) {
		req.question = question;
		if(question.setID != req.set.id)
		    res.redirect(config.PATH);
		else
		    next();
	    }
	    else {
		res.redirect(config.PATH);
	    }
	});
    }
    else
	next();
});

   /**********************************************************/
   /*              Managing one question                     */
   /**********************************************************/

// POST request for deleting a question.
/*router.use('/:questionID/delete', function (req, res, next) {
    if(req.subscription.canSetUpdate)
	next();
    else
	res.redirect(config.PATH);
});*/
router.post('/:questionID/delete', question_controller.question_delete_post);
router.get('/:questionID/delete', (req,res) => {res.redirect('../');});

// POST request for modifying a question.
router.get('/:questionID/', question_controller.question_update_get);
router.post('/:questionID/', question_controller.question_update_post);

// POST request for modifying a question.
router.use('/:questionID/update', function (req, res, next) {
    if(req.subscription.canSetUpdate)
	next();
    else
	res.redirect(config.PATH);
});
router.post('/:questionID/update', question_controller.question_update_post);
router.get('/:questionID/update', question_controller.question_update_get);

module.exports = router;

