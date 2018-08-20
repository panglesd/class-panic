var express = require('express');
var router = express.Router();

// Require controller modules.
var room_controller = require('../controllers/roomController');
var set_controller = require('../controllers/setController');
var question_controller = require('../controllers/questionController');
var game_controller = require('../controllers/gameController');
var global_controller = require('../controllers/globalController');

router.use(function (req, res, next) {
    if(req.session) {
	if(req.session.user) {
//	    console.log("accepted");
	    next();
	}
	else {
//	    console.log("refused");
	    res.redirect('/classPanic');
	}
    }
    else {
//	console.log("refused");
	res.redirect('/classPanic');
    }
});




/*************************************************************/
/*         Routes for the game                               */
/*************************************************************/

// GET request for showing room list.
router.get('/room', room_controller.room_list);




// POST request for showing room list.
router.post('/room', room_controller.room_list);

// GET request for showing room list.
router.get('/admin/room', room_controller.room_admin_all);

// GET request for showing set list.
//router.get('/manage/set/:setId/question/:questionId', question_controller.questionShow);
// GET request for showing set list.
//router.get('/manage/set/:setId', set_controller.setShow);

// GET request for showing set list.
//router.get('/manage/set', set_controller.set_list);


// POST request for creating a room.
//router.post('/room/create', room_controller.room_create);

// GET request for entering a room.
router.get('/room/:id', game_controller.room_enter);
// POST request for entering a room.
router.post('/room/:id', game_controller.room_enter);


// GET request for deleting a room.
router.get('/room/:id/delete', room_controller.room_delete);
// POST request for deleting a room.
router.post('/room/:id/delete', room_controller.room_delete);

//router.post('/room', room_controller.);

/*
room    voir liste room
room/create    creer une room
room/:id   rejoindre une room particulière
room/:id/delete   supprimer une room
admin/:id

set    voir liste set
set/create    creer un set
set/:id    voir les questions d'un set en particulier
set/:id/delete   supprimer un set

set/:id/question/create  créer une question d'un set
set/:id/question/:idq  voir le détail d'une question d'un set
set/:id/question/:idq/delete supprimer une question d'un set
*/


module.exports = router;
