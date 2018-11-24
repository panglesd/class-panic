var fs = require("fs");
var mkdirp = require("mkdirp");
var sanit_fn = require("sanitize-filename");
var md5File = require("md5-file");
var async = require("async");

var bdd = require("./bdd");

let formatFiles = function(main, files) {
    let ret = {};
    ret.aux = files.map((file)=> {return file.name;});
    ret.main = main.name;
    return ret;
};

exports.create = function(mainFile, files, courseID, ownerID, callback) {
    let query = "INSERT INTO documents(courseID, ownerID, filesInfo) VALUES (?, ?, ?); SELECT LAST_INSERT_ID() as id;";
    let params = [courseID, ownerID, JSON.stringify(formatFiles(mainFile, files))];
    bdd.query(query, params, (err, resID) => {
	let docID = resID[1][0].id;
	console.log("docID = ", docID);
	
	let path = "storage/course"+courseID+"/doc"+docID+"/";
	mkdirp(path, (err) => {
	    mainFile.mv(path+sanit_fn(mainFile.name), (err) => {
		async.forEach(files, (file, callback) => {
		    file.mv(path+sanit_fn(file.name), callback);
		}, callback);
	    });
	});
    });
};



// CRUD

exports.getByID = function(docID, callback) {
    let query = "SELECT * FROM documents WHERE id = ?";
    let params = [docID];
    bdd.query(query, params, (err, res) => {
	let doc = res[0];
	if(doc) {
	    doc.filesInfo = JSON.parse(doc.filesInfo);
	}
	callback(err, doc);
    });
};
exports.getListByCourseID = function(courseID, callback) {
    let query = "SELECT * FROM documents WHERE courseID = ?";
    let params = [courseID];
    bdd.query(query, params, (err, res) => {
	res.forEach((doc) => {
	    doc.filesInfo = JSON.parse(doc.filesInfo);
	});
	callback(err, res);
    });
};
