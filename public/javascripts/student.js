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

socket.on('newQuestion', function (reponse) {
    //    console.log(reponse);
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
	elem.id = "r"+index;
	if(typeof isAdmin == "undefined")
	    elem.addEventListener("click", function (ev) {
		chooseAnswer(index);
	    });
	elem.textContent = rep.reponse;
	MathJax.Hub.Queue(["Typeset",MathJax.Hub,elem]);
	wrapper.appendChild(elem);
    });
    descr = document.querySelector("#description");
    if(reponse.description)
	descr.style.visibility="visible";
    else
	descr.style.visibility="hidden";
    descr.innerHTML = md.render(reponse.description);
    MathJax.Hub.Queue(["Typeset",MathJax.Hub,descr]);
});

/*********************************************************************/
/*                 lorsque l'on reçoit la correction                 */
/*********************************************************************/

socket.on('correction', function (correction) {
//    console.log(correction);
    document.querySelectorAll(".reponse").forEach(function (elem) {elem.style.boxShadow="0 0 8px 10px red"});
    //	      document.querySelector("#rep"+correction.correct).style.boxShadow="0 0 8px 15px green";
    document.querySelector("#r"+correction.correctAnswer).style.boxShadow="0 0 8px 15px green";
    var total = 0;
    correction.anonStats.forEach(function (v) { total += v.count });
    total=Math.max(total,1);
    correction.anonStats.forEach(function (v) {
	if(v.answer!=-1) {
//	    console.log("#rep"+v.answer);
	    document.querySelector("#r"+v.answer).style.background =
	    "linear-gradient(to right, rgba(0,0,0,0.5) "+((0.+v.count)/total*100./*-5*/)+"%,#F5F5DC "+((0.+v.count)/total*100.)+"%)";
	}
    });
});

/*********************************************************************/
/*                 pour redemander d'envoyer la question             */
/*********************************************************************/

function sendQuestionPlease() {
    socket.emit("sendQuestionPlease");
}

/*********************************************************************/
/*                 pour envoyer son choix de reponse                 */
/*********************************************************************/

var reponses=document.querySelectorAll(".reponse");
for(var vari=0;vari<reponses.length;vari++) {
    reponses[vari].addEventListener("click",chooseAnswer);
};

function chooseAnswer(i) {
    socket.emit("chosenAnswer", i);
    var reponses=document.querySelectorAll(".reponse");
    reponses.forEach(function (rep) {
	rep.classList.replace('selected', 'notSelected');
    });
    if(i>-1) {
	a = document.querySelector("#r"+i);
	a.classList.replace("notSelected", "selected");
    }
}


