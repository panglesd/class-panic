bdd = require("./bdd");

//function (callback) { callback() };


exports.userFromSession = function(callback) {
    callback(req.session.user);
};

exports.userCheck = function(user, passwd, callback) {
    bdd.query('SELECT * FROM users WHERE `pseudo` = ? AND `password` = ?', [user, passwd],
		  function (error, results, fields) {
		      if (error) throw error;
		      //	console.log([user, passwd]);
		      if(results[0]) {
			  callback(results[0]);
		      }
		      else {
			  callback(false);
		      }
		  });
};

exports.userList = function (callback) {
    bdd.query('SELECT * FROM users', function(err, rows) {
	console.log(rows);
	callback(rows);
    });
}
exports.userCreate = function (user, callback) {
    // TO BE CHECKED
    bdd.query('INSERT INTO `users`(`pseudo`, `password`) VALUES (?, ?)', [user.pseudo, user.passwd], function(err, rows) {
	console.log(rows);
	callback(rows);
    });
}
exports.userDelete = function (user, callback) {
    bdd.query('DELETE FROM `users` WHERE `id` = ?', [room.id], callback)
    // TO BE CHECKED
}
exports.userUpdate = function (user, newUser, callback) {
    bdd.query('UPDATE `users` SET `pseudo`= ? WHERE `id` = ?', [user.pseudo, user.id], callback)
    // TO BE CHECKED
}
exports.isAdmin = function (user, callback) {
    // TO BE IMPLEMENTED
}


module.export = []
