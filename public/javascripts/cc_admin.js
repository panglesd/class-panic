var roomID;
//var socketAdmin = io.connect('http://192.168.0.12:3000/admin');
//var socketAdmin = io.connect('http://localhost:3000/admin');
var socketCC = io.connect(server+'/ccAdmin');
var currentQuestionOfCC;
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
    socketCC.emit("changeToQuestion", roomID, currentQuestionOfCC.indexSet+1);
}

/*********************************************************************/
/*                 lorsque l'on veut aller à une question donnée     */
/*********************************************************************/

function gotoQuestion(i) {
    socketCC.emit("changeToQuestion", roomID, i);
}

/*********************************************************************/
/*                 demander une submission en particulier            */
/*********************************************************************/

function sendSubmission() {
    socketCC.emit("sendAnswer", roomID, currentStudent.userID, currentQuestionOfCC.id);
}

/*********************************************************************/
/*                 Modifier une validity d'une answer                */
/*********************************************************************/

function setValidity(i, validity) {
    socketCC.emit("setValidity", roomID, currentStudent.userID, currentQuestionOfCC.id, i, validity);
}
function setStrategy() {
    console.log("setStrategy is on!");
    let strategy = document.querySelector("#strategy").value;
    if(strategy == "manual") {
	let val = parseFloat(document.querySelector("#mark").value);
	val = Math.max(-1, val);
	val = Math.min(1, val);
	/*console.log("val is", val);*/
	socketCC.emit("setStrategy", roomID, currentStudent.userID, currentQuestionOfCC.id, strategy, val);
    }
    else
	socketCC.emit("setStrategy", roomID, currentStudent.userID, currentQuestionOfCC.id, strategy);
}

/*********************************************************************/
/*                 pour afficher une question                        */
/*********************************************************************/

function afficheResponse (reponse) {
    /*console.log('newQuestion');*/
    /*console.log(reponse);*/

    // On s'occupe du carré blanc
    let temp;
    if((temp = document.querySelector("#chooseQFromSet li.currentQuestion"))) {
	temp.classList.remove("currentQuestion");
    }
    if(document.querySelector("li#q-"+reponse.id))
	document.querySelector("li#q-"+reponse.id).classList.add("currentQuestion");

    // On stocke la question
    //    currentQuestionOfCC = reponse;

    // On écrit l'énoncé là où il faut. MathJax rendered.
    let enonce = document.querySelector("#question");
    enonce.textContent=reponse.enonce;
    MathJax.Hub.Queue(["Typeset",MathJax.Hub,enonce]);

    // On nettoie les réponses précédentes
    let wrapper = document.querySelector("#wrapperAnswer");
    while (wrapper.firstChild) {
	wrapper.removeChild(wrapper.firstChild);
    }

    // Si besoin est, on rajoute la description
    let descr = document.querySelector("#description");
    if(reponse.description)
	descr.style.visibility="visible";
    else
	descr.style.visibility="hidden";
    if(reponse.description)
	descr.innerHTML = md.render(reponse.description);
    else
	descr.textContent = reponse.description;
    MathJax.Hub.Queue(["Typeset",MathJax.Hub,descr]);

    // Pour chaque nouvelle réponse :

    reponse.allResponses.forEach(function (rep, index) {
	// Création de l'élément HTML vide
	let elem = document.createElement('div');
	elem.classList.add("reponse");
	elem.classList.add("notSelected");
	if(rep.validity)
	    elem.classList.add(rep.validity);
	elem.id = "r"+index;

	// Création de l'élément contenant l'énoncé de la réponse
	let span = document.createElement("span");
	elem.innerHTML = "";
	span.innerHTML = md.render(rep.reponse);
	console.log(span, rep.reponse);
	span.classList.add("markdown");
	elem.appendChild(span);
	// Si besoin, ajout d'un textarea
	if(rep.texted) {
	    let textarea = document.createElement("div");
	    textarea.style.width="100%";
	    textarea.style.display="block";
	    textarea.style.color = "green";
	    textarea.style.fontSize="medium";
	    if(rep.correction)
		textarea.textContent="Correction : "+rep.correction;
	    // Ajout d'un event listener pour le textarea
/*	    if(typeof isAdmin == "undefined") {
		textarea.addEventListener("input", (ev) => {
		    console.log("updateed");
		    chooseAnswer(index, elem, true);		    //updateAnswer(index, elem, true);
//		    sendAnswer();
		});
		}*/
	    elem.appendChild(textarea);
	}
	MathJax.Hub.Queue(["Typeset",MathJax.Hub,elem]);
	let button = document.createElement("button");
	button.addEventListener("click",(ev) => {
	    setValidity(index,"true");
	});
	let button2 = document.createElement("button");
	button2.addEventListener("click",(ev) => {
	    setValidity(index,"false");
	});
	button.textContent = "Forcer à juste";
	button2.textContent = "Forcer à faux";
	elem.appendChild(button);
	elem.appendChild(button2);
	wrapper.appendChild(elem);
    });
    let elem = document.createElement('div');
    elem.classList.add("reponse");
    elem.classList.add("notSelected");
    elem.innerHTML = "Stratégie de correction : <select id='strategy'>" +
	"<option value='all_or_0' "+("all_or_0"==reponse.strategy ? "selected>" : ">")+"all_or_0</option>"+
	"<option value='QCM' "+("QCM"==reponse.strategy ? "selected>" : ">")+"QCM</option>"+
	"<option value='manual' "+("manual"==reponse.strategy ? "selected>" : ">")+"manual</option>"+
	"</select>";
    if(reponse.strategy=="manual") {
//	elem.innerHTML += "<input type='number' id='mark' min='-1' max='1' step='0.05'>";
	let mark = document.createElement("input");
	mark.id="mark";
	mark.type = "number";
	mark.min="-1";
	mark.max="1";
	mark.value = "1";
	mark.step = "0.05";
	elem.appendChild(mark);
    }
    elem.innerHTML += "Note finale : <span id='note'>"+"N/A"+"</span>";
    let mark = elem.querySelector("#mark");
    if(mark) {
	mark.addEventListener("change", (ev) => {setStrategy();});
	mark.value = reponse.mark;
    }
    let select = elem.querySelector("select");
//    console.log("we add event listener for ", select);
    select.addEventListener("change", (ev) => {
//	console.log(ev, "updated");
	let mark = document.querySelector("#mark");
	if (select.value == "manual" && !mark) {
	    let mark = document.createElement("input");
	    mark.id="mark";
	    mark.type = "number";
	    mark.min="-1";
	    mark.max="1";
	    mark.value = "1";
	    mark.step = "0.05";
	    mark.value = 1;
	    mark.addEventListener("change", (ev) => {setStrategy();});
	    select.parentNode.insertBefore(mark, ev.target.nextSibling);
	}
	else if(mark) {
	    mark.parentNode.removeChild(mark);
	}
	setStrategy();
    });
    wrapper.appendChild(elem);
};

/*********************************************************************/
/*                 lorsque l'on reçoit la liste des question         */
/*********************************************************************/


socketCC.on('newList', function (questionList) {
//    console.log("questionList", questionList);
//    console.log("currentList", currentList);
    // On vérifie si quelque chose a changé dans les énoncés.
    let notTheSame = typeof currentList == "undefined";
    notTheSame = notTheSame || currentList.length != questionList.length;
    if(!notTheSame)
	questionList.forEach((question, index) => {
	    if(question.enonce != currentList[index].enonce)
		notTheSame = true;
	});
    currentList = questionList;
    // notTheSame vaut true ssi quelque chose a changé dans les énoncés. Si c'est le cas, on refait entièrement le menu
    if(notTheSame) {
	let ul = document.createElement("ul");
	ul.id = "chooseQFromSet";
	ul.innerHTML = '<li id="chooseQuestionNext"> Choisir la question suivante :</li>';
	questionList.forEach(function (question, index) {
//	    console.log(question);
	    let li = document.createElement("li");
	    li.id = "q-" + question.id;
	    li.classList.add("q-");
//	    if(question.id == currentQuestionOfCC.id)
//		li.classList.add("currentQuestion");
	    li.addEventListener("click", () => {
//		console.log("sdfggfeer");
		//		gotoQuestion(question.indexSet);
		currentQuestionOfCC = currentList[index];
		sendSubmission();
	    });
//	    li.class = ""+(question.id == currentQuestionOfCC.id);
	    li.textContent = question.enonce;
	    MathJax.Hub.Queue(["Typeset",MathJax.Hub,li]);
	    ul.appendChild(li);
	});
	let old = document.querySelector("#chooseQFromSet");
	old.parentNode.replaceChild(ul,old);
    }
    // Dans tous les cas, on refait le check des petites marques blanches
    document.querySelectorAll(".q-").forEach((elem, index) => {
	if(questionList[index].correct != "unknown")
	    elem.classList.add("answered");
	else
	    elem.classList.remove("answered");
    });
    if(!currentQuestionOfCC)
	currentQuestionOfCC = currentList[0];
//    console.log("currentQuestionOfCC = ", currentQuestionOfCC);
    sendSubmission();
});

/*********************************************************************/
/*                 pour afficher une question                        */
/*********************************************************************/

function affSubmission(submission) {
    JSON.parse(submission.response).forEach((rep) => {
//	console.log("rep = ", rep);
	let repElem = document.querySelector("#r"+rep.n);
	repElem.classList.replace("notSelected","selected");
	if(submission.customQuestion.allResponses[rep.n].texted) {
	    let textarea = document.createElement("textarea");
	    textarea.style.width="100%";
	    textarea.readOnly = true;
	    textarea.style.display="block";
	    textarea.textContent=rep.text;
	    repElem.insertBefore(textarea,repElem.querySelector("div").nextSibling);
	}
    });
    document.querySelector("#note").textContent = submission.correct+"/1";
}

/*********************************************************************/
/*                 Lors de la reception d'une soumission             */
/*********************************************************************/

socketCC.on('newSubmission', function (submission) {
//    console.log("submission = ", submission);
    submission.customQuestion = JSON.parse(submission.customQuestion);
    submission.customQuestion.allResponses = submission.customQuestion.reponses;
    currentSubmission = submission;
    afficheResponse(submission.customQuestion);
    affSubmission(submission);
});

/*********************************************************************/
/*                 Lors de la reception d'une soumission             */
/*********************************************************************/

socketCC.on('newUserList', function (studentList) {
//    console.log("studentList = ", studentList);
    let ul = document.createElement("ul");
    ul.id = "chooseSFromSet";
    ul.innerHTML = '<li id="chooseStudentNext"> Choisir l\'élève à corriger :</li>';
    studentList.forEach(function (student, index) {
//	console.log(student);
	let li = document.createElement("li");
	li.id = "s-" + student.id;
	li.classList.add("s-");
	li.textContent = student.fullName;
	li.onclick = (ev) => {
	    currentStudent = currentStudentList[index];
	    // On s'occupe du carré blanc
	    let temp;
	    if((temp = document.querySelector("#chooseSFromSet li.currentQuestion"))) {
		temp.classList.remove("currentQuestion");
	    }
	    if(document.querySelector("li#s-"+currentStudent.id))
		document.querySelector("li#s-"+currentStudent.id).classList.add("currentQuestion");
	    socketCC.emit("sendList", roomID, currentStudent.userID);
	    sendSubmission();
	};
	MathJax.Hub.Queue(["Typeset",MathJax.Hub,li]);
	ul.appendChild(li);
    });
    let old = document.querySelector("#chooseSFromSet");
	old.parentNode.replaceChild(ul,old);
    // Dans tous les cas, on refait le check des petites marques blanches
    document.querySelectorAll(".s-").forEach((elem, index) => {
	//	if(studentList[index].questionID)
	//	    elem.classList.add("answered");
	//	else
	//	    elem.classList.remove("answered");
    });
    //	console.log("iiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii");
    //	document.querySelector(".currentQuestion").classList.remove("currentQuestion");
    //	console.log(currentQuestionOfCC.id);
    //	document.querySelector("#q-"+currentQuestionOfCC.id).classList.add("currentQuestion");
    currentStudentList = studentList;
    if(!currentStudent) {
	currentStudent = studentList[0];
    }
//    console.log("doit");
    document.querySelector("li#s-"+currentStudent.id).classList.add("currentQuestion");
//    console.log('document.querySelecto = ', document.querySelector("li#s-"+currentStudent.id).classList);
//    console.log("studentList[0].userID = ", studentList[0].userID);
    console.log("callling sendList");
    socketCC.emit("sendList", roomID, currentStudent.userID);
});
