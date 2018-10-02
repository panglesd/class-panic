//var socketAdmin = io.connect('http://192.168.0.12:3000/admin');
//var socketAdmin = io.connect('http://localhost:3000/admin');
var socketAdmin = io.connect(server+'/admin');
var isAdmin = true;
var currentQuestionOf;

/*********************************************************************/
/*                 Actions à effectuer à toute connection            */
/*********************************************************************/

// On informe le serveur dans quel room on est
socketAdmin.on('connect', () => {
    socketAdmin.emit("chooseRoom", roomID);
});

/*********************************************************************/
/*                 lorsque l'on veut changer de question             */
/*********************************************************************/

function changeQuestionPlease() {
    socketAdmin.emit("changeQuestionPlease");
}

/*********************************************************************/
/*                 pour redemander d'envoyer la question             */
/*********************************************************************/

function sendOwnedQuestionPlease() {
    socket.emit("sendQuestionPlease");
}

/*********************************************************************/
/*                 lorsque l'on veut reveler les resultats           */
/*********************************************************************/

function revealResults() {
    socketAdmin.emit("revealResults");
}

/*********************************************************************/
/*                 lorsque l'on veut aller à une question donnée     */
/*********************************************************************/

function gotoQuestion(i) {
    socketAdmin.emit("changeToQuestion", i);
}

/*********************************************************************/
/*                 lorsque l'on reçoit les nouvelles statistiques    */
/*********************************************************************/

socketAdmin.on('newStats', function (newStats) {
    ul = document.createElement("ul")
    ul.innerHTML = '<li style="font-family: Impact, \'Arial Black\', Arial, Verdana, sans-serif;"> Ce qu\'en disent les élèves : </li>';

    newStats.namedStats.forEach(function (stat) {
	li = document.createElement("li");
	li.id = stat.id;
	color = newStats.correctAnswer == stat.response ? "green" : ( stat.response != -1 ? "red" : "white");
	if(stat.response == -1)
	    stat.response2 = "?";
	else 
	    stat.response2 = currentQuestionOf.reponses[stat.response].reponse;
	li.innerHTML = '<div style="display:flex; justify-content: space-between;color:'+color+';"> '+/*stat.pseudo*/stat.fullName+' : <span>'+stat.response2+'</span></div>'
	MathJax.Hub.Queue(["Typeset",MathJax.Hub,li]);
	ul.appendChild(li);
    });
    document.querySelector("#stats ul").innerHTML = ul.innerHTML;
});

/*********************************************************************/
/*                 lorsque l'on reçoit une nouvelle question (admin) */
/*********************************************************************/
socketAdmin.on('newQuestion', function (reponse) {
    console.log("fromAdminnewQuestion", reponse);
    currentQuestionOf=reponse;
    if(temp=document.querySelector("li.inactiveQuestion")) {
	if(reponse.id)
	    temp.classList.remove("inactiveQuestion")
    }
    if(temp=document.querySelector("li.currentQuestion")) {
	temp.classList.remove("currentQuestion");
//	console.log("reponse is", reponse);
	if(!reponse.id)
	    temp.classList.add("inactiveQuestion")
    }
    if(reponse.id) {
	document.querySelector("li#q"+reponse.id).classList.add("currentQuestion");
    }
    document.querySelector("#customQuestion").innerHTML = "Créer sa propre question temporaire";
    document.querySelector("#customQuestion").onclick = customQuestion;
/*    }
    else {
	document.querySelector("#customQuestion").innerHTML = "Revenir à la question du set";
	document.querySelector("#customQuestion").onclick = backToSetQuestion;
    }*/
    document.querySelector("#question").contentEditable = "false";
    socketAdmin.emit("sendStatsPlease");
});

/*********************************************************************/
/*                 Pour les questions custom                         */
/*********************************************************************/

backToSetQuestion = function (event) {
    document.querySelector("#customQuestion").innerHTML = "Créer sa propre question temporaire";
    document.querySelector("#customQuestion").onclick = customQuestion;
    document.querySelector("#question").contentEditable = false;
    sendOwnedQuestionPlease();
//    socketAdmin.emit("backToSet");
}

addReponse = function (event) {
    n = document.createElement("div");
    n.classList.add("reponse");
    n.classList.add("notSelected");
    n.innerHTML = "<span contenteditable=\"true\">Réponse éditable</span><button onclick=\"chooseAsCorrect(this)\">Choisir comme réponse juste</button><button onclick=\"removeReponse(this)\"> Retirer</button>";
    document.querySelector("#plus").parentNode.insertBefore(n,document.querySelector("#plus"));
}

removeReponse = function (elem) {
    elem.parentNode.remove();
}

sendReponse = function() {
    newQuestion = {};
    newQuestion.reponses = [];
    i=0;
    document.querySelectorAll("#wrapperAnswer div span").forEach(function(span) {
	newQuestion.reponses.push({reponse:span.textContent, validity:false});
	if(span.parentNode.classList.contains("juste"))
	    newQuestion.correct = i;
	i++;
    });
    newQuestion.enonce = document.querySelector("#question").textContent;
    
//    console.log(newQuestion);
//    backToSetQuestion(); 
    socketAdmin.emit("customQuestion", newQuestion);
    
}

chooseAsCorrect = function (elem) {
//    console.log(elem);
    if(temp=document.querySelector(".juste"))
	temp.classList.remove("juste");
    elem.parentNode.classList.add("juste");
}

customQuestion = function(event) {
    document.querySelector("#question").contentEditable = true;//innerHTML = "<input type=\"textarea\" placeholder=\"Votre question\">";
    document.querySelector("#question").innerHTML = "Question éditable";//innerHTML = "<input type=\"textarea\" placeholder=\"Votre question\">";
    document.querySelector("#wrapperAnswer").innerHTML = "<div class=\"reponse notSelected juste\" id=\"r0\"><span contentEditable=\"true\">Réponse éditable</span> <button onclick=\"chooseAsCorrect(this)\">Choisir comme réponse juste</button><button onclick=\"removeReponse(this)\">Retirer</button></div><div class=\"reponse notSelected\" id=\"plus\"> <button onclick=\"addReponse()\"> Ajouter une réponse</button><button onclick=\"sendReponse()\"> Envoyer aux élèves </button></div>";
    document.querySelector("#customQuestion").innerHTML = "Revenir à la question du set";
    document.querySelector("#customQuestion").onclick = backToSetQuestion;
    
}


function removeTypeset(elem) {
    var HTML = MathJax.HTML, jax = MathJax.Hub.getAllJax(elem);
    for (var i = 0, m = jax.length; i < m; i++) {
	var script = jax[i].SourceElement(), tex = jax[i].originalText;
	if (script.type.match(/display/)) {tex = "\\["+tex+"\\]"} else {tex = "\\("+tex+"\\)"}
	jax[i].Remove();
	var preview = script.previousSibling;
	if (preview && preview.className === "MathJax_Preview") {
	    preview.parentNode.removeChild(preview);
	}
	preview = document.createTextNode(tex);
	script.parentNode.insertBefore(preview,script);
	script.parentNode.removeChild(script);
    }
}

function modifyQuestion() {
    if(document.querySelector("#question").contentEditable=="false") {
	question = document.querySelector("#question");
	question.contentEditable=true;
	MathJax.Hub.Queue(() => {removeTypeset(question)});
	document.querySelectorAll("#wrapperAnswer .reponse").forEach((reponse) => {
	    MathJax.Hub.Queue(() => {removeTypeset(reponse)});
	});
	MathJax.Hub.Queue(() => {
	    document.querySelectorAll("#wrapperAnswer .reponse").forEach((reponse) => {
		console.log(reponse);
		reponse.innerHTML = "<span contentEditable='true'>"+reponse.innerHTML +"</span>";
		reponse.innerHTML+="<button onclick=\"chooseAsCorrect(this)\">Choisir comme réponse juste</button><button onclick=\"removeReponse(this)\">Retirer</button>"
	    });
	    document.querySelector("#customQuestion").innerHTML = "Revenir à la question du set";
	    document.querySelector("#customQuestion").onclick = backToSetQuestion;
	    document.querySelector("#wrapperAnswer").innerHTML+="<div class=\"reponse notSelected\" id=\"plus\"> <button onclick=\"addReponse()\"> Ajouter une réponse</button><button onclick=\"sendReponse()\"> Envoyer aux élèves </button></div>";
	});
    }
}

