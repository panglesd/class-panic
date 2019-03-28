var fs = require("fs");
var mkdirp = require("mkdirp");
var config = require("./../configuration");
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
	
	let path = config.STORAGEPATH+"/course"+courseID+"/doc"+docID+"/";
	mkdirp(path, (err) => {
	    mainFile.mv(path+sanit_fn(mainFile.name), (err) => {
		async.forEach(files, (file, callback) => {
		    if(file) {
			file.mv(path+sanit_fn(file.name), callback);
		    }
		    else
			callback();
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
exports.getFileFromDoc = function(doc, fileName, callback) {
    if(doc.filesInfo.main == fileName || doc.filesInfo.aux.includes(fileName)) {
	let path = config.STORAGEPATH+"/course"+doc.courseID+"/doc"+doc.id+"/"+fileName;
	fs.readFile(path, callback);
    }
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

exports.remove = function(docID, callback) {
    let query = "DELETE FROM documents WHERE id = ?";
    let params = [docID];
    bdd.query(query, params, callback);
};

exports.removeFile = function(doc, fileName, callback) {
    let query = "UPDATE documents SET filesInfo = ? WHERE id = ?";
    doc.filesInfo.aux = doc.filesInfo.aux.filter((elem) => {return fileName != elem;});
    let params = [JSON.stringify(doc.filesInfo), doc.id];
    bdd.query(query, params, callback);
};

exports.addFile = function(doc, files, callback) {
    //    let fileName = file.name;
    files.forEach((file) => {
	doc.filesInfo.aux = doc.filesInfo.aux.filter((elem) => {return file.name != elem;});
	doc.filesInfo.aux.push(file.name);
    });
//    files;
    let path = config.STORAGEPATH+"/course"+doc.courseID+"/doc"+doc.id+"/";
    async.forEach(files, (file, callback) => {
	file.mv(path+sanit_fn(file.name), callback);//(err) => {
    }, (err) => {
	let params = [JSON.stringify(doc.filesInfo), doc.id];
	let query = "UPDATE documents SET filesInfo = ? WHERE id = ?";
	bdd.query(query, params, callback);
    });
};
