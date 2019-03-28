/*********************************************************************/
/*                 lorsque l'on reçoit une nouvelle question (admin) */
/*********************************************************************/

function afficheQuestion(question) {

    console.log("newQuestion", question);
    let enonce = document.querySelector("#question");
    if(enonce && enonce.getAttribute("questionID") == question.id) {
	return;
    }
    // On s'occupe du carré blanc
    let temp;
    if((temp = document.querySelector("li.currentQuestion"))) {
	temp.classList.remove("currentQuestion");
    }
    if((temp = document.querySelector("li#q-"+question.id)))
	temp.classList.add("currentQuestion");

    // On écrit l'énoncé là où il faut. MathJax rendered.
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
    // summaryWrapper.innerHTML += "Note finale : <span id='note'>N/A</span> Coefficient : <span id='coef'>N/A</span> "+"<ul class='criteresWrapper'>Critères : </ul>";
    summaryWrapper.innerHTML += "<span style='display:none' class='noteFinale'>Note finale : <span id='note'>N/A</span> Coefficient : <span id='coef'>N/A</span></span> "+(question.correcType == "globally" ? "<ul class='criteresWrapper'>Critères : </ul>" : "");
    console.log(summaryWrapper.innerHTML);
    summaryWrapper.style.display = "none";
    wrapper.appendChild(summaryWrapper);

    if(question.coef) {
	document.querySelector(".summary").style.display="";
	document.querySelector(".summary #coef").parentNode.style.display="";
	document.querySelector(".summary #coef").textContent = question.coef;
    }
    if(question.criteres && question.correcType == "globally") {
	question.criteres.forEach((critere, index) => {
	    let critereElem = document.createElement("li");
	    critereElem.classList.add("critere");
	    critereElem.innerHTML = "<span id='critereName-"+index+"' class='critereName'></span> : <span class='critereNote' id='critereNote-"+index+"'><input></input></span>%, coef : <span class='critereCoef' id='critereCoef-"+index+"'></span>";
	    critereElem.querySelector(".critereName").innerText = critere.name;
	    critereElem.querySelector(".critereCoef").innerText = critere.coef;
	    summaryWrapper.querySelector(".criteresWrapper").appendChild(critereElem);
	});
    }
    let globalComment = document.createElement("fieldset");
    globalComment.innerHTML = "<legend>Commentaire</legend><div class='globalComment'></div>";
    // globalComment.classList.add("globalComment");
    // let globalComment = document.createElement("div");
    // globalComment.innerHTML = "Commentaire global : <textarea style='width:100%;' rows=10 class='globalCommentArea'></textarea>";
    summaryWrapper.appendChild(globalComment);
};

function createResponse(question, rep, index) {
    // Création de l'élément HTML vide
    let elem = document.createElement('div');
    elem.classList.add("reponse");
    elem.classList.add("notSelected");
    elem.id = "r"+index;    
    // Si besoin est, ajout d'un event listener  A DEPLACER ?
    if(!rep.texted && rep.hasFile == "none" && typeof chooseAnswer == "function") {
	elem.addEventListener("click", function (ev) {
	    chooseAnswer(index);		    //updateAnswer(index, elem, true);
	});
    }
    // Création de l'élément contenant l'énoncé de la réponse
    let span = document.createElement("span");
    elem.innerHTML = "";
    span.innerHTML = md.render(rep.reponse);
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
		chooseAnswer(index);		    //updateAnswer(index, elem, true);
		//		    sendAnswer();
	    });
	}
	elem.appendChild(textarea);
    }
    // Ajout du texte de correction
    let correcWrapper = document.createElement("fieldset");
    correcWrapper.style.display = "none";
    correcWrapper.innerHTML = "<legend>Corrigé</legend><div class='correc'></div><div class='repCustomComment' style='display:none'><hr><span></span></div>";
    correcWrapper.classList.add("correcWrapper");
    // let legend = document.createElement("legend");
    // legend.innerText = "Corrigé";
    // correcWrapper.appendChild(legend);
    // let correc = document.createElement("div"); correc.classList.add("correc");
    // correcWrapper.appendChild(correc);
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

    let fileCorrecWrapper = document.createElement("fieldset");
    fileCorrecWrapper.classList.add("fileCorrecWrapper");
    fileCorrecWrapper.style.display="none";
    let legendCorrec = document.createElement("legend");
    legendCorrec.innerText = "Fichiers de correction";
    fileCorrecWrapper.appendChild(legendCorrec);
    elem.appendChild(fileCorrecWrapper);


    if(rep.validity)
	addCorrection(question, elem, rep, index);

    let buttonWrapper = document.createElement("div");
    buttonWrapper.classList.add("buttonWrapper");
    elem.appendChild(buttonWrapper);
    
    let customComment = document.createElement("textarea");
    customComment.id="customComment-"+index;
    customComment.classList.add("customComment");
    customComment.placeholder="Commentaires de correction";
    customComment.style.display = "none";
//    customComment.required=true; // HACK pour que customComment ne s'affiche que s'il contient quelque chose...
    if(typeof(setCustomComment) == "function") {
	customComment.addEventListener("input", (ev) => {
	    setCustomComment(index, customComment.value);
	});
    customComment.style.display = "";	
    }
//    elem.appendChild(document.createTextNode("Définir un commentaire personnel :"));
    elem.appendChild(customComment);
    let note = document.createElement("div");
    note.classList.add("note");
    elem.appendChild(note);
    return elem;
//    wrapper.appendChild(elem);
}

function addCorrection(question, elem, rep, index) {
    // Si la correction est présente
    if(rep.validity != "to_correct") {
	elem.classList.add(rep.validity);
	let repValidity;
	if(rep.validity == "true") repValidity = 1;
	if(rep.validity == "false") repValidity = 0;
	if(typeof(repValidity)=="number")
	    elem.style.boxShadow =  "0 0 8px 10px rgb("+ Math.floor(128*(1-repValidity)) +","+ Math.floor(128*repValidity)+",0)";
	else
	    elem.style.boxShadow =  "";
    }
    if(rep.correction){
	elem.querySelector(".correcWrapper").style.display = "";
	elem.querySelector(".correcWrapper .correc").innerText = rep.correction;
    }
    if(rep.correcFilesInfo.length>0) {
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
    return elem;
}

function addAdminInterface(question, setValidity, setGlobalGrade, setAutoCorrect, gradeCriteria, setGlobalComment){
    let wrapper = document.querySelector("#wrapperAnswer");
    if(question.correcType == "answerByAnswer") {
	question.reponses.forEach((rep, index) => {
	    let elemRep = document.querySelector("#r"+index+ " .buttonWrapper");
	    elemRep.innerHTML = "";
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
	    // let noteCust = document.createElement("span"); noteCust.innerText = " Note custom : "; noteCust.style.fontSize = "19px";
	    // let customNote = document.createElement("input");
	    // customNote.type="number";
	    // customNote.id="customNote-"+index;
	    // elemRep.appendChild(noteCust);
	    // elemRep.appendChild(customNote);
	    let vraiFaux = document.createElement("span"); vraiFaux.innerText = " Réussite sur 1 : "; vraiFaux.style.fontSize = "19px";
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
	    document.querySelector("#r"+index+ " .customComment").style.display = "";
	    
	    // let note = document.createElement("div");
	    // note.classList.add("note");
	    // elemRep.appendChild(note);
	});
    }
    let summary = document.querySelector(".summary");
    let globalComment = document.createElement("div");
    globalComment.innerHTML = "Commentaire global : <textarea style='width:100%;' rows=10 class='globalCommentArea'></textarea>";
    globalComment.querySelector("textarea").addEventListener("input", (ev) => {
	setGlobalComment(globalComment.querySelector("textarea").value);
    });
    summary.appendChild(globalComment);
    let customMarkWrapper = document.createElement("div");
    customMarkWrapper.innerHTML = "Choisir la note : <input type='number' id='mark' step='0.1'>"+"<div style='display:none' class='reautomatiser'>La note est choisie par le correcteur <input type='button' class='strategy' value='Calculer la note automatiquement'></div>";
    let mark = customMarkWrapper.querySelector("#mark");
    if(mark) {
	mark.addEventListener("input", (ev) => {setGlobalGrade(parseFloat(mark.value));});
    }
    let reAuto = customMarkWrapper.querySelector(".strategy");
    if(reAuto) {
	reAuto.addEventListener("click", (ev) => {setAutoCorrect();});
    }
    summary.appendChild(customMarkWrapper);
    summary.querySelectorAll(".critere").forEach((critereElem, index) => {
	critereElem.querySelector(".critereNote").innerHTML = "<input type='number' step='0.1' class='critereInput' id='critereInput-"+index+"'>";
	let critInput = critereElem.querySelector(".critereInput");
	critInput.addEventListener("change", (ev) => {
	    gradeCriteria(index, parseFloat(critInput.value));
	});
    });
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
	let questReponse = currentQuestion.reponses[index];
	let elemReponse = document.querySelectorAll("#wrapperAnswer .reponse")[index];
	elemReponse.classList.remove("notSelected");
	elemReponse.classList.remove("selected");
	elemReponse.classList.add(submReponse.selected ? "selected" : "notSelected");
	
	let ta = elemReponse.querySelector("textarea");
	if(ta)
	    ta.value = submReponse.text;
	//    });
	if(elemReponse.querySelector(".filesInfo")) {
	    affFileInfo(elemReponse,submReponse.filesInfo,index);
	}
	elemReponse.classList.remove("to_correct", "true", "false");
	// if(reponse.validity) {
	//     elemReponse.classList.add(reponse.validity);
	// }
	if(typeof(submReponse.validity) != "number" && typeof(submReponse.validity) != "undefined")
	    submReponse.validity = questReponse.validity == "true" ? 1 : (questReponse.validity == "false" ? 0 : "?");
	if(typeof(submReponse.validity) == "number") {
	    elemReponse.style.boxShadow =  "0 0 8px 10px rgb("+ Math.floor(188*(1-submReponse.validity)) +","+ Math.floor(138*submReponse.validity)+",0)";
	    let temp;
	    if((temp = elemReponse.querySelector(".pourcentage")))
		temp.value = submReponse.validity;
	}
	else if (submReponse.validity == "?"){
	    elemReponse.style.boxShadow =  "";
	    // elemReponse.querySelector(".pourcentage").value = "";
	}
	if(submReponse.customComment) {
	    elemReponse.querySelector(".correcWrapper").style.display = "";
	    elemReponse.querySelector(".repCustomComment").style.display = "";
	    elemReponse.querySelector(".repCustomComment span").innerText = submReponse.customComment;
	    elemReponse.querySelector(".customComment").value = submReponse.customComment;
	    // elemReponse.querySelector(".customComment").style.display = "";
	}
	let maxPoints = questReponse.maxPoints;
	// if(questReponse.validity == "true")
	//     maxPoints = Math.max(questReponse.strategy.selected.vrai,
	// 			 questReponse.strategy.unselected.vrai);
	// else if (questReponse.validity == "false")
	//     maxPoints = Math.max(questReponse.strategy.selected.faux,
	// 			 questReponse.strategy.unselected.faux);
	// else 
	//     maxPoints = Math.max(questReponse.strategy.selected.vrai,
	// 			 questReponse.strategy.selected.faux,
	// 			 questReponse.strategy.unselected.vrai,
	// 			 questReponse.strategy.unselected.faux);
//	totalMaxPoints += maxPoints;
	if(typeof(submReponse.validity)=="number" && currentQuestion.correcType=="answerByAnswer") {
	    console.log("c'est un  nombre !" );
	    let note = "";
	    if(submReponse.selected) 
		note = submReponse.validity*questReponse.strategy.selected.vrai + (1-submReponse.validity)* questReponse.strategy.selected.faux;
	    else
		note = submReponse.validity*questReponse.strategy.unselected.vrai + (1-submReponse.validity)* questReponse.strategy.unselected.faux;
	    totalPoints += note;
	    let temp;
	    if((temp = elemReponse.querySelector(".note")))
		temp.innerText = parseFloat(note.toFixed(2))+"/"+maxPoints;
	}
	// Ici gérer les corrections personnelles par reponse
	// elemReponse.querySelector(".correcPerso").innerText = reponse.correcPerso
    });
    if(submission.correct) {
	document.querySelector(".summary").style.display="";
	let noteFinale = document.querySelector("#note");
	noteFinale.parentNode.style.display = "";
	noteFinale.textContent = submission.correct+"/"+currentQuestion.maxPoints; // totalMaxPoints;
	let mark = document.querySelector(".summary #mark");
	if(mark)
	    mark.value = submission.correct;
	let autoCalcul = document.querySelector(".summary .reautomatiser");
	if(autoCalcul) {
	    if(submission.strategy == "manual")
		autoCalcul.style.display = "";
	    else 
		autoCalcul.style.display = "none";
	}
    }
    if(submission.globalInfo && (submission.globalInfo.criteria || submission.globalInfo.comment)) {
	let summary = document.querySelector(".summary");
	summary.style.display="";
	if(summary.querySelector(".globalCommentArea"))
	    summary.querySelector(".globalCommentArea").value = submission.globalInfo.comment;
	summary.querySelector(".globalComment").innerText = submission.globalInfo.comment;
	if(submission.globalInfo.criteria) {
	    let critereElems = summary.querySelectorAll(".critere");
	    submission.globalInfo.criteria.forEach((critere, index) => {
		critereElems[index].querySelector(".critereNote").firstChild.value = critere;
	    });
	}
    }
//	autoCalcul.value = submission.strategy == "manual" ? "Automatiser la correction" : "Choisir une note fixe";
//	autoCalcul
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
	let fileInfoElem = document.createElement("li");
	fileInfoElem.innerHTML = "<table><tr><td>Fichier : </td><td style='padding-left: 10px;'  ><a target='blank' class='fileName' style='color:blue' href='filePerso/"+currentQuestion.id+"/"+n_ans+"/"+(typeof(currentStudent)!="undefined" ? (currentStudent.id+"/" ): "")+fileInfo.fileName+"'></a></td></tr>"+
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
	    let li = document.createElement("li");
	    li.id = "q-" + question.id;
	    li.classList.add("q-");
	    if(question.id == currentQuestion.id)
		li.classList.add("currentQuestion");
	    li.addEventListener("click", () => {
		gotoQuestion(question.indexSet);
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
