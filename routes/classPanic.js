var express = require('express');
var router = express.Router();

// Require controller modules.
var room_controller = require('../controllers/roomController');
var set_controller = require('../controllers/setController');
var question_controller = require('../controllers/questionController');
var game_controller = require('../controllers/gameController');
var global_controller = require('../controllers/globalController');


/// ROOM ROUTES ///
/*************************************************************/
/*         Routes for managing                               */
/*************************************************************/

   /**********************************************************/
   /*              Managing rooms                            */
   /**********************************************************/

// POST request for deleting a room.
router.post('/manage/room/:id/delete', room_controller.room_delete_post);

// POST request for modifying a room.
router.post('/manage/room/:id/update', room_controller.room_update_post);

// GET request for managing a particular room.
router.get('/manage/room/:id', room_controller.room_manage);

// POST request for creating a room.
router.post('/manage/room/create', room_controller.room_create_post);

// GET request for the main managing room page.
router.get('/manage/room', room_controller.room_manage_all);

   /**********************************************************/
   /*              Managing sets of questions                */
   /**********************************************************/

// POST request for deleting a set.
router.post('/manage/set/:id/delete', set_controller.set_delete_post);

// POST request for modifying a set.
router.post('/manage/set/:id/update', set_controller.set_update_post);

// GET request for managing a particular set.
router.get('/manage/set/:id', set_controller.set_manage);

// POST request for creating a set.
router.post('/manage/set/create', set_controller.set_create_post);

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

// POST request for modifying a question.
router.get('/manage/set/:idSet/question/:id/', question_controller.question_update_get);
router.post('/manage/set/:idSet/question/:id/', question_controller.question_update_post);

// POST request for modifying a question.
router.post('/manage/set/:idSet/question/:id/update', question_controller.question_update_post);
router.get('/manage/set/:idSet/question/:id/update', question_controller.question_update_get);
//router.get('/manage/set/:setId/question/:questionId', question_controller.questionShow);

// GET request for managing a question.
// router.get('/manage/set/:idSet/question/:id', question_controller.question_manage);



// GET request for the main managing set page.
//router.get('/manage/set', room_controller.room_create);

// GET request for managing a particular room.
//router.get('/manage/set/:id', room_controller.room_create);

// POST request for creating a set.
//router.post('/manage/set/create', room_controller.room_create);

// POST request for deleting a set.
//router.post('/manage/set/:id/delete', room_controller.room_create);

// POST request for modifying a set.
//router.post('/manage/set/:id/delete', room_controller.room_create);


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

// GET request for admining a room.
router.get('/admin/:id', game_controller.room_admin);
// POST request for admining a room.
router.post('/admin/:id', game_controller.room_admin);

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
