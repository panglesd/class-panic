var bdd = require("./bdd");
var async = require('async');


exports. getStats = function (filter, callback) {

    query = 'SELECT * FROM `stats` WHERE 1=1' +
	(filter.courseID ? " AND `roomID` IN (SELECT id FROM `rooms` WHERE courseID = ?) " : "") +
	(filter.userID ? " AND  AND userID = ? " : "") +
//	(filter.promotion ? " AND promotion = ?" : "") +
//	(filter.institution ? " AND institution = ?" : "") ;
    param = []
    if(filter.courseID)
	param.push("%"+filter.name+"%");
    if(filter.userID)
	param.push(filter.n_etu);
/*    if(filter.promotion)
	param.push(filter.promotion);
    if(filter.institution)
	param.push(filter.institution);*/
    bdd.query(query, param, function(err, rows) {
//	console.log(this.sql);
//	console.log(err, rows);
	callback(err, rows);
    });

}
