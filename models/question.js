let bdd = require("./bdd");


/***********************************************************************/
/*       Getters pour les question : listes                            */
/***********************************************************************/

// List of all questions

exports.questionList = function (callback) {
    bdd.query("SELECT * FROM `questions`", callback);
};

// List of all owned questions

exports.ownedList = function (user, callback) {
    bdd.query("SELECT * FROM `questions` WHERE owner = ?", [user.id], (err, res) => {callback(err,res);});
};

// List by set ID

exports.listBySetID = function (setID, callback) {
    bdd.query("SELECT * FROM `questions` WHERE `class` = ? ORDER BY indexSet", [setID], callback);
};

exports.listOwnedBySetID = function (user, setID, callback) {
    bdd.query("SELECT * FROM `questions` WHERE `class` = ? AND `owner` = ? ORDER BY indexSet", [setID, user.id], callback);
};

// List by room ID

exports.listByRoomID = function (id, callback) {
//    console.log("SELECT * FROM `setDeQuestion` WHERE `id` = (SELECT questionSet FROM `rooms` WHERE `id` = ?)", [id]);
    bdd.query("SELECT * FROM `setDeQuestion` WHERE `id` = (SELECT questionSet FROM `rooms` WHERE `id` = ?)", [id], function(err, qList) {
	exports.listBySetID(qList[0].id, callback);
    });
};

exports.listOwnedByRoomID = function (user, id, callback) {
    bdd.query("SELECT * FROM `setDeQuestion` WHERE `id` = (SELECT questionSet FROM `rooms` WHERE `id` = ?) AND `owner` = ?", [id, user.id], function(err, qList) {
	exports.listBySetID(qList[0].id, callback);
    });
};

exports.listByCourseID = function (courseID, callback) {
    bdd.query("SELECT * FROM `questions` WHERE `class` IN (SELECT id FROM setDeQuestion WHERE courseID = ?) ORDER BY indexSet", [courseID], function(err, qList) {
	callback(err, qList);
    });
};

/***********************************************************************/
/*       Getters pour les question : individus                         */
/***********************************************************************/

// By ID

exports.getByID = function (questionId, callback) {
    bdd.query("SELECT * FROM `questions` WHERE `id` = ?", [questionId], function (err, rows) {
	let q = rows[0];
	q.reponses = JSON.parse(q.reponses);
	callback(err, q);
    });
};

exports.getByIndex = function (questionIndex, roomID, callback) {
    bdd.query("SELECT * FROM `questions` WHERE `indexSet` = ? AND class = (SELECT questionSet FROM rooms WHERE id = ?)", [questionIndex, roomID], function (err, rows) {
	console.log(err);
	let q = rows[0];
	q.reponses = JSON.parse(q.reponses);
	callback(err, q);
    });
};

exports.getByIndexCC = function (questionIndex, user, roomID, callback) {
    let query = 
	"SELECT enonce, fileInfo, questionID, questions.id as id, description, indexSet, questions.reponses as allResponses, statsOfUser.response as userResponse, type  FROM "+
	  "questions LEFT OUTER JOIN "+
	  "(SELECT questionID, response, fileInfo FROM stats INNER JOIN statsBloc ON statsBloc.id = blocID WHERE userID = ? AND roomID = ?) statsOfUser" +
	  " ON statsOfUser.questionID = questions.id WHERE indexSet <= ? AND questions.class = (SELECT questionSet FROM rooms WHERE id = ?) ORDER BY indexSet DESC";
    bdd.query(query, [user.id, roomID, questionIndex, roomID], function(err, row) {
	console.log(err);
	let q = row[0];
//	console.log(q);
	q.allResponses = JSON.parse(q.allResponses);
	if(q.userResponse)
	    q.userResponse = JSON.parse(q.userResponse);
	callback(err, q);
    });
};

exports.getOwnedByID = function (user, questionId, callback) {
    bdd.query("SELECT * FROM `questions` WHERE `id` = ? AND `owner` = ?", [questionId, user.id], function (err, rows) {
	let q = rows[0];
	q.reponses = JSON.parse(q.reponses);
	callback(err, q);
    });
};

// By room

exports.getFirstOfOwnedSet = function (user, setID, callback) {
    bdd.query('SELECT * from `questions` WHERE owner = ? AND indexSet = 0 AND class = ?', [user.id, setID], function (err, rows) {
	if(err)
	    callback(err, null);
	else if (rows.length == 0)
	    callback("Set associé vide");
	else {
	    let q = rows[0];
	    q.reponses = JSON.parse(q.reponses);
	    callback(err, q);
	}
    });
};

exports.getFirstOfSet = function (setID, callback) {
    bdd.query('SELECT * from `questions` WHERE indexSet = 0 AND class = ?', [setID], function (err, rows) {
	if(err)
	    callback(err, null)
	else if (rows.length == 0)
	    callback("Set associé vide");
	else {
	    let q = rows[0];
	    q.reponses = JSON.parse(q.reponses);
	    callback(err, q);
	}
    });
};

/***********************************************************************/
/*       Gestion CRUD des questions                                    */
/***********************************************************************/

// Création

exports.questionCreate = function (user, question, setID, callback) {
    console.log("question = ", question);
    
    let i=0;
    bdd.query("SELECT MAX(indexSet+1) as indexx FROM `questions` WHERE `class` = ? GROUP BY `class`", [setID], function (er, ind) {
	if(er)
	    console.log(er);
	bdd.query("INSERT INTO `questions`(`enonce`, `indexSet`, `class`, `owner`, `reponses`, `description`,`type`,`strategy`, `coef`) VALUES (?, ?, ?, ?, ?, ?, ?,?,?); SELECT LAST_INSERT_ID()",
		  [ question.enonce, ind[0] ? ind[0].indexx : 0, setID, user.id, question.reponse, question.description, question.type, question.strategy, question.coef],
		  function (err, r) {console.log(err); callback(err, r[0]);});
    });
};

// Suppression

exports.questionDelete = function (user, questionID, callback) {
    //    console.log("DELETE FROM `questions` WHERE `id` = ? AND `owner` = ?", [question.id, user.id]);
    exports.getOwnedByID(user, questionID, function(err, question) {
	bdd.query("DELETE FROM `questions` WHERE `id` = ? AND `owner` = ?", [questionID, user.id], function(err, res) {
	    if(err)
		callback(err, null);
	    else {
		bdd.query("UPDATE `questions` SET `indexSet`=indexSet-1 WHERE `indexSet`>? AND `class`=? AND `owner`=?", [question.indexSet, question.class, user.id], callback);
	    }
	});
    });
};

// Update

exports.questionUpdate = function (user, questionID, newQuestion, callback) {
    let i=0;
    bdd.query("UPDATE `questions` SET `enonce` = ?, `reponses` = ?, `description` = ?, `type` = ?, `strategy` = ?, `coef` = ? WHERE `id` = ?",
	      [newQuestion.enonce, newQuestion.reponse, newQuestion.description, newQuestion.type, newQuestion.strategy, newQuestion.coef, questionID], callback);
};



/***********************************************************************/
/*       Correction des questions                                      */
/***********************************************************************/

exports.correctSubmission = function(question, submission, strategy) {
//    console.log("queztion = ", question);
//    console.log("strategy = ", strategy);
//   console.log("queztion", question.type);
//    console.log("submission = ", submission);
    switch(/*[*/strategy/*, question.strategy]*/) {
    case "manual":
	if(question.mark)
	    return question.mark;
	return "unknown";
    case "QCM":
	let tot = 0;
	let visited = [];
	submission.forEach((rep) => {
	    console.log("Myvalidity = ",question.reponses[rep.n].validity);
	    if(!visited[rep.n] && tot != "unkown") {
		console.log("we are here");
		if(question.reponses[rep.n].validity=="true")
		    tot++;
		if(question.reponses[rep.n].validity=="false")
		    tot--;
		if(question.reponses[rep.n].validity=="to_correct"){
		    console.log("we are there");
		    tot = "unknown";
		}
	    }
	    visited[rep.n]=true;
	});
	let max = 0;
	question.reponses.forEach((rep)=> {
	    if (rep.validity == "true" && max != "unknown")
		max++;
	    if (rep.validity == "to_correct")
		max = "unknown";
	});
	if(max == "unknown" || tot == "unknown")
	    return "unknown";
	else
	    return ""+(tot*1./(max ? max : 1));
    case "all_or_0":
	if(!submission[0])
	    return "0";
	if(question.reponses[submission[0].n].validity == "true")
	    return "1";
	if(question.reponses[submission[0].n].validity == "false")
	    return "0";
	return "unknown";
    }
    
    
};
