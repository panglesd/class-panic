var express = require('express');
var router = express.Router();

// Require controller modules.
var room_controller = require('../controllers/roomController');
var global_controller = require('../controllers/globalController');


router.get('/', global_controller.login_get);
router.get('/logout', global_controller.logout);
router.post('/', global_controller.login_post);

/// ROOM ROUTES ///


// GET request for showing room list.
router.get('/room', room_controller.room_list);

// POST request for showing room list.
router.post('/room', room_controller.room_list);

// GET request for creating a room.
router.get('/room/create', room_controller.room_create);
// POST request for creating a room.
router.post('/room/create', room_controller.room_create);

// GET request for entering a room.
router.get('/room/:id', room_controller.room_enter);
// POST request for entering a room.
router.post('/room/:id', room_controller.room_enter);

// GET request for admining a room.
router.get('/admin/:id', room_controller.room_admin);
// POST request for admining a room.
router.post('/admin/:id', room_controller.room_admin);

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
