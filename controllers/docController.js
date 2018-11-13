var User = require('../models/user');
var Course = require('../models/course');
var Room = require('../models/room');
var Set = require('../models/set');
var config = require('../configuration');
var async = require('async');

const fs = require('fs');
const path = require('path');
const mimeType = {
  '.ico': 'image/x-icon',
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.eot': 'appliaction/vnd.ms-fontobject',
  '.ttf': 'aplication/font-sfnt'
};

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

let prefix_doc = "/home/panglesd/storage/";
// [
//     "/home/panglesd/storage/cours1.pdf",
//     "/home/panglesd/storage/tp1.pdf",
//     "/home/panglesd/storage/cours2.pdf",
//     "/home/panglesd/storage/tp2.pdf",    
// ];
function serveFile(req, res, path, ext) {
    fs.readFile(path, (err, data) => {
	res.setHeader('Content-type', mimeType[ext] || 'text/plain' );
	res.end(data);
    });    
}

exports.doc_get = function (req, res) {
    let docID = req.params.docID;
    if(!["tp1.pdf", "tp2.pdf", "cours1.pdf", "cours2.pdf", "style.css"].includes(docID))
	docID="cours1.pdf";
    let pathname= prefix_doc+docID;
    let ext = path.parse(pathname).ext;
    serveFile(res, res, pathname, ext);
};
