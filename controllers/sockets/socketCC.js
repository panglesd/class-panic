    /**************************************************************************/
    /*                 Fonction pour gérer le Controle Continu                */
    /**************************************************************************/
    
	
	/******************************************/
	/*  Middlesware de socket                 */
	/******************************************/
	
	// Si on n'a pas de room défini, la seule chose qu'on peut faire c'est choisir une room
	
	socket.use(function (packet, next) {
	    //	    console.log("packet is", packet);
	    if(packet[0]=="chooseRoom")
		next();
	    if(socket.room)
		next();
	});
	
	/******************************************/
	/*  On a choisi la room a administrer     */
	/******************************************/
	
	socket.on('chooseRoom', function (newRoom) {
	    if (socket.room)
		socket.leave(socket.room.id);
	    Room.getByID(parseInt(newRoom), function (err, res) {
		if(res) {
		    Course.getByID(res.courseID,(er, course) => {
			User.getSubscription(socket.request.session.user, course, (err, subscription) => {
			    if(subscription && subscription.isTDMan) {
				socket.room = res;
				socket.join(socket.room.id);
				sendRoomOwnedQuestion(socket.request.session.user, socket, socket.room, function (err) {if(err) throw err;});
			    }
			});
		    });
		}
	    });
	});
	
	/******************************************/
	/*  On souhaite diffuser les resultats    */
	/******************************************/
	
	socket.on('revealResults', function () {
	    Room.getStatus(socket.room, function (err, status) {
		if(status != "revealed") {
		    game.getStatsFromRoomID(socket.room.id, function (r,e) {
			Room.setStatusForRoomID(socket.room.id, "revealed", function () {broadcastRoomQuestion(socket.room, () => {});});
			Stats.logStats(socket.room.id, (err) => {console.log(err);});
		    });
		}
	    });
	});
	
	/******************************************/
	/*  On souhaite aller direct à une question*/
	/******************************************/
	
	socket.on('changeToQuestion', function (i) {
	    game.setQuestionFromRoomID(socket.room.id, parseInt(i), function () {
		Room.setStatusForRoomID(socket.room.id, "pending", function () {
		    sendOwnedStats(socket.room);
		    broadcastRoomQuestion(socket.room, function (err) {if(err) throw err;});
		    sendRoomOwnedQuestion(socket.request.session.user, socket, socket.room, function () {});
		});
	    });
	});
	
	/******************************************/
	/*  On souhaite changer le set            */
	/******************************************/
	
	socket.on('changeSet', function (set) {
	    //TO BE IMPLEMENTED
	});
	
	/******************************************/
	/*  Un admin me demande la question       */
	/******************************************/
	
	socket.on('sendQuestionPlease', function () {
	    //		    console.log(socket.room);
	    sendRoomOwnedQuestion(socket.request.session.user, socket, socket.room, function() {});
	});
	
	/******************************************/
	/*  Un admin me demande les stats         */
	/******************************************/
	
	socket.on('sendStatsPlease', function () {
	    //		    console.log(socket.room);
	    sendOwnedStats(socket.room);
	});
	
	/******************************************/
	/*  On souhaite passer à la question suivante */
	/******************************************/
	
	socket.on('changeQuestionPlease', function (nextQuestion) {
	    game.nextQuestionFromRoomID(socket.room.id, function (err) {
		Room.setStatusForRoomID(socket.room.id, "pending", function () {
		    broadcastRoomQuestion(socket.room, function () {});
		    sendRoomOwnedQuestion(socket.request.session.user, socket, socket.room, function () {});
		    sendOwnedStats(socket.room);
		});
	    });
	});
	
	/******************************************/
	/*  On souhaite une question custom       */
	/******************************************/
	
	socket.on('customQuestion', function (customQuestion) {
	    //		    console.log(customQuestion);
	    delete(customQuestion.id);
	    game.setQuestion(socket.room.id, customQuestion, function () {
		broadcastRoomQuestion(socket.room, function(err, res) {});
		sendOwnedStats(socket.room);
	    });
	});
	
	/******************************************/
	/*  On souhaite revenir aux questions du set*/
	/******************************************/
	
	/*		socket.on('backToSet', function () {
	//		    console.log("backToSet");
	game.backToSet(socket.room.id, function(err, res) {
	broadcastRoomQuestion(socket.room, function(err,res) {})
	});
	});*/
    });
    
