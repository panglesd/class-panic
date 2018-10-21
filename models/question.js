bdd = require("./bdd");


/***********************************************************************/
/*       Getters pour les question : listes                            */
/***********************************************************************/

// List of all questions

exports.questionList = function (callback) {
    bdd.query("SELECT * FROM `questions`", callback);
}

// List of all owned questions

exports.ownedList = function (user, callback) {
    bdd.query("SELECT * FROM `questions` WHERE owner = ?", [user.id], (err, res) => {callback(err,res)});
}

// List by set ID

exports.listBySetID = function (setID, callback) {
    bdd.query("SELECT * FROM `questions` WHERE `class` = ? ORDER BY indexSet", [setID], callback);
}

exports.listOwnedBySetID = function (user, setID, callback) {
    bdd.query("SELECT * FROM `questions` WHERE `class` = ? AND `owner` = ? ORDER BY indexSet", [setID, user.id], callback);
}

// List by room ID

exports.listByRoomID = function (id, callback) {
//    console.log("SELECT * FROM `setDeQuestion` WHERE `id` = (SELECT questionSet FROM `rooms` WHERE `id` = ?)", [id]);
    bdd.query("SELECT * FROM `setDeQuestion` WHERE `id` = (SELECT questionSet FROM `rooms` WHERE `id` = ?)", [id], function(err, qList) {
	exports.listBySetID(qList[0].id, callback);
    });
}

exports.listOwnedByRoomID = function (user, id, callback) {
    bdd.query("SELECT * FROM `setDeQuestion` WHERE `id` = (SELECT questionSet FROM `rooms` WHERE `id` = ?) AND `owner` = ?", [id, user.id], function(err, qList) {
	exports.listBySetID(qList[0].id, callback);
    });
}

exports.listByCourseID = function (courseID, callback) {
    bdd.query("SELECT * FROM `questions` WHERE `class` IN (SELECT id FROM setDeQuestion WHERE courseID = ?) ", [courseID], function(err, qList) {
	callback(err, qList);
    });
}

/***********************************************************************/
/*       Getters pour les question : individus                         */
/***********************************************************************/

// By ID

exports.getByID = function (questionId, callback) {
    bdd.query("SELECT * FROM `questions` WHERE `id` = ?", [questionId], function (err, rows) {
	//	console.log(rows);
	console.log(err);
	q = rows[0];
	q.reponses = JSON.parse(q.reponses);
//	q.reponses.forEach(function(rep) { delete rep.validity });
	callback(err, q)
    });
}

exports.getOwnedByID = function (user, questionId, callback) {
    bdd.query("SELECT * FROM `questions` WHERE `id` = ? AND `owner` = ?", [questionId, user.id], function (err, rows) {
	q = rows[0];
	q.reponses = JSON.parse(q.reponses);
	callback(err, q)
    });
}

// By room

exports.getFirstOfOwnedSet = function (user, setID, callback) {
    bdd.query('SELECT * from `questions` WHERE owner = ? AND indexSet = 0 AND class = ?', [user.id, setID], function (err, rows) {
	if(err)
	    callback(err, null)
	else if (rows.length == 0)
	    callback("Set associé vide");
	else {
	    q = rows[0];
	    q.reponses = JSON.parse(q.reponses);
	    callback(err, q);
	}
    });
}

exports.getFirstOfSet = function (setID, callback) {
    bdd.query('SELECT * from `questions` WHERE indexSet = 0 AND class = ?', [setID], function (err, rows) {
	if(err)
	    callback(err, null)
	else if (rows.length == 0)
	    callback("Set associé vide");
	else {
	    q = rows[0];
	    q.reponses = JSON.parse(q.reponses);
	    callback(err, q);
	}
    });
}

/***********************************************************************/
/*       Gestion CRUD des questions                                    */
/***********************************************************************/

// Création

exports.questionCreate = function (user, question, setID, callback) {
    i=0;
    bdd.query("SELECT MAX(indexSet+1) as indexx FROM `questions` WHERE `class` = ? GROUP BY `class`", [setID], function (er, ind) {
	if(er)
	    console.log(err);
	bdd.query("INSERT INTO `questions`(`enonce`, `indexSet`, `class`, `owner`, `reponses`, `description`,`type`) VALUES (?, ?, ?, ?, ?, ?, ?); SELECT LAST_INSERT_ID()",
		  [ question.enonce, ind[0] ? ind[0].indexx : 0, setID, user.id, question.reponse, question.description, question.type],
		  function (err, r) {console.log(err); callback(err, r[0])});
    });
}

// Suppression

exports.questionDelete = function (user, questionID, callback) {
    //    console.log("DELETE FROM `questions` WHERE `id` = ? AND `owner` = ?", [question.id, user.id]);
    exports.getOwnedByID(user, questionID, function(err, question) {
	bdd.query("DELETE FROM `questions` WHERE `id` = ? AND `owner` = ?", [questionID, user.id], function(err, res) {
	    if(err)
		callback(err, null)
	    else {
		bdd.query("UPDATE `questions` SET `indexSet`=indexSet-1 WHERE `indexSet`>? AND `class`=? AND `owner`=?", [question.indexSet, question.class, user.id], callback);
	    }
	});
    });
}

// Update

exports.questionUpdate = function (user, questionID, newQuestion, callback) {
    i=0;
//    console.log(newQuestion);
/*    reponse = [];
    while(newQuestion[i]) {
	reponse[i]= { reponse: newQuestion[i] , validity: false };
	i++;
    }*/
    bdd.query("UPDATE `questions` SET `enonce` = ?, `reponses` = ?, `description` = ?, `type` = ?  WHERE `id` = ?",
	      [newQuestion.enonce, newQuestion.reponse, newQuestion.description, newQuestion.type, questionID], callback);
}


