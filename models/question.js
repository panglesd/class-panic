/*

  Actuellement :

    Une question est un objet JS qui contient les propriétés suivantes :
      Un énoncé
      l'ID du set auquel il appartient
      son index dans le set (sa position: 1er, deuxième...)
      Une liste de réponses possibles
      à qui il appartient (superflu par rapport à l'appartenance du set)
      un type (mono ou multi réponses)
      une stratégie de correction
      un coefficient
      une description
      la liste des fichiers pour la correction

    Une réponse possible est un objet JS qui contient :
      L'énoncé de la réponse (reponse)
      Sa validité par défaut (validity, "true" ou "false" ou "to_correct")
      la question possède-t-elle une entrée texte ? (texted)
        Si oui, la correction de ce texte (correction)
      la question possède-t-elle une entrée fichier ? (hasFile)

    Une soummission est :
      Un statsBloc:
        setId, setText,
	roomId, roomText,
	questionId, questionText,
	courseId, courseText,
      Un stats:
        un user (userID)
	une note (correct)
	une strategy,
	un timestamp (time)
	une customQuestion:
	  une liste de réponse possible où l'on modifie juste la validity...
	une response
	  une liste de couples "n":numéro de réponse, "text": réponse éventuelle
	un fileInfo
	  une liste de fichiers éventuellement uploadé, [n]=le fichier pour la n-ième réponse, un fichier étant
	    un nom de fichier, un hash, un timestamp.


  Ce que je voudrai faire :

  Une question est un objet JS qui contient les propriétés suivantes :
    Un titre
    l'ID du set auquel il appartient
    son index dans le set (sa position: 1er, deuxième...)
    Une liste d'éléments !
    un type (mono ou multi réponses, voire exercice ?)
    une stratégie de correction
    un coefficient

    Un élément est soit une réponse possible, soit une description

    Une description est un objet JS avec son type (description) et la description (description)

    Une réponse possible est un objet JS qui contient :
      L'énoncé de la réponse (reponse)
      Sa validité par défaut (validity, "true" ou "false" ou "to_correct")
      la question possède-t-elle une entrée texte ? (texted)
        Si oui, la correction de ce texte (correction)
      la question possède-t-elle une entrée fichier ? (hasFile)
        Si oui, la correction de ce(s) fichier(s) (correcFileinfo)
      un coefficient
  
    Une soummission est :
      Un statsBloc:
        setId, (setText?,)
	roomId, (roomText?,)
	questionId, (questionText?,)
	courseId, (courseText?,)
      Un stats:
        un user (userID)
	une note (correct)
	une strategy,
	un timestamp (time)
	une correction personnelle
	  une liste de note, commentaire, [n] pour la n-ième question
	une response
	  une liste d'objets, contenant éventuellement : "text", "files". [n] pour la nième réponse, =null si non séléctionnée
                                                                  un fichier étant
                                                        	    un nom de fichier, un hash, un timestamp.


*/
var async = require("async");
let bdd = require("./bdd");
var mkdirp = require("mkdirp");
var fs = require("fs");

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
    bdd.query("SELECT * FROM `questions` WHERE `class` = ? ORDER BY indexSet", [setID], (err, qList) => {
	qList.forEach((qu) => {
	    qu.reponses = JSON.parse(qu.reponses);
	});
	callback(err, qList);	
    });
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
	"SELECT enonce, questionID, questions.id as id, description, indexSet, questions.reponses as allResponses, statsOfUser.response as userResponse, type  FROM "+
	  "questions LEFT OUTER JOIN "+
	  "(SELECT questionID, response FROM stats INNER JOIN statsBloc ON statsBloc.id = blocID WHERE userID = ? AND roomID = ?) statsOfUser" +
	  " ON statsOfUser.questionID = questions.id WHERE indexSet <= ? AND questions.class = (SELECT questionSet FROM rooms WHERE id = ?) ORDER BY indexSet DESC";
     glere = bdd.query(query, [user.id, roomID, questionIndex, roomID], function(err, row) {
	 console.log(err);
	 console.log("gler", glere.sql);
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

exports.getFileCorrect = function (question, n_ans, callback) {
    console.log("thequestio is ", question);
    question.correcFileInfo = JSON.parse(question.correcFileInfo);
    let path = "storage/question"+question.id+"/anwer"+n_ans+"/"+question.correcFileInfo[n_ans];
    fs.readFile(path, callback);    
};

/***********************************************************************/
/*       Gestion CRUD des questions                                    */
/***********************************************************************/

// Création

exports.questionCreate = function (user, question, filesData, setID, callback) {
    console.log("question = ", question);
    
    let i=0;
    bdd.query("SELECT MAX(indexSet+1) as indexx FROM `questions` WHERE `class` = ? GROUP BY `class`", [setID], function (er, ind) {
	if(er)
	    console.log(er);
//	let fileNames = question.map((repPoss) => { return repPoss.fileInfo.name;});
	// bdd.query("INSERT INTO `questions`(`enonce`, `indexSet`, `class`, `owner`, `reponses`, `description`,`type`,`strategy`, `coef`, `correcFileInfo`) VALUES (?, ?, ?, ?, ?, ?, ?, ?,?,?); SELECT LAST_INSERT_ID() as id", [
	//     question.enonce, ind[0] ? ind[0].indexx : 0, setID, user.id, question.reponse, question.description, question.type, question.strategy, question.coef, JSON.stringify(fileNames)
	bdd.query("INSERT INTO `questions`(`enonce`, `indexSet`, `class`, `owner`, `reponses`, `description`,`type`,`strategy`, `coef`) VALUES (?, ?, ?, ?, ?, ?, ?, ?,?); SELECT LAST_INSERT_ID() as id", [
	    question.enonce, ind[0] ? ind[0].indexx : 0, setID, user.id, question.reponse, question.description, question.type, question.strategy, question.coef
	], function (err, r) {
	    console.log(err, r);
	    let questionID = r[1][0].id;
	    async.eachOf(filesData, (file, index, callback) => {
		if(file) {
 		    let path = "storage/question"+questionID+"/anwer"+index+"/";
		    console.log("path =", path+file.name);
		    mkdirp(path, (err) => {
			file.mv(path+file.name, callback);
		    });
		}
		else
		    callback();
	    }, (err) => {
		console.log(err);
		callback(err, questionID);
	    });
	});
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

exports.questionUpdate = function (user, questionID, newQuestion, filesData, callback) {
    let i=0;
    bdd.query("UPDATE `questions` SET `enonce` = ?, `reponses` = ?, `description` = ?, `type` = ?, `strategy` = ?, `coef` = ? WHERE `id` = ?",
	      [newQuestion.enonce, newQuestion.reponse, newQuestion.description, newQuestion.type, newQuestion.strategy, newQuestion.coef, questionID], (err, res) =>
	      async.eachOf(filesData, (file, index, callback) => {
		  if(file) {
 		      let path = "storage/question"+questionID+"/anwer"+index+"/";
		      console.log("path =", path+file.name);
		      mkdirp(path, (err) => {
			  file.mv(path+file.name, callback);
		      });
		  }
		  else
		      callback();
	      }, (err) => {
		  console.log(err);
		  callback(err, questionID);
	      })
	     );
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
//	    console.log("Myvalidity = ",question.reponses[rep.n].validity);
	//     if(!visited[rep.n] && tot != "unkown") {
	// 	console.log("we are here");
	// 	if(question.reponses[rep.n].validity=="true")
	// 	    tot++;
	// 	if(question.reponses[rep.n].validity=="false")
	// 	    tot--;
	// 	if(question.reponses[rep.n].validity=="to_correct"){
	// 	    console.log("we are there");
	// 	    tot = "unknown";
	// 	}
	//     }
	//     visited[rep.n]=true;
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
//	if(question.reponses[submission[0].n].validity == "true")
//	    return "1";
//	if(question.reponses[submission[0].n].validity == "false")
//	    return "0";
	return "unknown";
    }
    
    
};
