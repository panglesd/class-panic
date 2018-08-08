var socket = io.connect('http://localhost:3000/');

/*********************************************************************/
/*                 Actions à effectuer à toute connection            */
/*********************************************************************/

// On informe le serveur dans quel room on est
socket.on('connect', () => {
    socket.emit("chooseRoom", room);
});

/*********************************************************************/
/*                 lorsque l'on reçoit une nouvelle question         */
/*********************************************************************/

socket.on('newQuestion', function (reponse) {
    console.log(reponse);
    document.querySelectorAll(".reponse").forEach(function (value) {
	value.classList.remove("selected");
	value.classList.add("notSelected");
    });
    document.querySelectorAll(".reponse").forEach(function (e) {
	e.style.boxShadow="";
	//	   e.style.backgroundColor="#F5F5DC";
	e.style.background = "linear-gradient(to right, rgba(0,0,0,0) 0%,#F5F5DC 0%)";
    });
    document.querySelector("#question").innerHTML=reponse.enonce;
    document.querySelector("#rep0").innerHTML=reponse.reponse1;
    document.querySelector("#rep1").innerHTML=reponse.reponse2;
    document.querySelector("#rep2").innerHTML=reponse.reponse3;
    document.querySelector("#rep3").innerHTML=reponse.reponse4;
});

/*********************************************************************/
/*                 lorsque l'on reçoit la correction                 */
/*********************************************************************/

socket.on('correction', function (correction) {
    console.log(correction);
    document.querySelectorAll(".reponse").forEach(function (elem) {elem.style.boxShadow="0 0 8px 10px red"});
    //	      document.querySelector("#rep"+correction.correct).style.boxShadow="0 0 8px 15px green";
    document.querySelector("#rep"+"1").style.boxShadow="0 0 8px 15px green";
    var total = 0;
    correction.anonStats.forEach(function (v) { total += v.count });
    total=Math.max(total,1);
    correction.anonStats.forEach(function (v) {
	if(v.answer!=-1) {
//	    console.log("#rep"+v.answer);
	    document.querySelector("#rep"+v.answer).style.background =
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

function chooseAnswer(a) {
    i=a.target.id.charAt(3);
    var reponses=document.querySelectorAll(".reponse");
    for(var vari=0;vari<reponses.length;vari++) {
	value=reponses[vari];
	value.classList.remove("selected");
	value.classList.add("notSelected");
    };
    a.target.classList.remove("notSelected");
    a.target.classList.add("selected");
//    console.log("socket emit chosen answer", i);
    socket.emit("chosenAnswer", i);
}

