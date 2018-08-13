bdd = require("./bdd");



exports.questionList = function (callback) {
    bdd.query("SELECT * FROM `questions`", callback);
}
exports.questionListFromSetId = function (set, callback) {
    bdd.query("SELECT * FROM `question2` WHERE `class` = ? ORDER BY indexSet", [set], callback);
}

exports.questionListFromSetFormatted = function (set, callback) {
    bdd.query("SELECT * FROM `questions` WHERE `class` = ?", [set.id], function(err, qList) {
	set = { firstQ : set.firstQuestion , lQuestion : [] };
	qList.forEach(function (q) {
	    set.lQuestion[q.id]=q;
	});
	callback(err, set);
    });
}
exports.questionListFromRoomId = function (id, callback) {
    bdd.query("SELECT * FROM `setDeQuestion` WHERE `id` = (SELECT questionSet FROM `rooms` WHERE `id` = ?)", [id], function(err, qList) {
	exports.questionListFromSetFormatted(qList[0], callback);
    });
}
exports.questionGet = function (questionId, callback) {
    bdd.query("SELECT * FROM `question2` WHERE `id` = ?", [questionId], function (err, rows) {
	q = rows[0];
	
	q.reponses = JSON.parse(q.reponses);
//	console.log(q);
	callback(err, rows[0])
    });
}
exports.questionCreate = function (user, question, set, callback) {
    
    i=1;
    reponse = [];
//    console.log("question is ", question);
    while(question["q"+i]) {
	reponse[i-1]= { reponse: question["q"+i] , validity: false };
	i++;
    }
//    console.log(reponse);
  //  console.log("INSERT INTO `question2`(`enonce`, `indexSet`, `class`, `owner`, `reponses`) VALUES (? , ?, ?, ?, ?)",
//		[ question.enonce, 100, set.id, user.id, JSON.stringify(reponse) ])
    bdd.query("INSERT INTO `question2`(`enonce`, `indexSet`, `class`, `owner`, `reponses`) VALUES (? , ?, ?, ?, ?); SELECT LAST_INSERT_ID()",
	      [ question.enonce, 100, set.id, user.id, JSON.stringify(reponse) ],
	      function (err, r) {callback(err, r[0])});
    
}
exports.questionDelete = function (user, question, callback) {
    console.log("DELETE FROM `question2` WHERE `id` = ? AND `owner` = ?", [question.id, user.id]);
    bdd.query("DELETE FROM `question2` WHERE `id` = ? AND `owner` = ?", [parseInt(question.id), user.id], callback);
    // TO BE IMPLEMENTED
}
exports.questionUpdate = function (user, question, newQuestion, callback) {
    // TO BE IMPLEMENTED
    i=1;
    reponse = [];
//    console.log("question is ", question);
//    console.log("newquestion is ", newQuestion);
    while(newQuestion["q"+i]) {
	reponse[i-1]= { reponse: newQuestion["q"+i] , validity: false };
	i++;
    }
//    console.log("UPDATE `question2` SET `enonce` = ?, `reponses` = ?, `correct` = ?  WHERE `id` = ? AND `owner` = ?",
//		[newQuestion.enonce, JSON.stringify(reponse), newQuestion.correct, parseInt(question.id), user.id]);
    bdd.query("UPDATE `question2` SET `enonce` = ?, `reponses` = ?, `correct` = ?  WHERE `id` = ? AND `owner` = ?",
	      [newQuestion.enonce, JSON.stringify(reponse), newQuestion.correct, parseInt(question.id), user.id], callback);
}



