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

exports.getFileCorrect = function (question, n_ans, fileName, callback) {
    console.log("thequestio is ", question);
    //    question.correcFileInfo = JSON.parse(question.correcFileInfo);
    if(question.reponses[n_ans].correcFilesInfo.includes(fileName)) {
	let path = "storage/question"+question.id+"/answer"+n_ans+"/"+fileName;
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
    console.log("question = ", question);
    
    let i=0;
    bdd.query("SELECT MAX(indexSet+1) as indexx FROM `questions` WHERE `class` = ? GROUP BY `class`", [setID], function (er, ind) {
	if(er) console.log(er);
	bdd.query("INSERT INTO `questions`(`enonce`, `indexSet`, `class`, `owner`, `reponses`, `description`,`type`, `coef`) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [
	    question.enonce, ind[0] ? ind[0].indexx : 0, setID, user.id, /* will be modified later */ "", question.description, question.type, question.coef
	], function (err, r) {
	    if(err) console.log(err);
	    let questionID = r.insertId;
	    let newReponses = [];
	    async.forEachOf(question.reponses, (reponse, n_ans, callbackRep) => {
		newReponses[n_ans] = {correcFilesInfo:[]};
		async.eachOf(reponse.correcFilesInfo, (file, i, callbackFileInfo) => {
 		    let path = "storage/question"+questionID+"/answer"+n_ans+"/";
		    console.log("path =", path+file.name);
		    mkdirp(path, (err) => {
			console.log(err);
			file.mv(path+file.name, (err, res) => {
			    console.log("adding "+file.name+" a la liste de la reponse numero "+n_ans);
			    newReponses[n_ans].correcFilesInfo.push(file.name);
			    callbackFileInfo(err, res);});
		    });
		}, (err) => {
		    console.log(err);
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

exports.questionUpdate = function (user, questionID, newQuestion, filesToRemove, callback) {
    console.log("filesToRemove = ", filesToRemove);
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
		console.log("path =", path+file.name);
		mkdirp(path, (err) => {
		    console.log(err);
		    file.mv(path+file.name, (err, res) => {
			console.log("adding "+file.name+" a la liste de la reponse numero "+n_ans);
			removeElem(question.reponses[n_ans].correcFilesInfo, file.name);
			question.reponses[n_ans].correcFilesInfo.push(file.name);
			callbackFileInfo(err, res);});
		});
	    }, (err) => {
		console.log(err);
		callbackRep(err);
	    });
	}, (err) => {
	    if(err) // Il y a eu une erreur lors de l'enregistrement des fichiers : on préfère tout supprimer (il faudrait aussi supprimer les fichiers enregistrés...)
		bdd.query("DELETE FROM `questions` WHERE id = ?", [questionID], err2 => {
		    // fs.rm(path);
		    callback(err);
		});
	    else {
		question.reponses.forEach((rep, n_ans) => {
		    newQuestion.reponses[n_ans].correcFilesInfo = rep.correcFilesInfo;
		});
		bdd.query("UPDATE `questions` SET `enonce` = ?, `reponses` = ?, `description` = ?, `type` = ?, `coef` = ? WHERE `id` = ?",
			  [newQuestion.enonce, JSON.stringify(newQuestion.reponses), newQuestion.description, newQuestion.type, newQuestion.coef, questionID], (err, res) => {callback(err, questionID);});
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
*/
};



/***********************************************************************/
/*       Correction des questions                                      */
/***********************************************************************/

// function returnGradeRep(validity, strategy) {
//     let n,p;
//     switch(strategy) {
//     case "QCM":
// 	n=2; p=1; break;
//     default:
// 	n=1; p=0;
//     }
//     return (n * validity - p);
// }
// function assignGradeQuestion(question, submission, mergingStrategy) {
//     switch(mergingStrategy) {
//     case "normal":
// 	let maxGrade=0;
// 	question.reponses.forEach((rep, index) => {
// 	    maxGrade += returnGradeRep(rep.validity ? rep.validity : 1, question.strategy);
// 	});
// 	if(maxGrade < 0) maxGrade = 0-maxGrade;
// 	if(maxGrade == 0) maxGrade = 1;
// 	let grade = 0;
// 	submission.forEach((rep, index) => {
// 	    if(rep.selected)
// 		grade += returnGradeRep(rep.validity ? rep.validity : 1, question.strategy);
// 	});
//     }    
// } 

exports.correctSubmission = function(question, submission, callback) {
    let submPoints = 0;
    let totPoints = 0;
    submission.forEach((repSubm, index) => {
	let rep = question.reponses[index];
	if(typeof(repSubm.points) == "number")
	    submPoints += repSubm.points;
	else {
	    if(repSubm.selected) {
		if(repSubm.validity == "true") submPoints += rep.selected.vrai;
		if(repSubm.validity == "false") submPoints += rep.selected.vrai;
	    }
	    if(!repSubm.selected) {
		if(repSubm.validity == "true") submPoints += rep.unselected.vrai;
		if(repSubm.validity == "false") submPoints += rep.unselected.vrai;
	    }
	}
	totPoints += rep.maxPoints;
    });
    callback(null, submPoints);
//     switch(markInfo.strategy ? markInfo.strategy : question.strategy) {
//     case "manual":
// 	if(markInfo.mark)
// 	    return markInfo.mark; // CALLBACK !!!
// 	return "unknown";
//     case "QCM":
// 	let tot = 0;
// 	let maxGrade = 0;
// 	submission.forEach((rep) => {
// 	    if(rep.validity == "to_correct")
// 		callback("has unknown value", null);
// 	    if(rep.selected)
// 		tot += 2*rep.validity - 1;
// 	    maxGrade += Math.max(0, 2*rep.validity -1);
// 	});
// 	return tot*1./(maxGrade != 0 ? maxGrade : 1);
//     case "Mean":
//     case "all_or_0":
// 	if(!submission[0])
// 	    return "0";
// //	if(question.reponses[submission[0].n].validity == "true")
// //	    return "1";
// //	if(question.reponses[submission[0].n].validity == "false")
// //	    return "0";
// 	return "unknown";
//     }
    
    
};
