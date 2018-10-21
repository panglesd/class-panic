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

socket.on('newQuestion', function (reponse, correction) {
    console.log(reponse);
    currentQuestionOfStudent=reponse;
    enonce = document.querySelector("#question");
    enonce.textContent=reponse.enonce;
    MathJax.Hub.Queue(["Typeset",MathJax.Hub,enonce]);
    wrapper = document.querySelector("#wrapperAnswer");
    while (wrapper.firstChild) {
	wrapper.removeChild(wrapper.firstChild);
    }
    reponse.reponses.forEach(function (rep, index) {
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
	if(typeof isAdmin == "undefined")
	    elem.addEventListener("click", function (ev) {
//		chooseAnswer(index, event.currentTarget);
		chooseAnswer(index, elem);
	    });
	//	elem.textContent = (rep.reponse);
	span = document.createElement("span");
	elem.innerHTML = "";
	span.innerHTML = md.render(rep.reponse);
	console.log(span, rep.reponse);
	span.classList.add("markdown");
	elem.appendChild(span)
	if(rep.texted) {
	    textarea = document.createElement("textarea");
	    textarea.style.width="100%"
	    textarea.style.display="block"
	    if(typeof isAdmin == "undefined") {
		textarea.addEventListener("input", (ev) => {
		    console.log("updateed");
		    chooseAnswer(index, event.currentTarget.parentNode);
		});
	    }
	    if(rep.correction)
		textarea.textContent=rep.correction
	    elem.appendChild(textarea);
	}
	MathJax.Hub.Queue(["Typeset",MathJax.Hub,elem]);
	wrapper.appendChild(elem);
    });
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
    if(correction) 
	correct(correction);
});

/*********************************************************************/
/*                 lorsque l'on reçoit la correction                 */
/*********************************************************************/

//socket.on('correction', function (correction) {
correct = function (correction) {
    console.log(correction);
    var total = 0;
    correction.forEach(function (v) { total += v.count });
    total=Math.max(total,1);
    correction.forEach(function (v) {
	if(v.answer!=-1) {
//	    console.log("#rep"+v.answer);
	    document.querySelector("#r"+v.answer).style.background =
	    "linear-gradient(to right, rgba(0,0,0,0.5) "+((0.+v.count)/total*100./*-5*/)+"%,#F5F5DC "+((0.+v.count)/total*100.)+"%)";
	}
    });
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

if(typeof isAdmin == "undefined") {
    var reponses=document.querySelectorAll(".reponse");
    for(var vari=0;vari<reponses.length;vari++) {
	reponses[vari].addEventListener("click",chooseAnswer);
    };
}

function chooseAnswer(i, elem) {
    answer = {};
    answer.n = i;
    textarea =  elem.querySelector("textarea")
    answer.text = textarea ? textarea.value : "";
    socket.emit("chosenAnswer", answer);
    var reponse=document.querySelector(".reponse.selected");
    if(reponse) {
	reponse.classList.replace('selected', 'notSelected');
    };
    if(i>-1) {
	a = document.querySelector("#r"+i);
	a.classList.replace("notSelected", "selected");
    }
}


