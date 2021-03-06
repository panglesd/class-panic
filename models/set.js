var bdd = require("./bdd");
var async = require("async");

var Question = require('./question');

/***********************************************************************/
/*       Getters pour les rooms : listes                               */
/***********************************************************************/

exports.setList = function (callback) {
    bdd.query('SELECT * FROM setDeQuestion', function(err, rows) {
	callback(err, rows);
    });
}

exports.setOwnedList = function (user, courseID, callback) {
    bdd.query('SELECT * FROM setDeQuestion WHERE `courseID` = ?', [courseID], function(err, rows) {
	callback(err, rows);
    });
}

exports.setOwnedListAll = function (user, callback) {
    bdd.query('SELECT * FROM setDeQuestion WHERE `owner` = ?', [user.id], function(err, rows) {
	callback(err, rows);
    });
}

exports.listByCourseID = function (courseID, callback) {
    bdd.query('SELECT * FROM setDeQuestion WHERE `courseID` = ?', [courseID], function(err, rows) {
	callback(err, rows);
    });
}

/***********************************************************************/
/*       Getters pour les rooms : individu                             */
/***********************************************************************/

// By ID

exports.setGet = function (setID, callback) {
    bdd.query('SELECT * FROM setDeQuestion WHERE `id` = ?', [setID], function(err, rows) {
	callback(err, rows[0]);
    });
}
exports.getByID = function (setID, callback) {
    bdd.query('SELECT * FROM setDeQuestion WHERE `id` = ?', [setID], function(err, rows) {
	callback(err, rows[0]);
    });
}

exports.setOwnedGet = function (user, setID, callback) {
    bdd.query('SELECT * FROM setDeQuestion WHERE `owner` = ? AND `id` = ?', [user.id, setID], function(err, rows) {
	callback(err, rows[0]);
    });
}

/***********************************************************************/
/*       Gestion CRUD des sets                                         */
/***********************************************************************/

// Create

exports.setCreate = function (user, courseID, set, callback) {
    bdd.query("INSERT INTO `setDeQuestion`(`name`, `owner`, `courseID`) VALUES (?, ?, ?); SELECT * FROM `setDeQuestion` WHERE `id` = LAST_INSERT_ID();", [set.name , user.id, courseID], function(err, rows) {
	callback(err, rows[1][0]);
    });
}

// Delete

exports.setDelete = function (user, set, callback) {
    bdd.query("DELETE FROM `setDeQuestion` WHERE `id` = ? AND `owner` = ?", [set.id, user.id], function (err, row) {
	callback(err, row);
    });
}

// Update

exports.setUpdate = function (user, set, newSet, callback) {
    bdd.query("UPDATE `setDeQuestion` SET `name`= ? WHERE `id` = ? AND `owner` = ?", [newSet.name, set.id, user.id], function (err, row) {
	callback(err, row);
    });
}

exports.reOrder = function (course, set, newOrder, callback) {
    async.eachOf(
	newOrder,
	function(item, key, callback) {
	    bdd.query("UPDATE `questions` SET `indexSet`= ? WHERE `id` = ? AND `class` = ?", [key, item, set.id], function (err, row) {
		callback(err, row);
	    });
	},
    callback);
    
}
