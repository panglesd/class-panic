var roomID;
//var socketAdmin = io.connect('http://192.168.0.12:3000/admin');
//var socketAdmin = io.connect('http://localhost:3000/admin');
var socketCC = io.connect(server+'/ccAdmin');
var currentQuestion = {};
var currentStudent;
var currentStudentList;
var currentList;
var currentSubmission;
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
    socketCC.emit("sendStudentList", roomID);
});

/*********************************************************************/
/*                 lorsque l'on veut changer de question             */
/*********************************************************************/

function changeQuestionPlease() {
    socketCC.emit("changeToQuestion", roomID, currentQuestion.indexSet+1);
}

/*********************************************************************/
/*                 lorsque l'on veut aller à une question donnée     */
/*********************************************************************/

function gotoQuestion(i) {
//    socketCC.emit("changeToQuestion", roomID, i);
    currentQuestion = currentList[i];
    socketCC.emit("sendStudentList", roomID);
}

/*********************************************************************/
/*                 demander une submission en particulier            */
/*********************************************************************/

function sendSubmission() {
    console.log("sendSubmission");
    socketCC.emit("sendAnswer", roomID, currentStudent.userID, currentQuestion.id);
}
function sendQuestion() {
    console.log("sendQuestion");
    socketCC.emit("sendQuestion", roomID, currentStudent.userID, currentQuestion.indexSet);
}

/*********************************************************************/
/*                 Modifier une validity d'une answer                */
/*********************************************************************/

function setValidity(i, validity) {
    socketCC.emit("setValidity", roomID, currentStudent.userID, currentQuestion.id, i, validity);
}

function setCustomComment(i, customComment) {
    socketCC.emit("setCustomComment", roomID, currentStudent.userID, currentQuestion.id, i, customComment);
}


function setGlobalGrade(i) {
	socketCC.emit("setGlobalGrade", roomID, currentStudent.userID, currentQuestion.id, i);
}

function gradeCriteria(i, grade) {
    socketCC.emit("gradeCriteria", roomID, currentStudent.userID, currentQuestion.id, i, grade);
}

function setGlobalComment(comment) {
    socketCC.emit("setGlobalComment", roomID, currentStudent.userID, currentQuestion.id, comment);
}
function setAutoCorrect() {
	socketCC.emit("setAutoCorrect", roomID, currentStudent.userID, currentQuestion.id);
}


/*********************************************************************/
/*                 lorsque l'on reçoit la liste des question         */
/*********************************************************************/


socketCC.on('newList', function (questionList) {
    affQuestionList(questionList);
    if(!currentQuestion.id)
	currentQuestion = currentList[0];
    sendQuestion();
//    sendSubmission();
});


/*********************************************************************/
/*                 Lors de la reception d'une question               */
/*********************************************************************/

socketCC.on('newQuestion', function (question) {
    console.log("question = ", question);
    currentQuestion = question;
    let notTheSame = typeof currentQuestion == "undefined";
    // notTheSame = notTheSame || !document.querySelector("#question");
    // notTheSame = notTheSame || document.querySelector("#question").getAttribute("questionID") != question.id;
    let enonce = document.querySelector("#question");
    if(!(enonce && enonce.getAttribute("questionID") == question.id)) {
	afficheQuestion(question);
	addAdminInterface(question, setValidity, setGlobalGrade, setAutoCorrect, gradeCriteria, setGlobalComment);
    }
    sendSubmission();
});
/*********************************************************************/
/*                 Lors de la reception d'une soumission             */
/*********************************************************************/

socketCC.on('newSubmission', function (submission) {
    // submission.customQuestion = JSON.parse(submission.customQuestion);
    // submission.response = JSON.parse(submission.response);
    // submission.customQuestion.allResponses = submission.customQuestion.reponses;
    console.log("submission = ", submission);
    currentSubmission = submission;
    currentQuestion.submission = submission;
    // let notTheSame = typeof currentQuestion == "undefined";
    // notTheSame = notTheSame || !document.querySelector("#question");
    // notTheSame = notTheSame || document.querySelector("#question").getAttribute("questionID") != submission.customQuestion.id;
    // if(notTheSame) {
    // 	afficheQuestion(submission.customQuestion);
    // 	addAdminInterface(submission.customQuestion, setValidity, setStrategy);
    // }
    afficheSubmission(submission);
});

/*********************************************************************/
/*                 Lors de la reception d'une userList               */
/*********************************************************************/

socketCC.on('newUserList', function (studentList) {
    let ul = document.createElement("ul");
    ul.id = "chooseSFromSet";
    ul.innerHTML = '<li id="chooseStudentNext"> Choisir l\'élève à corriger :</li>';
    studentList.forEach(function (student, index) {
	let li = document.createElement("li");
	li.id = "s-" + student.id;
	li.classList.add("s-");
	li.textContent = student.fullName;
	li.onclick = (ev) => {
	    currentStudent = currentStudentList[index];
	    // On s'occupe du carré blanc
	    let temp;
	    if((temp = document.querySelector("#chooseSFromSet li.currentStudent"))) {
		temp.classList.remove("currentStudent");
	    }
	    if(document.querySelector("li#s-"+currentStudent.id))
		document.querySelector("li#s-"+currentStudent.id).classList.add("currentStudent");
	    socketCC.emit("sendStudentList", roomID);
	};
//	MathJax.Hub.Queue(["Typeset",MathJax.Hub,li]);
	ul.appendChild(li);
    });
    let old = document.querySelector("#chooseSFromSet");
	old.parentNode.replaceChild(ul,old);
    // Dans tous les cas, on refait le check des petites marques blanches
    document.querySelectorAll(".s-").forEach((elem, index) => {
	if(studentList[index].grade != "unknown")
	    elem.textContent += " : " + (Math.round(studentList[index].grade*20*4)/4)+"/20";
	//	else
	//	    elem.classList.remove("answered");
    });
    //	document.querySelector(".currentQuestion").classList.remove("currentQuestion");
    //	document.querySelector("#q-"+currentQuestionOfCC.id).classList.add("currentQuestion");
    currentStudentList = studentList;
    if(!currentStudent) {
	currentStudent = studentList[0];
    }
    document.querySelector("li#s-"+currentStudent.id).classList.add("currentStudent");
    socketCC.emit("sendList", roomID, currentStudent.userID);
});
