var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.get('/main', function(req, res, next) {
    listRooms=[{ name : 'Premier' } , {name : 'Second'}];
    listOwnedRooms=[{ name : 'Premier possede' } , {name : 'Second mortvivant'}];
    listOwnedSets=[{ name : 'Setun' } , {name : 'Seti'}];
    res.render('main', {listRooms:listRooms , listOwnedRooms : listOwnedRooms , listOwnedSets : listOwnedSets});
});

router.get('play/:idRoom', function (req, res, next) {
    playRoom(req,res,next);
});

router.get('administrate/:idRoom', function (req, res, next) {
    adminRoom(req,res,next);
});

router.get('info/', function (req, res, next) {
});

router.get('info/set/new', function (req, res, next) {
});

router.get('info/set/:idSet', function (req, res, next) {
});
router.get('info/question/new', function (req, res, next) {
});
router.get('info/question/:idSet', function (req, res, next) {
});
router.get('info/set/:idSet', function (req, res, next) {
});


module.exports = router;
