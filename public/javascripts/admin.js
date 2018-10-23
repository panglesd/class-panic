//var socketAdmin = io.connect('http://192.168.0.12:3000/admin');
//var socketAdmin = io.connect('http://localhost:3000/admin');
var socketAdmin = io.connect(server+'/admin');
let currentQuestionOfAdmin;


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
    console.log(newStats);
    ula = document.createElement("ul")
    ula.innerHTML = '<li style="font-family: Impact, \'Arial Black\', Arial, Verdana, sans-serif;"> Ce qu\'en disent les élèves : </li>';

    newStats.forEach(function (stat) {
	li = document.createElement("li");
	//li.id = stat.id;
	li.innerHTML = '<div style="display:flex; justify-content: space-between;"></div>'
	li.firstChild.innerText = stat.fullName;
	ula.appendChild(li)
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
	    li.innerHTML = '<div style="display:flex; justify-content: space-between;color:'+color+';"> '+/*stat.pseudo*//*stat.fullName+*/' <span>'+ans.response2+' '+ans.text+'</span></div>'
	    MathJax.Hub.Queue(["Typeset",MathJax.Hub,li]);
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
socketAdmin.on('newQuestion', function (reponse) {
    console.log("fromAdminnewQuestion", reponse);
    currentQuestionOfAdmin=reponse;
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
	if(document.querySelector("li#q"+reponse.id))
	    document.querySelector("li#q"+reponse.id).classList.add("currentQuestion");
    }
    document.querySelector("#customQuestion").innerHTML = "Créer sa propre question temporaire";
    document.querySelector("#customQuestion").onclick = customQuestion;
/*    }
    else {
	document.querySelector("#customQuestion").innerHTML = "Revenir à la question en cours";
	document.querySelector("#customQuestion").onclick = backToSetQuestion;
	}*/

    document.querySelector("#question").contentEditable = "false";
    socketAdmin.emit("sendStatsPlease");
});

/*********************************************************************/
/*                 Pour les questions custom                         */
/*********************************************************************/

// On veut retourner à l'état normal avec la question courrante
backToSetQuestion = function (event) {
    document.querySelector("#customQuestion").innerHTML = "Créer sa propre question temporaire";
    document.querySelector("#customQuestion").onclick = customQuestion;
    document.querySelector("#question").contentEditable = false;
    sendOwnedQuestionPlease();
}

// On envoie au serveur notre nouvelle question
sendReponse = function() {
    newQuestion = {};
    // Pour l'énoncé
    newQuestion.enonce = document.querySelector("#question").innerText;
    // Pour la description
    newQuestion.description = document.querySelector("#newDescr").value;
    // Pour le type
    newQuestion.type = document.querySelector("#isMulti").checked ? "multi" : "mono";
    // Pour les réponses
    newQuestion.reponses = [];
    document.querySelectorAll("#wrapperAnswer > .reponse:not(#plus)").forEach(function(questionElem) {
	text = questionElem.querySelector(".text");
	console.log("text is", text);
	rep = {
	    reponse:text.innerText,
	    texted: questionElem.querySelector(".isTexted").value == "true" ? true : false
	}
	console.log("questionElem",questionElem);
	console.log("rep now", rep);
	if(rep.texted)
	    rep.correction = questionElem.querySelector(".textCorrect").value
	console.log("querySelec", questionElem.querySelector(".textCorrect"));
	console.log("rep maintenant", rep);
	// Pour la validité
	if(questionElem.classList.contains("true"))
	    rep.validity = "true"
	if(questionElem.classList.contains("false"))
	    rep.validity = "false"
	if(questionElem.classList.contains("to_correct"))
	    rep.validity = "to_correct"
	newQuestion.reponses.push(rep);
    });
    socketAdmin.emit("customQuestion", newQuestion);
    
}


/*******************************************/
/* Passage en mode modification            */
/*******************************************/

// On décide de créer sa question custom
customQuestion = function(event) {
    // Pour le titre/énoncé de la question
    document.querySelector("#question").contentEditable = true;
    document.querySelector("#question").innerHTML = "Question éditable";
    // Pour la description
    document.querySelector("#description").innerHTML="<textarea id='newDescr' style='width:100%;height:200px'></textarea>";
    document.querySelector("#description").style.visibility = "visible";
    // On crée la première réponse
    innerHTML = "<div class=\"reponse notSelected to_correct\">"+
	              "<span class='text' contentEditable=\"true\">Réponse éditable</span><br/>" +
	              "<button class='isTexted' value=\"false\">Ajouter un textarea</button><br>" +
                      "<button class='setStatus true'>Juste</button>" +
	              "<button class='setStatus to_correct'>À corriger</button>" +
	              "<button class='setStatus false'>Faux</button><br/>" +
	              "<button class='remove'>Retirer</button>" +
                "</div>"
    // On crée le panel du bas (pour ajouter des réponses et envoyer au serveur)
    innerHTML += "<div class=\"reponse notSelected\" id=\"plus\"> " +
	              "<button onclick=\"addReponse()\"> Ajouter une réponse</button>"+
	              "<input type='checkbox' id='isMulti' onChange='toggleType()'><span style='font-size:0.65em;color:black'>Question multi-réponses</span>"+
	              "<button onclick=\"sendReponse()\"> Envoyer aux élèves </button>"+
	         "</div>";
    document.querySelector("#wrapperAnswer").innerHTML = innerHTML
    // On ajoute les events listeners à la première réponse auto ajoutée
    let n = document.querySelector("#wrapperAnswer .reponse");
    n.querySelector(".isTexted").addEventListener("click", (event) => { toggleTextarea(n) });
    n.querySelector(".setStatus.true").addEventListener("click", (event) => { chooseAs("true", n) });
    n.querySelector(".setStatus.to_correct").addEventListener("click", (event) => { chooseAs("to_correct", n) });
    n.querySelector(".setStatus.false").addEventListener("click", (event) => { chooseAs("false", n) });
    n.querySelector(".remove").addEventListener("click", (event) => { removeResponse(n) });
    // On s'occupe du panel à droite
    document.querySelector("#customQuestion").innerHTML = "Revenir à la question en cours";
    document.querySelector("#customQuestion").onclick = backToSetQuestion;
}

// On décide de modifier la question courrante
function modifyQuestion() {
    if(document.querySelector("#question").contentEditable=="false") {
	// Pour l'énoncé/titre
	question = document.querySelector("#question");
	question.contentEditable=true;
	question.textContent=currentQuestionOfAdmin.enonce;
	// Pour la description
	descr = document.querySelector("#description");
	descr.style.visibility="visible";
	descr.innerHTML = "<textarea id=\"newDescr\" style='width:100%;height:200px;'></textarea>";
	descr.firstChild.textContent = currentQuestionOfAdmin.description;
	// Pour les réponses possibles
	console.log("query",	document.querySelectorAll("#wrapperAnswer .reponse"));
	document.querySelectorAll("#wrapperAnswer .reponse").forEach((reponse,index) => {
	    // Pour la couleur suivant la validité
	    reponse.classList.add(currentQuestionOfAdmin.reponses[index].validity);
	    // Pour la réponse en texte
	    reponse.innerText = currentQuestionOfAdmin.reponses[index].reponse;
	    reponse.innerHTML = "<span  class='text' contentEditable='true'>"+reponse.innerHTML +"</span>";
	    // Pour une éventuelle réponse custom
	    if(currentQuestionOfAdmin.reponses[index].texted) {
		reponse.innerHTML+="<br><button value=\"true\" class=\"isTexted texted\">Enlever le textarea</button><br>"
		reponse.innerHTML+="<textarea class='textCorrect' style='display:block;width:100%;' placeholder='Correction ou justification'></textarea>"
		reponse.querySelector(".textCorrect").textContent = currentQuestionOfAdmin.reponses[index].correction
	    }
	    else
		reponse.innerHTML+="<br><button value=\"false\" class=\"isTexted\">Ajouter un textarea</button>"
	    // Les différents boutons
	    reponse.innerHTML+=
		"<button class='setStatus true'>Juste</button>"+
		"<button class='setStatus to_correct'>À corriger</button>"+
		"<button class='setStatus false'>Faux</button><br>"+
		"<button class='remove'>Retirer</button>"
	    // Et les events listeners
	    reponse.querySelector(".isTexted").addEventListener("click", (event) => { console.log(event); toggleTextarea(reponse) });
	    reponse.querySelector(".setStatus.true").addEventListener("click", (event) => { chooseAs("true", reponse) });
	    reponse.querySelector(".setStatus.to_correct").addEventListener("click", (event) => { chooseAs("to_correct", reponse) });
	    reponse.querySelector(".setStatus.false").addEventListener("click", (event) => { chooseAs("false", reponse) });
	    reponse.querySelector(".remove").addEventListener("click", (event) => { removeResponse(reponse) });
	});
	document.querySelectorAll("#wrapperAnswer .reponse").forEach((reponse) => {
	    console.log(reponse);
	});
	// Pour le panel de droite
	document.querySelector("#customQuestion").innerHTML = "Revenir à la question en cours";
	document.querySelector("#customQuestion").onclick = backToSetQuestion;
	// Pour le panel du bas
	let div = document.createElement("div");
	div.classList.add("reponse","notSelected");
	div.id = "plus";
	div.innerHTML = " <button onclick=\"addReponse()\"> Ajouter une réponse</button>" +
	    "<input type='checkbox' id='isMulti' onChange='toggleType()'"+(currentQuestionOfAdmin.type == "multi" ?  "checked" : "")+"><span style='font-size:0.65em;color:black'>Question multi-réponses</span>"+
	    "<button onclick=\"sendReponse()\"> Envoyer aux élèves </button>"
	document.querySelector("#wrapperAnswer").appendChild(div);
    }
}

/*******************************************/
/* Gestion des réponses                    */
/*******************************************/

// On ajoute une réponse possible
addReponse = function (event) {
    // n est l'élément réponse
    let n = document.createElement("div");
    n.classList.add("reponse");
    n.classList.add("notSelected");
    n.classList.add("to_correct");
    // Son contenu
    n.innerHTML = "<span  class='text' contenteditable=\"true\">Réponse éditable</span>" +
	"<br><button class='isTexted' value=\"false\">Ajouter un textarea</button><br>" +
	"<button class='setStatus true'>Juste</button>" +
	"<button class='setStatus to_correct'>À corriger</button>" +
	"<button class='setStatus false'>Faux</button><br>" +
	"<button class='remove'>Retirer</button>";
    // Ses events listeners
    n.querySelector(".isTexted").addEventListener("click", (event) => { toggleTextarea(n) });
    n.querySelector(".setStatus.true").addEventListener("click", (event) => { chooseAs("true", n) });
    n.querySelector(".setStatus.to_correct").addEventListener("click", (event) => { chooseAs("to_correct", n) });
    n.querySelector(".setStatus.false").addEventListener("click", (event) => { chooseAs("false", n) });
    n.querySelector(".remove").addEventListener("click", (event) => { removeResponse(n) });
    // On l'ajoute au bon endroit
    document.querySelector("#plus").parentNode.insertBefore(n,document.querySelector("#plus"));
}

// On enlève une réponse possible
removeResponse = function (response) {
    response.remove();
}

// On choisit le statut de la réponse
chooseAs = function (status, elem) {
    //    console.log(elem);
    if(status =="true" && !document.querySelector("#isMulti").checked && document.querySelector(".reponse.true"))
	document.querySelector(".reponse.true").classList.replace("true", "false");
    elem.classList.remove("true", "false", "to_correct");
    elem.classList.add(status);
}

// On ajoute ou enlève un textarea
function toggleTextarea(reponse) {
    elem = reponse.querySelector(".isTexted");
    elem.value = elem.value == "false" ? "true" : "false";
    elem.classList.toggle("texted");
    // On ajoute un textarea
    if(elem.textContent=="Ajouter un textarea") {
	elem.textContent="Enlever le textarea";
	elem.classList.add("isTexted");
	newTextarea = document.createElement("textarea"),
	elem.parentNode.insertBefore(newTextarea, elem.nextSibling.nextSibling);
	newTextarea.outerHTML = "<textarea class='textCorrect' style='display:block;width:100%;' placeholder='Correction ou justification'></textarea>"
    }
    // On enlève un textarea
    else {
	elem.textContent="Ajouter un textarea"
	reponse.querySelector(".textCorrect").remove();
    }
}

function toggleType() {
    let isMulti = document.querySelector("#isMulti").checked
    if(!isMulti) {
	document.querySelectorAll(".reponse.true").forEach((rep, index) => {
	    if(index>0)
		rep.classList.replace("true", "false");
	});
    }

}
