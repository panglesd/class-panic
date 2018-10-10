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

var questionRouter = require('./questionRouter');

/*router.use('/create', function (req, res, next) {
    if(req.subscription.canSetCreate)
	next();
    else
	res.redirect(config.PATH);
});*/
// POST request for creating a set.
router.post('/create', set_controller.set_create_post);
router.get('/create', (req,res) => {res.redirect('./');});

// GET request for the main managing set page.
router.get('/', set_controller.set_manage_all);

/*************************************************************/
/*         Middleware                                        */
/*************************************************************/

router.use('/:setID', function (req, res, next) {
    if(req.params.setID) {
	Set.setGet(parseInt(req.params.setID), (err, set) => {
	    if(!err) {
		req.set = set;
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

router.get('/:setID/log', (req, res) => {console.log(req.set)})

   /**********************************************************/
   /*              Managing sets of questions                */
   /**********************************************************/

/*router.use('/:setID/delete', function (req, res, next) {
    if(req.subscription.canSetDelete)
	next();
    else
	res.redirect(config.PATH);
});*/
// POST request for deleting a set.
router.post('/:setID/delete', set_controller.set_delete_post);
router.get('/:setID/delete', (req,res) => {res.redirect('../');});

// POST request for modifying a set.
/*router.use('/:setID/update', function (req, res, next) {
    if(req.subscription.canSetUpdate)
	next();
    else
	res.redirect(config.PATH);
});*/
router.post('/:setID/update', set_controller.set_update_post);
router.get('/:setID/update', (req,res) => {res.redirect('./');});

// GET request for managing a particular set.
router.get('/:setID', set_controller.set_manage);

router.use('/:setID/question', questionRouter);

module.exports = router;
