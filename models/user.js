bdd = require("./bdd");

var bcrypt = require("bcrypt");;
const saltRounds = 10;;

exports.userFromSession = function(callback) {
    callback(req.session.user);
};

exports.userCheck = function(user, passwd, callback) {
    console.log("B");
    bdd.query('SELECT * FROM users WHERE `pseudo` = ?', [user],
	      function (error, results, fields) {
		  if (error) throw error;
		  console.log("resul", results);
		  if(!results[0]) {
		      callback(null, false);
		  }
		  else {
		      userC = results[0];
		      bcrypt.compare(passwd, userC.password, function(err, res) {
			  console.log("C");
			  if(res) {
			      console.log("D")
			      callback(err, userC);
			  }
			  else {
			      callback(null, false);			      
			  }
		      });
		  }
	      });
};

exports.userList = function (callback) {
    bdd.query('SELECT * FROM users', function(err, rows) {
	console.log(rows);
	callback(rows);
    });
}
exports.create = function (user, callback) {
    // TO BE CHECKED
    console.log(user);

    bcrypt.hash(user.password, saltRounds, function(err, hash) {
	// Store hash in your password DB.
	//	console.log('INSERT INTO `users`(`pseudo`, `password`, `email`, `fullName`, `isAdmin`) VALUES (?, PASSWORD(?), ?, ?, ?)', [user.pseudo, user.password, user.email, user.nomComplet, user.adminPassword == "classPanix" ]);
	
	bdd.query('INSERT INTO `users`(`pseudo`, `password`, `email`, `fullName`, `isAdmin`) VALUES (?, ?, ?, ?, ?)', [user.pseudo, hash, user.email, user.nomComplet, user.adminPassword == "classPanix" ], function(err, rows) {
	    console.log(rows);
	    callback(rows);
	});
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
