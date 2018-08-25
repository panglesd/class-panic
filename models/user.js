var bdd = require("./bdd");

var config = require("../configuration.js");
var bcrypt = require("bcrypt");;
const saltRounds = 10;;

/***********************************************************************/
/*       Getters pour les users : listes                               */
/***********************************************************************/

exports.userList = function (callback) {
    bdd.query('SELECT * FROM users', function(err, rows) {
	console.log(rows);
	callback(rows);
    });
}

/***********************************************************************/
/*       Getters pour les users : individu                             */
/***********************************************************************/

exports.userByID = function (userID, callback) {
    bdd.query('SELECT * FROM users WHERE id = ?', [userID],  function(err, rows) {
	console.log(rows);
	callback(rows);
    });
}

/***********************************************************************/
/*       Gestion CRUD des user                                         */
/***********************************************************************/

// Create

exports.create = function (user, callback) {
    bcrypt.hash(user.password, saltRounds, function(err, hash) {
	bdd.query('INSERT INTO `users`(`pseudo`, `password`, `email`, `fullName`, `isAdmin`) VALUES (?, ?, ?, ?, ?)', [user.pseudo, hash, user.email, user.nomComplet, user.adminPassword == config.ADMINPASSWD ], function(err, rows) {
	    console.log(rows);
	    callback(rows);
	});
    });
}

// Delete

exports.userDelete = function (user, callback) {
    bdd.query('DELETE FROM `users` WHERE `id` = ?', [room.id], callback)
}

// Update

exports.userUpdate = function (user, newUser, callback) {
    bdd.query('UPDATE `users` SET `pseudo`= ? WHERE `id` = ?', [user.pseudo, user.id], callback)
}

/***********************************************************************/
/*       Verification pour la connection                               */
/***********************************************************************/

exports.userCheck = function(user, passwd, callback) {
    bdd.query('SELECT * FROM users WHERE `pseudo` = ?', [user],
	      function (error, results, fields) {
		  if (error) throw error;
		  if(!results[0]) 
		      callback(null, false);
		  else {
		      userC = results[0];
		      bcrypt.compare(passwd, userC.password, function(err, res) {
			  if(res)
			      callback(err, userC);
			  else 
			      callback(null, false);			      
		      });
		  }
	      });
};

module.export = []
