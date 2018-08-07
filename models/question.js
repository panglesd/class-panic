bdd = require("./bdd");



exports.questionList = function (callback) {
    bdd.query("SELECT * FROM `questions`", callback);
}
exports.questionListFromSet = function (set, callback) {
    bdd.query("SELECT * FROM `questions` WHERE `class` = ?", [set.name], callback);
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
exports.questionCreate = function (user, question, callback) {
    // TO BE IMPLEMENTED
}
exports.questionDelete = function (user, question, callback) {
    // TO BE IMPLEMENTED
}
exports.questionUpdate = function (user, question, newQuestion, callback) {
    // TO BE IMPLEMENTED
}



