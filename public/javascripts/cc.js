
//var socketAdmin = io.connect('http://192.168.0.12:3000/admin');
//var socketAdmin = io.connect('http://localhost:3000/admin');
var socketCC = io.connect(server+'/cc');
var currentQuestion;
var currentList;
var md = new markdownit({
    html:         false,        // Enable HTML tags in source
    xhtmlOut:     false,        // Use '/' to close single tags (<br />)
    breaks:       false,        // Convert '\n' in paragraphs into <br>
    langPrefix:   'language-',  // CSS language prefix for fenced blocks
    linkify:      true,         // autoconvert URL-like texts to links
    linkTarget:   '',           // set target to open link in
    
    // Enable some language-neutral replacements + quotes beautification
    typographer:  false,
    
    // Double + single quotes replacement pairs, when typographer enabled,
    // and smartquotes on. Set doubles to '«»' for Russian, '„“' for German.
    quotes: '“”‘’',
    
    // Highlighter function. Should return escaped HTML,
    // or '' if input not changed
    highlight: function (str, lang) {
	if (lang && hljs.getLanguage(lang)) {
	    try {
		return hljs.highlight(lang, str).value;
	    } catch (__) {}
	}
	
	try {
	    return hljs.highlightAuto(str).value;
	} catch (__) {}
	
	return ''; // use external default escaping
    }
});

md.use(markdownitMathjax());


/*********************************************************************/
/*                 Actions à effectuer à toute connection            */
/*********************************************************************/

// On informe le serveur dans quel room on est
socketCC.on('connect', () => {
    socketCC.emit("chooseRoom", roomID);
});

/*********************************************************************/
/*                 lorsque l'on veut changer de question             */
/*********************************************************************/

function changeQuestionPlease() {
    socketCC.emit("changeToQuestion", currentQuestion.indexSet+1);
}

/*********************************************************************/
/*                 pour redemander d'envoyer la question             */
/*********************************************************************/

function sendOwnedQuestionPlease() {
    socketCC.emit("sendQuestionPlease");
}

/*********************************************************************/
/*                 lorsque l'on veut reveler les resultats           */
/*********************************************************************/

/*function revealResults() {
    socketCC.emit("revealResults");
}
*/

/*********************************************************************/
/*                 lorsque l'on veut aller à une question donnée     */
/*********************************************************************/

function gotoQuestion(i) {
    socketCC.emit("changeToQuestion", i);
}

/*********************************************************************/
/*                 lorsque l'on reçoit les nouvelles statistiques    */
/*********************************************************************/

// socketCC.on('newStats', function (newStats) {
//     console.log(newStats);
//     let ula = document.createElement("ul");
//     ula.innerHTML = '<li style="font-family: Impact, \'Arial Black\', Arial, Verdana, sans-serif;"> Ce qu\'en disent les élèves : </li>';
//     newStats.forEach(function (stat) {
// 	let li = document.createElement("li");
// 	//li.id = stat.id;
// 	li.innerHTML = '<div style="display:flex; justify-content: space-between;"></div>';
// 	li.firstChild.innerText = stat.fullName;
// 	ula.appendChild(li);
// 	let ul = document.createElement("ul");
// 	li.appendChild(ul);
// 	JSON.parse(stat.response).forEach((ans) => {
// 	    let li = document.createElement("li");
// 	    let color="white";
// 	    console.log("ans is", ans);
// 	    if(ans.n>=0) {
// 		if(currentQuestionOfAdmin.reponses[ans.n].validity == "true") 
// 		    color="green";
// 		else if(currentQuestionOfAdmin.reponses[ans.n].validity == "false") 
// 		    color="red";
// 		ans.response2 = currentQuestionOfAdmin.reponses[ans.n].reponse;
// 	    }
// 	    else 
// 		ans.response2 = "?";
// 	    li.innerHTML = '<div style="display:flex; justify-content: space-between;color:'+color+';"> '+/*stat.pseudo*//*stat.fullName+*/' <span>'+ans.response2+' '+ans.text+'</span></div>';
// 	    MathJax.Hub.Queue(["Typeset",MathJax.Hub,li]);
// 	    li.onclick = ((ev) => {console.log(ans);gotoQuestion(ans.indexSet);});
// 	    ul.appendChild(li);
// 	    console.log(ul);
// 	});
// 	console.log(li);
//     });
//     document.querySelector("#stats ul").innerHTML = ula.innerHTML;
//     document.querySelector(".window").innerHTML = document.querySelector("#stats").outerHTML;
// });

/*********************************************************************/
/*                 lorsque l'on reçoit une nouvelle question         */
/*********************************************************************/

socketCC.on('newQuestion', function (reponse) {
//    console.log('newQuestion');
    console.log("newQuestion", reponse);
//    currentQuestionOfAdmin=reponse;
    currentQuestion=reponse;
//    currentQuestion.fileInfo = JSON.parse(currentQuestion.fileInfo);

    //let temp2 = reponse.submission.response;
    afficheQuestion(reponse);
    afficheSubmission(reponse.submission);
    socketCC.emit("sendCorrection", currentQuestion.id);
    socketCC.emit("sendList");
});

/*********************************************************************/
/*                 lorsqu'un fichier a été reçu                      */
/*********************************************************************/

socketCC.on("fileReceived", (n_ans, fileName, hash) => {
    console.log("fileReceived with : ", n_ans, fileName, hash);
    let elemReponse = document.querySelectorAll("#wrapperAnswer .reponse")[n_ans];
    affFileInfo(elemReponse, {fileName: fileName, hash: hash, timestamp: Date.now()}, n_ans);
    sendAnswer();    
});

/*********************************************************************/
/*                 lorsque l'on reçoit la liste des question         */
/*********************************************************************/

socketCC.on('newList', function (questionList) {
    affQuestionList(questionList);
});

/*********************************************************************/
/*                 Pour envoyer son choix de réponses                */
/*********************************************************************/

function chooseAnswer(i) {
    let chosenAnswer = currentQuestion.reponses[i];
    console.log(chosenAnswer);
    // Dans le cas où seul le clic détermine si question est selectionnée, (pas de fichier/textarea)
    if(!chosenAnswer.texted && !(chosenAnswer.hasFile == true || ["single","multi","true"].includes(chosenAnswer.hasFile))) {
	console.log("clic-determined");
	if(currentQuestion.type!="multi") {
	    var reponse=document.querySelector(".reponse.selected");
	    if(reponse)
		reponse.classList.replace('selected', 'notSelected');
	    if(i>-1) {
		let a = document.querySelector("#r"+i);
		a.classList.replace("notSelected", "selected");
	    }
	}
	else {
		let a = document.querySelector("#r"+i);
		a.classList.toggle("notSelected");	    
		a.classList.toggle("selected");	    
	}
    }
    else {
	console.log("content-determined");
	let elem = document.querySelector("#r"+i);
	let flag = false;
	let textarea = elem.querySelector("textarea");
	if(textarea && textarea.value)
	    flag = true;
	let file = elem.querySelector("a.fileName");
	if(file)
	    flag = true;
	if(flag) {
	    elem.classList.remove("notSelected");
	    elem.classList.add("selected");
	}
	else {
	    elem.classList.add("notSelected");
	    elem.classList.remove("selected");
	}
    }
    sendAnswer();
}

function sendAnswer() {
    let reponses = [];
//    document.querySelectorAll(".reponse.selected").forEach((elem) => {
    document.querySelectorAll(".reponse").forEach((elem) => {
	let atom = {};
	atom.selected = elem.classList.contains("selected");
//	let nQuestion = parseInt(elem.id.split("r")[1]);
	let textarea = elem.querySelector("textarea");
	atom.text = textarea ? textarea.value : "";
//	let fI = JSON.parse(elem.getAttribute("fileInfo"));
	atom.filesInfo = [];
//	reponses[nQuestion] = atom;
	reponses.push(atom);
    });
    console.log("reponse envoyées : ", reponses);
    socketCC.emit("chosenAnswer", reponses, currentQuestion.indexSet);
//    console.log("reponses, currentQuestion.indexSet = ", reponses, currentQuestion.indexSet);
}

/*********************************************************************/
/*                 Pour supprimer un fichier                         */
/*********************************************************************/

function removeFile(n_ans, fileName) {
    socketCC.emit("removeFile", n_ans, fileName, currentQuestion.indexSet);
}

function sendFile(fileName, index, set, data) {
    socketCC.emit("chosenFile", fileName, index, set, data);
}
