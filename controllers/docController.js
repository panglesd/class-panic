var User = require('../models/user');
var Course = require('../models/course');
var Room = require('../models/room');
var Set = require('../models/set');
var config = require('../configuration');
var async = require('async');
var Doc = require("../models/documents.js");
const fs = require('fs');
var sanit_fn = require("sanitize-filename");
var path = require("path");
// maps file extention to MIME types
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
const allMime = {
    '.aac': "audio/aac",
    '.abw' : "application/x-abiword",
    '.arc' : "application/octet-stream",
    '.avi' : "video/x-msvideo",
    '.azw' : "application/vnd.amazon.ebook",
    '.bin' : "application/octet-stream",
    '.bz' : "application/x-bzip",
    '.bz2' : "application/x-bzip2",
    '.csh' : "application/x-csh",
    '.css' : "text/css",
    '.csv' : "text/csv",
    '.doc' : "application/msword",
    '.docx' : "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    '.eot' : "application/vnd.ms-fontobject",
    '.epub' : "application/epub+zip",
    '.gif' : "image/gif",
    ".html": "text/plain",
    // ".html": "text/html",
    // ".htm": "text/html",
    ".ico": "image/x-icon",
    ".ics": "text/calendar",
    ".jar": "application/java-archive",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".js": "application/javascript",
    ".json": "application/json",
    ".mid": "audio/midi",
    ".midi": "audio/midi",
    ".mpeg": "video/mpeg",
    ".mpkg": "application/vnd.apple.installer+xml",
    ".odp": "application/vnd.oasis.opendocument.presentation",
    ".ods": "application/vnd.oasis.opendocument.spreadsheet",
    ".odt": "application/vnd.oasis.opendocument.text",
    ".oga": "audio/ogg",
    ".ogv": "video/ogg",
    ".ogx": "application/ogg",
    ".otf": "font/otf",
    ".php": "text/plain",
    ".png": "image/png",
    ".pdf": "application/pdf",
    ".ppt": "application/vnd.ms-powerpoint",
    ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ".rar": "application/x-rar-compressed",
    ".rtf": "application/rtf",
    ".sh": "application/x-sh",
    ".svg": "image/svg+xml",
    ".swf": "application/x-shockwave-flash",
    ".tar": "application/x-tar",
    ".tiff": "image/tiff",
    ".tif": "image/tiff",
    ".ts": "application/typescript",
    ".txt": "text/plain",
    ".ttf": "font/ttf",
    ".vsd": "application/vnd.visio",
    ".wav": "audio/x-wav",
    ".weba": "audio/webm",
    ".webm": "video/webm",
    ".webp": "image/webp",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
    ".xhtml": "application/xhtml+xml",
    ".xls": "application/vnd.ms-excel",
    ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ".xml": "application/xml",
    ".xul": "application/vnd.mozilla.xul+xml",
    ".zip": "application/zip",
    ".3gp": "video/3gpp",
    ".3g2": "video/3gpp2",
    ".7z": "application/x-7z-compressed",
    "": "application/octet-stream"
}


/*************************************************************/
/*         Controlleurs GET pour les docs                    */
/*************************************************************/

// User Space

// Afficher la liste des cours

exports.doc_list = function(req, res) {
    async.parallel(
	{
	    title : function(callback) { callback(null, "Big Sister: ... une salle");},
	    config : function(callback) { callback(null, config); },	
	    user : function (callback) {
		callback(null, req.session.user);
	    },
	    docs : function(callback) {
		Doc.getListByCourseID(req.course.id, callback);
		
		// callback(null, [{
		//     id: 0,
		//     name: "Cours 1"
		// }, {
		//     id: 1,
		//     name: "TP 1"
		// }, {
		//     id: 2,
		//     name: "Cours 2"
		// }, {
		//     id: 3,
		//     name: "TP 2"
		// }]);
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
	    console.log(results.docs);
	    res.render('manage_docs', results);
	});
};

// let table_doc = [
//     "/home/panglesd/coursphp.pdf",
//     "/home/panglesd/coursphp2.pdf",
//     "/home/panglesd/coursphp3.pdf",
//     "/home/panglesd/coursphp5.pdf",    
// ];

function serveFile(data, fileName, res) {
    let mime = allMime[path.extname(fileName)];
    if(!mime)
	mime = "application/octet-stream";
    res.setHeader('Content-type', mime);
//    console.log("yo");
    res.end(data);
}
exports.serveFile = serveFile;

exports.doc_get = function (req, res) {
    let docID = req.params.docID;
    let fileName = sanit_fn(req.params.name);
    let doc = req.doc;
    if (doc.courseID == req.course.id) {
	Doc.getFileFromDoc(doc, fileName, (err, file) => {
	    console.log(file);
	    serveFile(file, fileName, res);
	});
    }
    else
	res.redirect(config.PATH);
    //    let path = table_doc[docID];
};

exports.doc_add_post = function(req, res) {
    console.log("we add");
    if(!Array.isArray(req.files.aux)) {
	req.files.aux = req.files.aux ? [req.files.aux] : [];
    }
    Doc.create(req.files.main, req.files.aux, req.course.id, req.session.user.id, (err) => {
	console.log("finished adding");
	exports.doc_list(req, res);
    });
};

exports.remove = function(req, res) {
    console.log("iciiiii");
    if(req.subscription.canAddDocs)
	Doc.remove(req.doc.id, () => {res.redirect(config.PATH+"/course/"+req.course.id+"/doc");});
    else
	res.redirect(config.PATH);
};

exports.removeFile = function(req, res) {
    console.log("iciiiii2");
    if(req.subscription.canAddDocs)
	Doc.removeFile(req.doc, req.params.name, () => {res.redirect(config.PATH+"/course/"+req.course.id+"/doc");});
    else
	res.redirect(config.PATH);
};
exports.addFile = function(req, res) {
    console.log("iciiiii2");
    if(!Array.isArray(req.files.newFiles)) {
	req.files.newFiles = req.files.newFiles ? [req.files.newFiles] : [];
    }
    if(req.subscription.canAddDocs)
	Doc.addFile(req.doc, req.files.newFiles, () => {res.redirect(config.PATH+"/course/"+req.course.id+"/doc");});
    else
	res.redirect(config.PATH);
};
