var express = require('express');
var router = express.Router();

// Require controller modules.
var room_controller = require('../controllers/roomController');
var set_controller = require('../controllers/setController');
var question_controller = require('../controllers/questionController');
var game_controller = require('../controllers/gameController');
var global_controller = require('../controllers/globalController');

router.get('/', global_controller.login_get);
router.get('/logout', global_controller.logout);
router.post('/', global_controller.login_post);

module.exports = router;
