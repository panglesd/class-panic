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
let Stats = require("./stats");
var mkdirp = require("mkdirp");
var fs = require("fs");
var config = require("./../configuration");

/***********************************************************************/
/*       Getters pour les question : listes                            */
/***********************************************************************/

let formatQuestion = function (question) {
    question.reponses = JSON.parse(question.reponses);
    question.criteres = JSON.parse(question.criteres);
    exports.maxPointsOfQuestion(question, (err, maxP)=> {
	question.maxPoints = maxP;
    });
};

// List of all questions

exports.questionList = function (callback) {
    bdd.query("SELECT * FROM `questions`", (err, qList) => {
	qList.forEach(formatQuestion);
	callback(err, qList);	
    });
};

// List of all owned questions

exports.ownedList = function (user, callback) {
    bdd.query("SELECT * FROM `questions` WHERE owner = ?", [user.id],  (err, qList) => {
	qList.forEach(formatQuestion);
	callback(err, qList);	
    });;
};

// List by set ID

exports.listBySetID = function (setID, callback) {
    bdd.query("SELECT * FROM `questions` WHERE `class` = ? ORDER BY indexSet", [setID],  (err, qList) => {
	qList.forEach(formatQuestion);
	callback(err, qList);	
    });
};

exports.listOwnedBySetID = function (user, setID, callback) {
    bdd.query("SELECT * FROM `questions` WHERE `class` = ? AND `owner` = ? ORDER BY indexSet", [setID, user.id],  (err, qList) => {
	qList.forEach(formatQuestion);
	callback(err, qList);	
    });
};

// List by room ID

exports.listByRoomID = function (id, callback) {
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
    bdd.query("SELECT * FROM `questions` WHERE `class` IN (SELECT id FROM setDeQuestion WHERE courseID = ?) ORDER BY indexSet", [courseID],  (err, qList) => {
	qList.forEach(formatQuestion);
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
	formatQuestion(q);
	callback(err, q);
    });
};

exports.getByIndex = function (questionIndex, roomID, callback) {
    bdd.query("SELECT * FROM `questions` WHERE `indexSet` = ? AND class = (SELECT questionSet FROM rooms WHERE id = ?)", [questionIndex, roomID], function (err, rows) {
	if(err) console.log(err);
	let q = rows[0];
	formatQuestion(q);
	callback(err, q);
    });
};

// exports.getByIndexCC = function (questionIndex, user, roomID, callback) {
//     let query = 
// 	"SELECT enonce, questionID, questions.id as id, description, indexSet, questions.reponses as allResponses, statsOfUser.response as userResponse, type  FROM "+
// 	  "questions LEFT OUTER JOIN "+
// 	  "(SELECT questionID, response FROM stats INNER JOIN statsBloc ON statsBloc.id = blocID WHERE userID = ? AND roomID = ?) statsOfUser" +
// 	  " ON statsOfUser.questionID = questions.id WHERE indexSet <= ? AND questions.class = (SELECT questionSet FROM rooms WHERE id = ?) ORDER BY indexSet DESC";
//      let glere = bdd.query(query, [user.id, roomID, questionIndex, roomID], function(err, row) {
// 	let q = row[0];
// 	q.allResponses = JSON.parse(q.allResponses);
// 	if(q.userResponse)
// 	    q.userResponse = JSON.parse(q.userResponse);
// 	callback(err, q);
//     });
// };

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

exports.getFileCorrect = function (question, n_ans, fileName, callback) {
    //    question.correcFileInfo = JSON.parse(question.correcFileInfo);
    if(question.reponses[n_ans].correcFilesInfo.includes(fileName)) {
	let path = config.STORAGEPATH+"/question"+question.id+"/answer"+n_ans+"/"+fileName;
	fs.readFile(path, callback);    
    }
    else
	callback("bad file name", null);
};

/***********************************************************************/
/*       Gestion CRUD des questions                                    */
/***********************************************************************/

// Création

exports.questionCreate = function (user, question, /*filesData,*/ setID, callback) {
    let i=0;
    bdd.query("SELECT MAX(indexSet+1) as indexx FROM `questions` WHERE `class` = ? GROUP BY `class`", [setID], function (er, ind) {
	if(er) console.log(er); // Il faudrait regrouper reponses, description, type, coef, correcType et criteres dans un seul champs de la BDD... 
	bdd.query("INSERT INTO `questions`(`enonce`, `indexSet`, `class`, `owner`, `reponses`, `description`,`type`, `coef`, `correcType`, `criteres`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [
	    question.enonce, ind[0] ? ind[0].indexx : 0, setID, user.id, /* will be modified later */ "", question.description, question.type, question.coef, question.correcType, JSON.stringify(question.criteres)
	], function (err, r) {
	    if(err) console.log(err);
	    let questionID = r.insertId;
	    let newReponses = [];
	    async.forEachOf(question.reponses, (reponse, n_ans, callbackRep) => {
		newReponses[n_ans] = {correcFilesInfo:[]};
		async.eachOf(reponse.correcFilesInfo, (file, i, callbackFileInfo) => {
 		    let path = config.STORAGEPATH+"/question"+questionID+"/answer"+n_ans+"/";
		    mkdirp(path, (err) => {
			if(err) console.log(err);
			file.mv(path+file.name, (err, res) => {
			    newReponses[n_ans].correcFilesInfo.push(file.name);
			    callbackFileInfo(err, res);});
		    });
		}, (err) => {
		    if(err) console.log(err);
		    callbackRep(err);
		});
	    }, (err) => {
		if(err) // Il y a eu une erreur lors de l'enregistrement des fichiers : on préfère tout supprimer (il faudrait aussi supprimer les fichiers enregistrés...)
		    bdd.query("DELETE FROM `questions` WHERE id = ?", [questionID], err2 => {
			// fs.rm(path);
			callback(err);
		    });
		else {
		    newReponses.forEach((rep, n_ans) => {
			question.reponses[n_ans].correcFilesInfo = rep.correcFilesInfo;
		    });
		    bdd.query("UPDATE `questions` SET reponses = ? WHERE id = ?", [JSON.stringify(question.reponses), questionID], (err) => {callback(err, questionID);});
		}
	    });
	});
    });
}

// Suppression

exports.questionDelete = function (user, questionID, callback) {
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

exports.questionUpdate = function (user, questionID, newQuestion, filesToRemove, callback) {
    function removeElem(array, elem) {
	let index = array.indexOf(elem);
	if (index > -1) {
	    array.splice(index, 1);
	}
	return index > -1;
    }
    exports.getByID(questionID, (err, question) =>{

	filesToRemove.forEach((fileList, n_ans) => {
	    fileList.forEach((fileName) => {
		removeElem(question.reponses[n_ans].correcFilesInfo, fileName);
	    });
	});
	let newReponses = [];
	
	async.forEachOf(newQuestion.reponses, (reponse, n_ans, callbackRep) => {
	    newReponses[n_ans] = {correcFilesInfo:[]};
	    async.eachOf(reponse.correcFilesInfo, (file, i, callbackFileInfo) => {
 		let path = "storage/question"+questionID+"/answer"+n_ans+"/";
		mkdirp(path, (err) => {
		    if(err) console.log(err);
		    file.mv(path+file.name, (err, res) => {
			removeElem(question.reponses[n_ans].correcFilesInfo, file.name);
			question.reponses[n_ans].correcFilesInfo.push(file.name);
			callbackFileInfo(err, res);});
		});
	    }, (err) => {
		if(err) console.log(err);
		callbackRep(err);
	    });
	}, (err) => {
	    if(err) // Il y a eu une erreur lors de l'enregistrement des fichiers : on préfère tout supprimer (il faudrait aussi supprimer les fichiers enregistrés...)
		// VRAIMENT ?????????????????? c'etait un reste de "create"
// 		bdd.query("DELETE FROM `questions` WHERE id = ?", [questionID], err2 => {
		    // fs.rm(path);
		    callback(err);
//		});
	    else {
		question.reponses.forEach((rep, n_ans) => {
		    newQuestion.reponses[n_ans].correcFilesInfo = rep.correcFilesInfo;
		});
		bdd.query("UPDATE `questions` SET `enonce` = ?, `reponses` = ?, `description` = ?, `type` = ?, `coef` = ?, `correcType` = ?, `criteres` = ? WHERE `id` = ?",
			  [newQuestion.enonce, JSON.stringify(newQuestion.reponses), newQuestion.description, newQuestion.type, newQuestion.coef, newQuestion.correcType, JSON.stringify(newQuestion.criteres), questionID], (err, res) => {
			      exports.getByID(question.id, (err, newQuestion) => {
				  exports.updateGradesOfQuestion(newQuestion, (err, res) => {
				      callback(err, questionID);
				  });
			      });
			  });
//		bdd.query("UPDATE `questions` SET reponses = ? WHERE id = ?", [JSON.stringify(question.reponses), questionID], (err) => {callback(err, questionID);});
	    }
	});

    });
/*
    bdd.query("UPDATE `questions` SET `enonce` = ?, `reponses` = ?, `description` = ?, `type` = ?, `strategy` = ?, `coef` = ? WHERE `id` = ?",
	      [newQuestion.enonce, newQuestion.reponse, newQuestion.description, newQuestion.type, newQuestion.strategy, newQuestion.coef, questionID], (err, res) =>
	      async.eachOf(filesData, (file, index, callback) => {
		  if(file) {
 		      let path = "storage/question"+questionID+"/answer"+index+"/";
		      mkdirp(path, (err) => {
			  file.mv(path+file.name, callback);
		      });
		  }
		  else
		      callback();
	      }, (err) => {
		  callback(err, questionID);
	      })
	     );
*/
};



/***********************************************************************/
/*       Correction des questions                                      */
/***********************************************************************/

exports.updateGradesOfQuestion = function(question, callback) {
    Stats.getStats({questionID: question.id }, (err, statsL) => {
	async.forEach(statsL,(submission, callbackForEach) => {
	    Stats.getSubmissionByID(submission.statsID, (err, trueSubm) => {
		exports.correctAndLogSubmission(question, trueSubm, callbackForEach);
	    });
	}, (err) => {
	    callback(err);
	});
    });
};

exports.correctAndLogSubmission = function(question, submission, callback) {
    exports.correctSubmission(question, submission, (err, grade) => {
	let query = "UPDATE `stats` SET correct = ? WHERE id = ?";
	if(typeof(grade)=="number")
	    grade = parseFloat(grade.toFixed(2));
	let params = [grade, submission.statsID];
	bdd.query(query, params, (err,res) => { callback(err,res);});
    });
};

exports.maxPointsOfQuestion = function(question, callback) {
    let maxPointsTotal = 0;
    if(question.correcType=="answerByAnswer") {
	question.reponses.forEach((questReponse) => {
	    let maxPoints;
	    if(questReponse.validity == "true")
		maxPoints = Math.max(questReponse.strategy.selected.vrai,
				     questReponse.strategy.unselected.vrai);
	    else if (questReponse.validity == "false")
		maxPoints = Math.max(questReponse.strategy.selected.faux,
				     questReponse.strategy.unselected.faux);
	    else 
		maxPoints = Math.max(questReponse.strategy.selected.vrai,
				     questReponse.strategy.selected.faux,
				     questReponse.strategy.unselected.vrai,
				     questReponse.strategy.unselected.faux);
	    questReponse.maxPoints = maxPoints;
	    maxPointsTotal += maxPoints;
	});
    }
    else {
	question.criteres.forEach((critere) => {
	    maxPointsTotal += parseInt(critere.coef); 
	});
    }
    callback(null, maxPointsTotal);
};

exports.correctSubmission = function(question, submission, callback) {
    if(submission.strategy=="manual") {
	callback(null, submission.correct);
    }
    else if(submission.strategy=="computed" && question.correcType == "globally") {
	let sumCoef = 0;
	let sumNote = 0;
	submission.globalInfo.criteria.forEach((critere, index) => {
	    sumCoef += question.criteres[index].coef;
	    sumNote += question.criteres[index].coef*critere;
	});
	// if(sumCoef!=0)		
	if(isNaN(sumNote) || typeof(sumNote)!= "number")
	    callback(null, "?");
	else
	    callback(null, sumNote);

    }
    else if(submission.strategy=="computed" && question.correcType == "answerByAnswer") {
	let submPoints = 0;
	let totPoints = 0;
	submission.response.forEach((repSubm, index) => {
	    let rep = question.reponses[index];
	    // Is the following really necessary ? No !
	    // if(typeof(repSubm.points) == "number")
	    // 	submPoints += repSubm.points;
	    // else 
	    if(typeof(repSubm.validity) == "number") {
		if(repSubm.selected) 
		    submPoints += repSubm.validity*rep.strategy.selected.vrai + (1-repSubm.validity)*rep.strategy.selected.faux;
		if(!repSubm.selected) 
		    submPoints += repSubm.validity*rep.strategy.unselected.vrai + (1-repSubm.validity)*rep.strategy.unselected.faux;
	    }
	    else {
		let repValidity;
		if(rep.validity == "true") repValidity = 1;
		else if(rep.validity == "false") repValidity = 0;
		else repValidity = NaN;
		if(repSubm.selected){
		    if(rep.strategy.selected.vrai != rep.strategy.selected.faux)
			submPoints += (repValidity)*rep.strategy.selected.vrai + (1-repValidity)*rep.strategy.selected.faux;
		    else
			submPoints += rep.strategy.selected.vrai;
		}
		else if(!repSubm.selected)
		    if(rep.strategy.unselected.vrai != rep.strategy.unselected.faux)
			submPoints += (repValidity)*rep.strategy.unselected.vrai + (1-repValidity)*rep.strategy.unselected.faux;
		    else
			submPoints += rep.strategy.unselected.faux;
	    }
	    totPoints += rep.maxPoints;
	});
	if(isNaN(submPoints))
	    callback(null, "?");
	else
	    callback(null, submPoints);
    }
};
