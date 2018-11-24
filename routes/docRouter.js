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
var Set = require('../models/set');
var Doc = require('../models/documents');
var async = require('async');

var roomRouter = require('./roomRouter');
var setRouter = require('./setRouter');

// router.get("/add", doc_controller.add_get);
router.post("/add", doc_controller.doc_add_post);

/*************************************************************/
/*         Middleware                                        */
/*************************************************************/

router.use('/:docID/', function (req, res, next) {
    if(req.params.docID != "add") {
	Doc.getByID(parseInt(req.params.docID), (err, doc) => {
	    //	console.log(parseInt(req.params.courseID));
	    if(!err) {
		req.doc = doc;
		next();
	    }
	    else {
		res.redirect(config.PATH);
	    }
	});
    }
});



// router.get("/:docID/remove", doc_controller.remove);
// router.get("/:docID/update", doc_controller.update);

router.get("/:docID/:name", doc_controller.doc_get);
router.get("/:docID", doc_controller.doc_get);

router.get('/', doc_controller.doc_list);

module.exports = router;
