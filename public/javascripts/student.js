//var socket = io.connect('http://192.168.0.12:3000/');
var socket = io.connect(server+"/student");
//var socket = io.connect('http://localhost:3000/');
var currentQuestionOfStudent;
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
socket.on('connect', () => {
    socket.emit("chooseRoom", roomID);
});

/*********************************************************************/
/*                 lorsque l'on reçoit une nouvelle question         */
/*********************************************************************/

// var sem = false;

socket.on('newQuestion', function (reponse, stats) {
    console.log(reponse);
    currentQuestionOfStudent=reponse;
    
    // On écrit l'énoncé là où il faut. MathJax rendered.
    enonce = document.querySelector("#question");
    enonce.textContent=reponse.enonce;
    MathJax.Hub.Queue(["Typeset",MathJax.Hub,enonce]);

    // On nettoie les réponses précédentes
    wrapper = document.querySelector("#wrapperAnswer");
    while (wrapper.firstChild) {
	wrapper.removeChild(wrapper.firstChild);
    }

    // Si besoin est, on rajoute la description
    descr = document.querySelector("#description");
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
    reponse.reponses.forEach(function (rep, index) {
	// Création de l'élément HTML vide
	elem = document.createElement('div');
	elem.classList.add("reponse");
	elem.classList.add("notSelected");
	if(rep.validity == "true") {
	    elem.classList.add("vrai")
	}
	if(rep.validity == "false") {
	    elem.classList.add("faux");
	}
	elem.id = "r"+index;

	// Si besoin est, ajout d'un event listener
	if(typeof isAdmin == "undefined")
	    elem.addEventListener("click", function (ev) {
		//		chooseAnswer(index, event.currentTarget);
		if(ev.target.tagName != "TEXTAREA")
		    chooseAnswer(index, elem);
		else
		    updateAnswer(index, elem);
	    });
	// Création de l'élément contenant l'énoncé de la réponse
	span = document.createElement("span");
	elem.innerHTML = "";
	span.innerHTML = md.render(rep.reponse);
	console.log(span, rep.reponse);
	span.classList.add("markdown");
	elem.appendChild(span)
	// Si besoin, ajout d'un textarea
	if(rep.texted) {
	    textarea = document.createElement("textarea");
	    textarea.style.width="100%"
	    textarea.style.display="block"
	    if(rep.correction)
		textarea.textContent=rep.correction
	    // Ajout d'un event listener pour le textarea
	    if(typeof isAdmin == "undefined") {
		textarea.addEventListener("input", (ev) => {
		    console.log("updateed");
		    sendAnswer();
		});
	    }
	    elem.appendChild(textarea);
	}
	MathJax.Hub.Queue(["Typeset",MathJax.Hub,elem]);
	wrapper.appendChild(elem);
    });
    // Si l'on nous a aussi envoyé les stats, on les affiche.
    console.log("stats", stats);
    if(stats) 
	showStats(stats);
});

/*********************************************************************/
/*                 lorsque l'on reçoit la correction                 */
/*********************************************************************/

//socket.on('correction', function (correction) {
showStats = function (stats) {
    console.log("stats", stats);
//    let total = 0;
    //stats.forEach(function (v) { total += v.count });
    let total = Math.max(stats.length,1);
    //total=Math.max(total,1);
    count=[];
    stats.forEach(function (v) {
	console.log("yoo", JSON.parse(v.answer))
	tab_rep_one_student = JSON.parse(v.answer)
	tab_rep_one_student.forEach((rep) => {
	    n_answer = rep.n
	    console.log("n_answer", n_answer);
	    if(count[n_answer])
		count[n_answer]++
	    else
		count[n_answer]=1
	});
    });
    console.log(count, total);
    count.forEach((c,i) => {
	document.querySelector("#r"+i).style.background =
	    "linear-gradient(to right, rgba(0,0,0,0.5) "+((0.+c)/total*100./*-5*/)+"%,#F5F5DC "+((0.+c)/total*100.)+"%)";	
    });
//	if(n_answer != -1) {
//	    console.log("#rep"+v.answer);
//	}
//    });
}//);

/*********************************************************************/
/*                 pour redemander d'envoyer la question             */
/*********************************************************************/

function sendQuestionPlease() {
    socket.emit("sendQuestionPlease");
}

/*********************************************************************/
/*                 pour envoyer son choix de reponse                 */
/*********************************************************************/

/*if(typeof isAdmin == "undefined") {
    let reponses=document.querySelectorAll(".reponse");
    for(let i=0; i<reponses.length ; i++) {
	reponses[i].addEventListener("click",chooseAnswer);
    };
}*/

function chooseAnswer(i, elem) {
    if(currentQuestionOfStudent.type!="multi") {
	var reponse=document.querySelector(".reponse.selected");
	if(reponse) {
	    reponse.classList.replace('selected', 'notSelected');
	};
	if(i>-1) {
	    a = document.querySelector("#r"+i);
	    a.classList.replace("notSelected", "selected");
	}
    }
    else {
	a = document.querySelector("#r"+i);
	a.classList.toggle("notSelected");
	a.classList.toggle("selected");
    }
    sendAnswer();
}

function updateAnswer(i, elem) {
    if(i>-1) {
	a = document.querySelector("#r"+i);
	a.classList.replace("notSelected", "selected");
    }
    sendAnswer();
}

	
function sendAnswer() {
    reponses = []
    document.querySelectorAll(".reponse.selected").forEach((elem) => {
	let atom = {}
	atom.n = parseInt(elem.id.split("r")[1]);
	textarea =elem.querySelector("textarea");
	atom.text = textarea ? textarea.value : "";
	reponses.push(atom);
    });
    socket.emit("chosenAnswer", reponses);
}

