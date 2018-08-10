bdd = require("./bdd");



exports.questionList = function (callback) {
    bdd.query("SELECT * FROM `questions`", callback);
}
exports.questionListFromSetId = function (set, callback) {
    bdd.query("SELECT * FROM `questions` WHERE `class` = ?", [set], callback);
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
    bdd.query("SELECT * FROM `questions` WHERE `id` = ?", [questionId], function (err, rows) { callback(err, rows[0])});
}
exports.questionCreate = function (user, question, callback) {
//    bdd.query("INSERT INTO `questions`(`enonce`, `reponse1`, `reponse2`, `reponse3`, `reponse4`, `correct`, `class`, `owner`, `nextQuestion`, `reponses`) VALUES ([value-1],[value-2],[value-3],[value-4],[value-5],[value-6],[value-7],[value-8],[value-9],[value-10],[value-11])
}
exports.questionDelete = function (user, question, callback) {
    // TO BE IMPLEMENTED
}
exports.questionUpdate = function (user, question, newQuestion, callback) {
    // TO BE IMPLEMENTED
}



