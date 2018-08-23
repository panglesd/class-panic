bdd = require("./bdd");


/***********************************************************************/
/*       Getters pour les question : listes                            */
/***********************************************************************/

// List of all questions

exports.questionList = function (callback) {
    bdd.query("SELECT * FROM `questions`", callback);
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
    console.log("SELECT * FROM `setDeQuestion` WHERE `id` = (SELECT questionSet FROM `rooms` WHERE `id` = ?)", [id]);
    bdd.query("SELECT * FROM `setDeQuestion` WHERE `id` = (SELECT questionSet FROM `rooms` WHERE `id` = ?)", [id], function(err, qList) {
	exports.listBySetID(qList[0].id, callback);
    });
}

exports.listOwnedByRoomID = function (user, id, callback) {
    bdd.query("SELECT * FROM `setDeQuestion` WHERE `id` = (SELECT questionSet FROM `rooms` WHERE `id` = ?) AND `owner` = ?", [id, user.id], function(err, qList) {
	exports.listBySetID(qList[0].id, callback);
    });
}

/***********************************************************************/
/*       Getters pour les question : individus                         */
/***********************************************************************/

// By ID

exports.getByID = function (questionId, callback) {
    bdd.query("SELECT * FROM `questions` WHERE `id` = ?", [questionId], function (err, rows) {
	q = rows[0];
	q.reponses = JSON.parse(q.reponses);
	q.reponses.forEach(function(rep) { delete rep.validity });
	callback(err, q)
    });
}

exports.getOwnedByID = function (user, questionId, callback) {
    bdd.query("SELECT * FROM `questions` WHERE `id` = ? AND `owner` = ?", [questionId, user.id], function (err, rows) {
	q = rows[0];
	q.reponses = JSON.parse(q.reponses);
	console.log(q);
	callback(err, q)
    });
}

// By room

exports.getFirstOfOwnedSet = function (user, setID, callback) {
    bdd.query('SELECT * from `questions` WHERE owner = ? AND indexSet = 0 AND class = ?', [user.id, setID], function (err, rows) {callback(err, rows[0])});
}

/***********************************************************************/
/*       Gestion CRUD des questions                                    */
/***********************************************************************/

// Création

exports.questionCreate = function (user, question, set, callback) {
    i=1;
    reponse = [];
    while(question["q"+i]) {
	reponse[i-1]= { reponse: question["q"+i] , validity: false };
	i++;
    }
    console.log("ce que je veux", question);
    bdd.query("SELECT MAX(indexSet+1) as indexx FROM `questions` WHERE `class` = ? GROUP BY `class`", [set.id], function (er, ind) {
	bdd.query("INSERT INTO `questions`(`enonce`, `indexSet`, `class`, `owner`, `reponses`, `correct`) VALUES (? , ?, ?, ?, ?, ?); SELECT LAST_INSERT_ID()",
		  [ question.enonce, ind[0] ? ind[0].indexx : 0, set.id, user.id, JSON.stringify(reponse), question.correct ],
		  function (err, r) {callback(err, r[0])});
    });
    
}

// Suppression

exports.questionDelete = function (user, question, callback) {
    console.log("DELETE FROM `questions` WHERE `id` = ? AND `owner` = ?", [question.id, user.id]);
    bdd.query("DELETE FROM `questions` WHERE `id` = ? AND `owner` = ?", [parseInt(question.id), user.id], callback);
}

// Update

exports.questionUpdate = function (user, question, newQuestion, callback) {
    i=1;
    reponse = [];
    while(newQuestion["q"+i]) {
	reponse[i-1]= { reponse: newQuestion["q"+i] , validity: false };
	i++;
    }
    bdd.query("UPDATE `questions` SET `enonce` = ?, `reponses` = ?, `correct` = ?  WHERE `id` = ? AND `owner` = ?",
	      [newQuestion.enonce, JSON.stringify(reponse), newQuestion.correct, parseInt(question.id), user.id], callback);
}


