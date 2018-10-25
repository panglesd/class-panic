var user = require('../../models/user');
var Stats = require('../../models/stats');
var Room = require('../../models/room');
var Course = require('../../models/course');
var User = require('../../models/user');
var Question = require('../../models/question');
var Set = require('../../models/set');
var game = require('../../models/game');
var async = require('async');

/**************************************************************************/
/*                 Fonction pour le management de questions en direct     */
/**************************************************************************/

module.exports = function(io) {
    io.of('/manage').on('connection', function(socket) {
	socket.on('new order', function (newOrder) {
	    if(newOrder)
		if(newOrder[0]) {
		    async.waterfall( [
			(callback) => { Question.getByID(newOrder[0], callback); },
			(question, callback) => { Set.setGet(question.class, callback); },
			(set, callback) => { Course.getByID(set.courseID, (err, res) => {callback(err, set, res);}); },
			(set, course, callback) => {User.getSubscription(socket.request.session.user, course, (err, res) => {callback(err, set, course, res);}); },
			(set, course, subs) => {
//			    console.log(subs);
			    if(subs.canSetUpdate)
				Set.reOrder(course, set, newOrder);
			}]);
		}
	});
    });
};
