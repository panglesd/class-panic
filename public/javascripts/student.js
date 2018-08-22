var socket = io.connect('http://localhost:3000/');

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
    console.log(reponse);
    document.querySelector("#question").textContent=reponse.enonce;
    wrapper = document.querySelector("#wrapperAnswer");
    while (wrapper.firstChild) {
	wrapper.removeChild(wrapper.firstChild);
    }
    reponse.reponses.forEach(function (rep, index) {
	elem = document.createElement('div');
	elem.classList.add("reponse");
	elem.classList.add("notSelected");
	elem.id = "r"+index;
	elem.addEventListener("click", function (ev) {
	    chooseAnswer(index);
	});
	elem.textContent = rep.reponse;
	wrapper.appendChild(elem);
    });
});

/*********************************************************************/
/*                 lorsque l'on reçoit la correction                 */
/*********************************************************************/

socket.on('correction', function (correction) {
    console.log(correction);
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
	    "linear-gradient(to right, rgba(0,0,0,0.5) "+((0.+v.count)/total*100.-5)+"%,#F5F5DC "+((0.+v.count)/total*100.)+"%)";
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
    console.log('a');
    if(i>-1) {
	console.log('a');
	a = document.querySelector("#r"+i);
	a.classList.replace("notSelected", "selected");
    }
    console.log("socket emit chosen answer", i);
}

