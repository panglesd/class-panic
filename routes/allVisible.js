var express = require('express');
var router = express.Router();

// Require controller modules.
var room_controller = require('../controllers/roomController');
var set_controller = require('../controllers/setController');
var question_controller = require('../controllers/questionController');
var game_controller = require('../controllers/gameController');
var login_controller = require('../controllers/loginController');

router.get('/logout', login_controller.logout);
router.get('/', login_controller.login_get);
router.get('/signin', login_controller.sign_in_get);
router.post('/', login_controller.login_post);

// POST request for creating a set.
router.post('/user/create', login_controller.user_create_post);


module.exports = router;


