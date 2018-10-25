//var socketAdmin = io.connect('http://192.168.0.12:3000/admin');
//var socketAdmin = io.connect('http://localhost:3000/admin');
var socketCC = io.connect(server+'/cc');
let currentQuestionOfAdmin;
var currentQuestionOfStudent;
var currentQuestionOfCC;
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
    socketCC.emit("changeQuestionPlease");
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

function revealResults() {
    socketCC.emit("revealResults");
}

/*********************************************************************/
/*                 lorsque l'on veut aller à une question donnée     */
/*********************************************************************/

function gotoQuestion(i) {
    socketCC.emit("changeToQuestion", i);
}

/*********************************************************************/
/*                 lorsque l'on reçoit les nouvelles statistiques    */
/*********************************************************************/

socketCC.on('newStats', function (newStats) {
    console.log(newStats);
    let ula = document.createElement("ul");
    ula.innerHTML = '<li style="font-family: Impact, \'Arial Black\', Arial, Verdana, sans-serif;"> Ce qu\'en disent les élèves : </li>';
    newStats.forEach(function (stat) {
	let li = document.createElement("li");
	//li.id = stat.id;
	li.innerHTML = '<div style="display:flex; justify-content: space-between;"></div>';
	li.firstChild.innerText = stat.fullName;
	ula.appendChild(li);
	let ul = document.createElement("ul");
	li.appendChild(ul);
	JSON.parse(stat.response).forEach((ans) => {
	    let li = document.createElement("li");
	    let color="white";
	    console.log("ans is", ans);
	    if(ans.n>=0) {
		if(currentQuestionOfAdmin.reponses[ans.n].validity == "true") 
		    color="green";
		else if(currentQuestionOfAdmin.reponses[ans.n].validity == "false") 
		    color="red";
		ans.response2 = currentQuestionOfAdmin.reponses[ans.n].reponse;
	    }
	    else 
		ans.response2 = "?";
	    li.innerHTML = '<div style="display:flex; justify-content: space-between;color:'+color+';"> '+/*stat.pseudo*//*stat.fullName+*/' <span>'+ans.response2+' '+ans.text+'</span></div>';
	    MathJax.Hub.Queue(["Typeset",MathJax.Hub,li]);
	    li.onclick = ((ev) => {console.log(ans);gotoQuestion(ans.indexSet);});
	    ul.appendChild(li);
	    console.log(ul);
	});
	console.log(li);
    });
    document.querySelector("#stats ul").innerHTML = ula.innerHTML;
    document.querySelector(".window").innerHTML = document.querySelector("#stats").outerHTML;
});

/*********************************************************************/
/*                 lorsque l'on reçoit une nouvelle question (admin) */
/*********************************************************************/

socketCC.on('newQuestion', function (reponse) {
    console.log('newQuestion');
    console.log(reponse);
    currentQuestionOfAdmin=reponse;
    currentQuestionOfCC=reponse;
    // On s'occupe du carré blanc
    let temp;
    if((temp = document.querySelector("li.currentQuestion"))) {
	temp.classList.remove("currentQuestion");
    }
    if(document.querySelector("li#q-"+reponse.id))
	document.querySelector("li#q-"+reponse.id).classList.add("currentQuestion");

    // On stocke la question
    currentQuestionOfCC = reponse;

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
	descr.innerHTML = reponse.description;
    MathJax.Hub.Queue(["Typeset",MathJax.Hub,descr]);

    // Pour chaque nouvelle réponse :

    reponse.allResponses.forEach(function (rep, index) {
	// Création de l'élément HTML vide
	let elem = document.createElement('div');
	elem.classList.add("reponse");
	elem.classList.add("notSelected");
//	if(rep.validity)
//	    elem.classList.add(rep.validity);
	elem.id = "r"+index;

	// Si besoin est, ajout d'un event listener
	elem.addEventListener("click", function (ev) {
	    //		chooseAnswer(index, event.currentTarget);
	    if(ev.target.tagName != "TEXTAREA")
		chooseAnswer(index, elem, false);
	    else
		chooseAnswer(index, elem, true);		    //updateAnswer(index, elem, true);
	});
	// Création de l'élément contenant l'énoncé de la réponse
	let span = document.createElement("span");
	elem.innerHTML = "";
	span.innerHTML = md.render(rep.reponse);
	console.log(span, rep.reponse);
	span.classList.add("markdown");
	elem.appendChild(span);
	// Si besoin, ajout d'un textarea
	if(rep.texted) {
	    let textarea = document.createElement("textarea");
	    textarea.style.width="100%";
	    textarea.style.display="block";
	    if(rep.correction)
		textarea.textContent=rep.correction;
	    // Ajout d'un event listener pour le textarea
	    if(typeof isAdmin == "undefined") {
		textarea.addEventListener("input", (ev) => {
		    console.log("updateed");
		    chooseAnswer(index, elem, true);		    //updateAnswer(index, elem, true);
//		    sendAnswer();
		});
	    }
	    elem.appendChild(textarea);
	}
	MathJax.Hub.Queue(["Typeset",MathJax.Hub,elem]);
	wrapper.appendChild(elem);
    });
    if(reponse.userResponse)
	reponse.userResponse.forEach((ans) => {
	    let temp = document.querySelectorAll("#wrapperAnswer .reponse")[ans.n];
	    temp.classList.remove("notSelected");
	    temp.classList.add("selected");
	    ta = temp.querySelector("textarea");
	    if(ta)
		ta.value = ans.text;
	});


    socketCC.emit("sendList");
});

/*********************************************************************/
/*                 lorsque l'on reçoit la liste des question         */
/*********************************************************************/

socketCC.on('newList', function (questionList) {
    console.log("questionList", questionList);
    console.log("currentList", currentList);
    if(!currentList) {
	currentList = questionList;
	let container = document.querySelector("#qWrapper");
	questionList.forEach((question) => {
	    console.log(question);
	});
	let ul = document.createElement("ul");
	ul.id = "chooseQFromSet";
	ul.innerHTML = '<li id="chooseQuestionNext"> Choisir la question suivante :</li>';
	questionList.forEach(function (question, index) {
	    console.log(question);
	    let li = document.createElement("li");
	    li.id = "q-" + question.id;
	    li.classList.add("q-");
	    if(question.questionID)
		li.classList.add("answered");
	    if(question.id == currentQuestionOfCC.id)
		li.classList.add("currentQuestion");
	    li.addEventListener("click", () => { console.log("sdfggfeer");gotoQuestion(question.indexSet); });
	    li.class = ""+(question.id == currentQuestionOfCC.id);
	    li.textContent = question.enonce;
	    MathJax.Hub.Queue(["Typeset",MathJax.Hub,li]);
	    ul.appendChild(li);
	});
	let old = document.querySelector("#chooseQFromSet");
	old.parentNode.replaceChild(ul,old);
    }
    else {
//	console.log("iiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii");
//	document.querySelector(".currentQuestion").classList.remove("currentQuestion");
//	console.log(currentQuestionOfCC.id);
//	document.querySelector("#q-"+currentQuestionOfCC.id).classList.add("currentQuestion");
    }
});

/*********************************************************************/
/*                 pour envoyer son choix de reponse                 */
/*********************************************************************/

function chooseAnswer(i, elem, update) {
    if(currentQuestionOfCC.type!="multi") {
	var reponse=document.querySelector(".reponse.selected");
	if(reponse) {
	    reponse.classList.replace('selected', 'notSelected');
	};
	if(i>-1) {
	    let a = document.querySelector("#r"+i);
	    a.classList.replace("notSelected", "selected");
	}
    }
    else {
	let a = document.querySelector("#r"+i);
	if(update) {
	    a.classList.remove("notSelected");
	    a.classList.add("selected");
	}
	else {
	    a.classList.toggle("notSelected");
	    a.classList.toggle("selected");
	}
    }
    sendAnswer();
}

function sendAnswer() {
    let reponses = [];
    document.querySelectorAll(".reponse.selected").forEach((elem) => {
	let atom = {};
	atom.n = parseInt(elem.id.split("r")[1]);
	let textarea = elem.querySelector("textarea");
	atom.text = textarea ? textarea.value : "";
	reponses.push(atom);
    });
    socketCC.emit("chosenAnswer", reponses);
}

