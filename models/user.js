var bdd = require("./bdd");

var config = require("../configuration.js");
var bcrypt = require("bcrypt");;
const saltRounds = 10;;

/***********************************************************************/
/*       Getters pour les users : listes                               */
/***********************************************************************/

exports.userList = function (callback) {
    bdd.query('SELECT * FROM users', function(err, rows) {
//	console.log(rows);
	callback(rows);
    });
}

exports.userListByFilter = function (filter, callback) {
//    console.log("filter is", filter)
    query = 'SELECT id, pseudo, email, fullName, isAdmin, studentNumber, institution, promotion, courseID FROM '+
	( "users LEFT OUTER JOIN (SELECT * FROM subscription WHERE `courseID` = ? ) subs ON `users`.`id` = `subs`.`userID`")+
	' WHERE 1=1 '+
	(filter.name ? " AND fullName LIKE ?" : "") +
	(filter.n_etu ? " AND studentNumber = ?" : "") +
	(filter.promotion ? " AND promotion = ?" : "") +
	(filter.institution ? " AND institution = ?" : "") ;
    param = [filter.courseID ? filter.courseID : -1]
    if(filter.name)
	param.push("%"+filter.name+"%");
    if(filter.n_etu)
	param.push(filter.n_etu);
    if(filter.promotion)
	param.push(filter.promotion);
    if(filter.institution)
	param.push(filter.institution);
    bdd.query(query, param, function(err, rows) {
//	console.log(this.sql);
//	console.log(err, rows);
	callback(err, rows);
    });
}

/***********************************************************************/
/*       Getters pour les users : individu                             */
/***********************************************************************/

exports.userByID = function (userID, callback) {
    bdd.query('SELECT * FROM users WHERE id = ?', [userID],  function(err, rows) {
//	console.log(rows);
	callback(rows);
    });
}

/***********************************************************************/
/*       Gestion CRUD des user                                         */
/***********************************************************************/

// Create

exports.create = function (user, callback) {
    bcrypt.hash(user.password, saltRounds, function(err, hash) {
	bdd.query('INSERT INTO `users`(`pseudo`, `password`, `email`, `fullName`, `isAdmin`, `promotion`, `studentNumber`, `institution`) VALUES (?, ?, ?, ?, ?,?,?,?)', [user.pseudo, hash, user.email, user.nomComplet, user.adminPassword == config.ADMINPASSWD, user.promotion, user.n_etu, user.institution ], function(err, rows) {
	    //	    console.log(rows);
	    console.log(err);
	    callback(err,rows);
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
