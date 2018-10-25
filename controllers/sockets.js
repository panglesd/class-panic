var user = require('../models/user');
var Stats = require('../models/stats');
var Room = require('../models/room');
var Course = require('../models/course');
var User = require('../models/user');
var Question = require('../models/question');
var Set = require('../models/set');
var game = require('../models/game');
var async = require('async');

var addStudentListeners = require("./sockets/socketStudent");

module.exports = function (server, sessionMiddleware) {

    var io = require('socket.io')(server);
//    var addStudentListeners = require("./sockets/socketStudent")(io);
    
    /**************************************************************************/
    /*                 IO middlewares                                         */
    /**************************************************************************/
    
    //On ajoute une session si existante à l'objet socket
    io.use(function(socket, next) {
	sessionMiddleware(socket.request, socket.request.res, next);
    });
    
    // On n'accepte que des sessions existantes et un user défini
    io.use(function(socket, next) {
	if(socket.request.session) {
	    if(socket.request.session.user) {
		next();
	    }
	    else {
		console.log("socket refused !");
	    }
	}
	else {
	    console.log("socket refused !");
	}
    });
    
    /**************************************************************************/
    /*                 Utilitaires d'envoi                                    */
    /**************************************************************************/

    require("./sockets/socketStudent")(io);
    
    /**************************************************************************/
    /*                 Fonction pour gérer les admins                         */
    /**************************************************************************/
    
    require("./sockets/socketAdmin")(io);
    
    /**************************************************************************/
    /*                 Fonction pour le management de questions en direct     */
    /**************************************************************************/
    
    require("./sockets/socketOrderQuestion")(io);
    
    /**************************************************************************/
    /*                 Fonction pour l'inscription de students à un cours     */
    /**************************************************************************/
    
    require("./sockets/socketSubscribe")(io);
    
    /**************************************************************************/
    /*                 Fonction pour les statistiques                         */
    /**************************************************************************/

    return io;
    
};

		      
