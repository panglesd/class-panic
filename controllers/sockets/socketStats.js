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
/*                 Fonction pour les statistiques                         */
/**************************************************************************/

module.exports = function(io) {
    io.of('/stats').on('connection', function(socket) {
	
	/******************************************/
	/*  Middleware de socket                  */
	/******************************************/
	
 	//rien

	/******************************************/
	/*  Fonction getStats                     */
	/******************************************/

	// !!!!!!!!! A voir si ça n'est pas mieux de faire ça côté client !
	
	socket.on("stats", function(filter) {
	    console.log(filter);
	    if(filter.courseID) {
		Course.getByID(filter.courseID, (err, course) => {
		    User.getSubscription(socket.request.session.user, course, (err, subs) => {
			if(subs.isTDMan) {
			    Stats.getStats(filter, function (err, res) {
				socket.emit("newStats", filter, res);
			    });
			}
		    });
		});
	    }
	});
    });
};
