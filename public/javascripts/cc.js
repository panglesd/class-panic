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
    var ula = document.createElement("ul");
    ula.innerHTML = '<li style="font-family: Impact, \'Arial Black\', Arial, Verdana, sans-serif;"> Ce qu\'en disent les élèves : </li>';
    
    ["a"].
    newStats.forEach(function (stat) {
	li = document.createElement("li");
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
    let temp;
    if((temp = document.querySelector("li.inactiveQuestion"))) {
	if(reponse.id)
	    temp.classList.remove("inactiveQuestion");
    }
    if((temp=document.querySelector("li.currentQuestion"))) {
	temp.classList.remove("currentQuestion");
//	console.log("reponse is", reponse);
	if(!reponse.id)
	    temp.classList.add("inactiveQuestion");
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
