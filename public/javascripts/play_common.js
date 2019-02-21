/*********************************************************************/
/*                 lorsque l'on reçoit une nouvelle question (admin) */
/*********************************************************************/

function afficheQuestion(question) {

    console.log("newQuestion", question);

    // On s'occupe du carré blanc
    let temp;
    if((temp = document.querySelector("li.currentQuestion"))) {
	temp.classList.remove("currentQuestion");
    }
    if((temp = document.querySelector("li#q-"+question.id)))
	temp.classList.add("currentQuestion");

    // On écrit l'énoncé là où il faut. MathJax rendered.
    let enonce = document.querySelector("#question");
    enonce.setAttribute("questionID", question.id);
    enonce.textContent=question.enonce;
    MathJax.Hub.Queue(["Typeset",MathJax.Hub,enonce]);

    // On nettoie les réponses précédentes
    let wrapper = document.querySelector("#wrapperAnswer");
    while (wrapper.firstChild) {
	wrapper.removeChild(wrapper.firstChild);
    }

    // Si besoin est, on rajoute la description
    let descr = document.querySelector("#description");
    if(question.description)
	descr.style.visibility="visible";
    else
	descr.style.visibility="hidden";
    if(question.description)
	descr.innerHTML = md.render(question.description);
    else
	descr.innerHTML = question.description;
    MathJax.Hub.Queue(["Typeset",MathJax.Hub,descr]);

    // Pour chaque nouvelle réponse :

    question.reponses.forEach(function (rep, index) {
	let elem = createResponse(question, rep, index);
	wrapper.appendChild(elem);
    });

    // Pour le résumé :

    let summaryWrapper = document.createElement('div');
//    summaryWrapper.classList.add("reponse");
    summaryWrapper.classList.add("summary");
    summaryWrapper.classList.add("notSelected");
    summaryWrapper.innerHTML += "Note finale : <span id='note'>N/A</span> Coéf : <span id='coef'>N/A</span>";
    summaryWrapper.style.display = "none";
    wrapper.appendChild(summaryWrapper);

    if(question.coef) {
	document.querySelector(".summary").style.display="";
	document.querySelector(".summary #coef").textContent = question.coef;
    }

};

function createResponse(question, rep, index) {
    // Création de l'élément HTML vide
    let elem = document.createElement('div');
    elem.classList.add("reponse");
    elem.classList.add("notSelected");
    elem.id = "r"+index;    
    // Si besoin est, ajout d'un event listener  A DEPLACER ?
//    console.log("on ajoute chooseAnswer ???", rep);
    if(!rep.texted && rep.hasFile == "none" && typeof chooseAnswer == "function") {
//	console.log("on ajoute chooseAnswer !!!");
	elem.addEventListener("click", function (ev) {
	    chooseAnswer(index);		    //updateAnswer(index, elem, true);
	});
    }
    // Création de l'élément contenant l'énoncé de la réponse
    let span = document.createElement("span");
    elem.innerHTML = "";
    span.innerHTML = md.render(rep.reponse);
    console.log(span, rep.reponse);
    span.classList.add("markdown");
    elem.appendChild(span);
    // Si besoin, ajout d'un textarea
    if(rep.texted) {
	let textarea = document.createElement("textarea");
	textarea.style.width="100%";
	textarea.style.display="block";
	// if(rep.correction)
	// 	textarea.textContent=rep.correction;
	// Ajout d'un event listener pour le textarea
	if(typeof chooseAnswer == "function") {
	    textarea.addEventListener("input", (ev) => {
		console.log("updateed");
		chooseAnswer(index);		    //updateAnswer(index, elem, true);
		//		    sendAnswer();
	    });
	}
	elem.appendChild(textarea);
    }
    // Ajout du texte de correction
    let correcWrapper = document.createElement("fieldset");
    correcWrapper.style.display = "none";
    let legend = document.createElement("legend");
    legend.innerText = "Corrigé";
    correcWrapper.appendChild(legend);
    correcWrapper.classList.add("correcWrapper");
    let correc = document.createElement("div"); correc.classList.add("correc");
    correcWrapper.appendChild(correc);
    elem.appendChild(correcWrapper);

    
    // Si besoin, ajout d'un input type=file
    if(rep.hasFile == true || ["single","multi","true"].includes(rep.hasFile)) {
	let fileInfo = document.createElement("ul");
	fileInfo.classList.add("filesInfo");
	fileInfo.innerText = "Pas de fichier envoyé";
	fileInfo.style.fontSize = "19px";
	elem.appendChild(fileInfo);
	if(typeof sendFile == "function") {
	    let fileInput = document.createElement("input");
	    fileInput.type="file";
	    //	    file.value = "Soumettre un fichier";
	    fileInput.addEventListener('change', function() {
		var reader = new FileReader();
		reader.addEventListener('load', function() {
		    console.log("sending file !");
		    sendFile(fileInput.files[0].name, index, question.indexSet, reader.result);
		    elem.classList.replace("notSelected", "selected");
		});
		reader.readAsArrayBuffer(fileInput.files[0]);		
	    });
	    let comment = document.createElement("span");comment.innerText = "Ajouter un fichier : "; comment.style.fontSize="19px";
	    elem.appendChild(comment);
	    elem.appendChild(fileInput);
	}
    }
    // A commenter ?
    MathJax.Hub.Queue(["Typeset",MathJax.Hub,elem]);
    console.log("rep = ", rep);

    let fileCorrecWrapper = document.createElement("fieldset");
    fileCorrecWrapper.classList.add("fileCorrecWrapper");
    fileCorrecWrapper.style.display="none";
    let legendCorrec = document.createElement("legend");
    legendCorrec.innerText = "Fichiers Corrigés";
    fileCorrecWrapper.appendChild(legendCorrec);
    elem.appendChild(fileCorrecWrapper);


    if(rep.validity)
	addCorrection(question, elem, rep, index);
    
    let customComment = document.createElement("textarea");
    customComment.id="customComment-"+index;
    customComment.classList.add("customComment");
    customComment.placeholder="Commentaires de correction";
    customComment.style.display = "none";
//    customComment.required=true; // HACK pour que customComment ne s'affiche que s'il contient quelque chose...
    //	console.log("rep=",reponse);
    if(typeof(setCustomComment) == "function")
	customComment.addEventListener("input", (ev) => {
	    setCustomComment(index, customComment.value);
	});
    elem.appendChild(customComment);
    return elem;
//    wrapper.appendChild(elem);
}

function addCorrection(question, elem, rep, index) {
    // Si la correction est présente
    if(rep.validity != "to_correct") {
	elem.classList.add(rep.validity);
	if(typeof(rep.validity) == "number")
	    elem.style.boxShadow =  "0 0 8px 10px rgb("+ Math.floor(128*(1-rep.validity)) +","+ Math.floor(128*rep.validity)+",0)";
	else
	    elem.style.boxShadow =  "";
    }
    if(rep.texted) {
	if(rep.correction){
	    elem.querySelector(".correcWrapper").style.display = "";
	    elem.querySelector(".correcWrapper .correc").innerText = rep.correction;
	}
    }
    if(rep.hasFile == true || ["single","multi","true"].includes(rep.hasFile)) {
	if(rep.correcFilesInfo) {
	    elem.querySelector(".fileCorrecWrapper").style.display="";
	    rep.correcFilesInfo.forEach((fileInfo) => {
		let divOneCorrection = document.createElement("div");
		divOneCorrection.classList.add("correcFileArea");
		let linkToCorrection = document.createElement("a");
		linkToCorrection.href = "fileCorrect/"+question.id+"/"+index+"/"+fileInfo;
		linkToCorrection.target = "_blank";
		linkToCorrection.style.color = "blue";
		linkToCorrection.textContent = /*"Correction : "+*/fileInfo;
		divOneCorrection.appendChild(linkToCorrection);
		elem.querySelector(".fileCorrecWrapper").appendChild(divOneCorrection);
	    });
	}
    }

    return elem;}

function addAdminInterface(question, setValidity, setGlobalGrade){
    let wrapper = document.querySelector("#wrapperAnswer");
    question.reponses.forEach((rep, index) => {
	let elemRep = document.querySelector("#r"+index);
	let button = document.createElement("button");
	button.addEventListener("click",(ev) => {
	    setValidity(index,1);
	});
	let button2 = document.createElement("button");
	button2.addEventListener("click",(ev) => {
	    setValidity(index,0);
	});
	let button3 = document.createElement("button");
	button3.addEventListener("click",(ev) => {
	    setValidity(index,"to_correct");
	});
	button.textContent = "Forcer à juste";
	button2.textContent = "Forcer à faux";
	button3.textContent = "Décorriger";
	elemRep.appendChild(button);
	elemRep.appendChild(button3);
	elemRep.appendChild(button2);
	let noteCust = document.createElement("span"); noteCust.innerText = " Note custom : "; noteCust.style.fontSize = "19px";
	let customNote = document.createElement("input");
	customNote.type="number";
	customNote.id="customNote-"+index;
	elemRep.appendChild(noteCust);
	elemRep.appendChild(customNote);
	let vraiFaux = document.createElement("span"); vraiFaux.innerText = " Réussite sur 10 : "; vraiFaux.style.fontSize = "19px";
	elemRep.appendChild(vraiFaux);
	let vraiFauxInput = document.createElement("input");
	vraiFauxInput.type="number";
	vraiFauxInput.classList.add("pourcentage");
	vraiFauxInput.step="0.1";
	vraiFauxInput.value=rep.validity;
	vraiFauxInput.id="vraiFauxInput-"+index;
	vraiFauxInput.addEventListener("input", (ev) => {
	    setValidity(index, parseFloat(vraiFauxInput.value));
	});
	elemRep.appendChild(vraiFauxInput);
	elemRep.querySelector(".customComment").style.display = "";
	let note = document.createElement("div");
	note.classList.add("note");
	elemRep.appendChild(note);

    });
    let summary = document.querySelector(".summary");
    let customMarkWrapper = document.createElement("div");
    customMarkWrapper.innerHTML = "Choisir sa note : <input type='number' id='mark' step='0.1'>";
    let mark = customMarkWrapper.querySelector("#mark");
    if(mark) {
	mark.addEventListener("input", (ev) => {console.log("change");setGlobalGrade(parseFloat(mark.value));});
    }
    summary.appendChild(customMarkWrapper);
}
	

/*********************************************************************/
/*                 lorsque l'on reçoit une nouvelle soumission       */
/*********************************************************************/

//socketCC.on('newSubmission', function (submission) {
function afficheSubmission (submission) {
    console.log("affSubm with ", submission);
    let totalPoints = 0;
    let totalMaxPoints = 0;
    submission.response.forEach((submReponse, index) => {
	console.log("reponse ", submReponse);
	let questReponse = currentQuestion.reponses[index];
	let elemReponse = document.querySelectorAll("#wrapperAnswer .reponse")[index];
	elemReponse.classList.remove("notSelected");
	elemReponse.classList.remove("selected");
	elemReponse.classList.add(submReponse.selected ? "selected" : "notSelected");
	
	let ta = elemReponse.querySelector("textarea");
	if(ta)
	    ta.value = submReponse.text;
	//    });
	console.log("reponse.hasFile = ", submReponse.hasFile);
	if(elemReponse.querySelector(".filesInfo")) {
	    affFileInfo(elemReponse,submReponse.filesInfo,index);
	}
	console.log("we are here");
	elemReponse.classList.remove("to_correct", "true", "false");
	// if(reponse.validity) {
	//     elemReponse.classList.add(reponse.validity);
	// }
	if(typeof(submReponse.validity) == "number") {
	    elemReponse.style.boxShadow =  "0 0 8px 10px rgb("+ Math.floor(188*(1-submReponse.validity)) +","+ Math.floor(138*submReponse.validity)+",0)";
	    elemReponse.querySelector(".pourcentage").value = submReponse.validity;
	}
	else if (typeof(submReponse.validity) == "string"){
	    elemReponse.style.boxShadow =  "";
	    elemReponse.querySelector(".pourcentage").value = "";
	}
	if(submReponse.customComment) {
	    elemReponse.querySelector(".customComment").value = submReponse.customComment;
	    elemReponse.querySelector(".customComment").style.display = "";
	}
	let maxPoints = Math.max(questReponse.strategy.selected.vrai,
				 questReponse.strategy.selected.faux,
				 questReponse.strategy.unselected.vrai,
				 questReponse.strategy.unselected.faux);
	totalMaxPoints += maxPoints;
	if(typeof(submReponse.validity)=="number") {
	    let note = "";
	    if(submReponse.selected) 
		note = submReponse.validity*questReponse.strategy.selected.vrai + (1-submReponse.validity)* questReponse.strategy.selected.faux;
	    else
		note = submReponse.validity*questReponse.strategy.unselected.vrai + (1-submReponse.validity)* questReponse.strategy.unselected.faux;
	    totalPoints += note;
	    elemReponse.querySelector(".note").innerText = note+"/"+maxPoints;
	}
	// Ici gérer les corrections personnelles par reponse
	// elemReponse.querySelector(".correcPerso").innerText = reponse.correcPerso
    });
    if(submission.correct) {
	document.querySelector(".summary").style.display="";
	let noteFinale = document.querySelector("#note");
	noteFinale.textContent = submission.correct+"/"+totalMaxPoints;
	let mark = document.querySelector(".summary #mark");
	if(mark)
	    mark.value = submission.correct;
    }
    // Ici gérer les corrections personnelles de la question
    // document.querySelector(".correcPersoGlobal").innerText = submission.correcPerso
    // Notes etc...
};
//});

/*********************************************************************/
/*                 lorsqu'un fichier a été reçu                      */
/*********************************************************************/

function affFileInfo(elemReponse, filesInfo, n_ans) {
    console.log("FILESINFO", filesInfo);
    let filesInfoElem = elemReponse.querySelector(".filesInfo");
    filesInfoElem.innerHTML = filesInfo.length == 0 ? "Aucun fichier envoyé" : "";
    filesInfo.forEach((fileInfo) => {
	console.log("affFileinfo with : ", elemReponse, fileInfo, n_ans);
	let fileInfoElem = document.createElement("li");
	fileInfoElem.innerHTML = "<table><tr><td>Fichier : </td><td style='padding-left: 10px;'  ><a target='blank' class='fileName' style='color:blue' href='filePerso/"+currentQuestion.id+"/"+n_ans+"/"+fileInfo.fileName+"'></a></td></tr>"+
	    //		    "<tr><td>Hash md5 : </td><td  style='padding-left: 10px;' class='hash'></td></tr>";
	"<tr><td>Date : </td><td  style='padding-left: 10px;' class='tstamp'></td></tr>"+
	    (typeof removeFile == "function" ? "<tr><td></td><td  style='padding-left: 10px;' class='delete'><a style='color:#990000'>Supprimer</a></td></tr>" : "")+
	    "</table>";
	fileInfoElem.querySelector(".fileName").innerText += fileInfo.fileName;
	if(typeof removeFile == "function"){
	    fileInfoElem.querySelector(".delete").addEventListener("click", (ev) => {
		removeFile(n_ans, fileInfo.fileName);
	    });
	}
	//		fileInfo.querySelector(".hash").innerText = reponse.fileInfo[index].hash;
	if(fileInfo.timestamp){
	    let date = new Date(fileInfo.timestamp);
	    fileInfoElem.querySelector(".tstamp").innerText = "Le " + date.toLocaleDateString() + " à " + date.toLocaleTimeString();
	}
//	elemReponse.setAttribute("fileInfo",JSON.stringify(fileInfo));
//	elemReponse.setAttribute("fileInfo","");
	filesInfoElem.appendChild(fileInfoElem);
    });
}

/*********************************************************************/
/*                 Pour afficher une liste de questions              */
/*********************************************************************/

function affQuestionList(questionList) {
    // On vérifie si quelque chose a changé dans les énoncés.
    let notTheSame = typeof currentList == "undefined";
    notTheSame = notTheSame || currentList.length != questionList.length;
    if(!notTheSame)
	questionList.forEach((question, index) => {
	    if(question.enonce != currentList[index].enonce)
		notTheSame = true;
	});
    // notTheSame vaut true ssi quelque chose a changé dans les énoncés. Si c'est le cas, on refait entièrement le menu
    currentList = questionList;
    if(notTheSame) {
	let ul = document.createElement("ul");
	ul.id = "chooseQFromSet";
	ul.innerHTML = '<li id="chooseQuestionNext"> Choisir la question suivante :</li>';
	questionList.forEach(function (question, index) {
	    // console.log(question);
	    let li = document.createElement("li");
	    li.id = "q-" + question.id;
	    li.classList.add("q-");
	    if(question.id == currentQuestion.id)
		li.classList.add("currentQuestion");
	    li.addEventListener("click", () => {
		console.log("sdfggfeer");gotoQuestion(question.indexSet);
	    });
	    li.class = ""+(question.id == currentQuestion.id);
	    li.textContent = question.enonce;
//	    MathJax.Hub.Queue(["Typeset",MathJax.Hub,li]);
	    ul.appendChild(li);
	});
	let old = document.querySelector("#chooseQFromSet");
	old.parentNode.replaceChild(ul,old);
    }
    // Dans tous les cas, on refait le check des petites marques blanches
    document.querySelectorAll(".q-").forEach((elem, index) => {
	if(questionList[index].answered)
	    elem.classList.add("answered");
	else
	    elem.classList.remove("answered");
    });
};
