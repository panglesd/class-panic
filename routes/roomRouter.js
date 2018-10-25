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


// POST request for creating a room.
/*router.use('/create', function (req, res, next) {
    if(req.subscription.canRoomCreate)
	next();
    else
	res.redirect(config.PATH);
});*/
router.post('/create', room_controller.room_create_post);
router.get('/create', (req,res) => {res.redirect('../');});

// GET request for the main managing room page.
router.get('/', room_controller.room_manage_all);

/*************************************************************/
/*         Middleware                                        */
/*************************************************************/

router.use('/:roomID', function (req, res, next) {
    if(req.params.roomID) {
	Room.getByID(req.params.roomID, (err, room) => {
	    if(!err) {
		req.room = room;
		if(room.courseID!=req.course.id)
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


// POST request for deleting a room.
/*router.use('/:roomID/delete', function (req, res, next) {
    if(req.subscription.canRoomDelete)
	next();
    else
	res.redirect(config.PATH);
});*/
router.post('/:roomID/delete', room_controller.room_delete_post);
router.get('/:roomID/delete', (req,res) => {res.redirect('../');});

// POST request for modifying a room.
/*router.use('/:roomID/update', function (req, res, next) {
    if(req.subscription.canRoomUpdate)
	next();
    else
AAAA	res.redirect(config.PATH);
});*/
router.post('/:roomID/update', room_controller.room_update_post);
router.get('/:roomID/update', (req,res) => {res.redirect('./');});

// GET request for managing a particular room.
router.get('/:roomID', room_controller.room_manage);

router.use('/:roomID/set', questionRouter);

module.exports = router;
