var User = require('../models/user');
var Course = require('../models/course');
var Room = require('../models/room');
var Set = require('../models/set');
var config = require('../configuration');
var async = require('async');

const fs = require('fs');

/*************************************************************/
/*         Controlleurs GET pour les docs                    */
/*************************************************************/

// User Space

// Afficher la liste des cours

exports.doc_list = function(req, res) {
    async.parallel(
	{
	    title : function(callback) { callback(null, "Big Sister: ... une salle")},
	    config : function(callback) { callback(null, config); },	
	    user : function (callback) {
		callback(null, req.session.user);
	    },
	    docs : function(callback) {
		callback(null, [{
		    id: 0,
		    name: "Cours 1"
		}, {
		    id: 1,
		    name: "TP 1"
		}, {
		    id: 2,
		    name: "Cours 2"
		}, {
		    id: 3,
		    name: "TP 2"
		}]);
	    },
	    subscription: function(callback) {
		callback(null, req.subscription);
	    },
	    course :  function (callback) {
		callback(null, req.course);
	    },
	    students :  function (callback) {
		Course.students(req.course.id, (err, res) => {/*if(err) console.log(err);*/ callback(err, res)});
	    },
	    msgs : function(callback) {
		callback(null, "");
	    },
	},
	function (err, results) {
	    console.log(results);
	    res.render('manage_docs', results);
	});
};

let table_doc = [
    "/home/panglesd/coursphp.pdf",
    "/home/panglesd/coursphp2.pdf",
    "/home/panglesd/coursphp3.pdf",
    "/home/panglesd/coursphp5.pdf",    
];
function serveFile(req, res, path) {
    fs.readFile(path, (err, data) => {
	res.setHeader('Content-type','application/pdf');
	res.end(data);
    });    
}

exports.doc_get = function (req, res) {
    let docID = req.params.docID;
    let path = table_doc[docID];
    serveFile(res, res, path);
};
