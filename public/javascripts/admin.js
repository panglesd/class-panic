//var socketAdmin = io.connect('http://192.168.0.12:3000/admin');
//var socketAdmin = io.connect('http://localhost:3000/admin');
var socketAdmin = io.connect(server+'/admin');
var isAdmin = true;

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
//    console.log(newStats);
    ul = document.createElement("ul")
    ul.innerHTML = '<li style="font-family: Impact, \'Arial Black\', Arial, Verdana, sans-serif;"> Ce qu\'en disent les élèves : </li>';

    newStats.namedStats.forEach(function (stat) {
	li = document.createElement("li");
	li.id = stat.id;
	color = newStats.correctAnswer == stat.response ? "green" : ( stat.response != -1 ? "red" : "white");
	if(stat.response == -1)
	    stat.response = "?";
	li.innerHTML = '<div style="display:flex; justify-content: space-between;color:'+color+';"> '+stat.pseudo+' : <span>'+stat.response+'</span></div>'
	ul.appendChild(li);
    });
    document.querySelector("#stats ul").innerHTML = ul.innerHTML;
});

/*********************************************************************/
/*                 lorsque l'on reçoit une nouvelle question (admin) */
/*********************************************************************/

socketAdmin.on('newQuestion', function (reponse) {
//    console.log("fromAdminnewQuestion", reponse);
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
    document.querySelector("#question").contentEditable = false;
});

/*********************************************************************/
/*                 Pour les questions custom                         */
/*********************************************************************/

backToSetQuestion = function (event) {
    document.querySelector("#customQuestion").innerHTML = "Créer sa propre question temporaire";
    document.querySelector("#customQuestion").onclick = customQuestion;
//    document.querySelector("#question").contentEditable = false;
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
