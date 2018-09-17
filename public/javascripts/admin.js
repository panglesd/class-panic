//var socketAdmin = io.connect('http://192.168.0.12:3000/admin');
//var socketAdmin = io.connect('http://localhost:3000/admin');
var socketAdmin = io.connect(server+'/admin');

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
/*                 lorsque l'on veut reveler les resultats           */
/*********************************************************************/

function revealResults() {
    console.log("rev");
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
    console.log("fromAdminnewQuestion", reponse);
    document.querySelector("li.currentQuestion").classList.remove("currentQuestion");
//    document.querySelector("li.nextQuestion").classList.remove("nextQuestion");
    document.querySelector("li#q"+reponse.id).classList.add("currentQuestion");
//    document.querySelector("li#q"+reponse.nextQuestion).classList.add("nextQuestion");
});

/*********************************************************************/
/*                 Pour les questions custom                         */
/*********************************************************************/

backToSetQuestion = function (event) {
    document.querySelector("#customQuestion").innerHTML = "Créer sa propre question temporaire";
    document.querySelector("#customQuestion").onclick = customQuestion;
    sendQuestionPlease();
}

addReponse = function (event) {
    n = document.createElement("div");
    n.classList.add("reponse");
    n.classList.add("notSelected");
    n.innerHTML = "<span contentEditable=\"true\">Réponse éditable</span><button onclick=\"chooseAsCorrect(this)\">Choisir comme réponse juste</button><button onclick=\"removeReponse(this)\"> Retirer</button>";
    document.querySelector("#plus").parentNode.insertBefore(n,document.querySelector("#plus"));
}

removeReponse = function (elem) {
//    console.log(event);
    elem.parentNode.remove();
}

sendReponse = function() {
    newQuestion = {};
    newQuestion.reponses = [];
    i=0;
    document.querySelectorAll("#wrapperAnswer div span").forEach(function(span) {
	newQuestion.reponses.push(span.innerHTML);
	if(span.parentNode.classList.contains("juste"))
	    newQuestion.correct = i;
	i++;
    });
    
    console.log(newQuestion);

    socketAdmin.send("myNewQuestion", newQuestion);
}

chooseAsCorrect = function (elem) {
    console.log(elem);
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
