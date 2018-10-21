// Le HTML d'une question

function returnHTMLQuestion (i) {
    return '	<!--    Regroupement des champs hidden   -->'+
'		<input type="hidden" class="texted-hidden" name="texted-'+i+'" value="false">'+
'		<input type="hidden" class="correctness-hidden" name="correctness-'+i+'" value="false">'+
'	<!--    Numéro de réponse                -->'+
'		<span class="froom nreponse"> Réponse '+i+' :</span>'+
'	<!--    Texte de la réponse              -->'+
'		<textarea'+
'		    placeholder="Ne sera pas interprété par markdown. Pour les maths, utiliser \(...\) ou \[...\]"'+
'		    class="value-reponse-textarea" name="value-reponse-'+i+'"'+
'		    style="width:100%"></textarea>'+
'	<!--    Réponse custom ou non            -->'+
'		<div'+
'		    class="text"'+
'		    style="text-align:left;margin:3px;">'+
'		    <span>Ajouter un champs texte</span>'+
'		</div>'+
'		<textarea'+
'		    class="correction-textarea"'+
'		    name="correction-'+i+'"'+
'		    style="visibility:hidden;display:block; width:100%"'+
'		    placeholder="Vous pouvez rentrer la correction/justification/explication" ></textarea>'+
'	<!--    Boutons pour le management       -->'+
'		    <div>'+
'			<ul>'+
'			    <li style="display:inline-block; margin-right:20px;">'+
'				<a class="room remove">Enlever cette réponse</a>'+
'			    </li>'+
'			    <li class="set-true select" >'+
'				Réponse juste'+
'			    </li>'+
'			    <li class="set-to_correct select" >'+
'				Réponse à corriger'+
'			    </li>'+
'			    <li class="set-false select selected" >'+
'				Réponse fausse'+
'			    </li>'+
'			</ul>'+
'		    </div>'+
'';
}

function addAnswer () {
    ul = document.querySelector("#listeQue");
    li = document.createElement("li");
    liButton = document.querySelector("#ajoutrep");
    n = document.querySelectorAll(".reponse").length;
    li.innerHTML=returnHTMLQuestion(n);
    li.classList.add("reponse", "false")
    ul.insertBefore(li,liButton);
    addReponseListener(li);
}


// Avoir ou non un champs texte dans la réponse

function toggleText(elem) {
    text = elem.querySelector(".text");
    text.classList.toggle("texted");
    value = elem.querySelector(".texted-hidden").value = elem.querySelector(".texted-hidden").value=="true" ? "false" : "true";
    elem.querySelector(".correction-textarea").style.visibility = elem.querySelector(".correction-textarea").style.visibility=="hidden" ? "visible" : "hidden";
    text_string = text.querySelector("span")
    if(text_string.textContent == "Enlever le champs texte")
	text_string.textContent = "Ajouter un champs texte";
    else
	text_string.textContent = "Enlever le champs texte";
}

// Régler si une réponse est correcte, fausse ou à corriger

function setValue(value, elem) {
    elem.classList.remove("true", "false", "to_correct");
    elem.classList.add(value);
    elem.querySelector(".correctness-hidden").value = value;
    elem.querySelector(".select.selected").classList.remove("selected");
    elem.querySelector(".set-"+value).classList.add("selected");
}

// Pour la numérotation des réponses et des names

function renumber() {
    i=0;
    q = document.querySelectorAll(".reponse");
    q.forEach(function (elem) {  
	elem.querySelector(".nreponse").innerHTML = "Réponse "+ i + " :";
	elem.querySelector(".value-reponse-textarea").name="value-reponse-"+i;
	elem.querySelector(".texted-hidden").name="texted-"+i;
	elem.querySelector(".correctness-hidden").name="correctness-"+i;
	elem.querySelector(".correction-textarea").name="correction-"+i;
	i++;
    });
}

function removeElement(elem) {
    elem.remove();
    renumber();
}

/*************************************************/
/*    OLD                                     ****/
/*************************************************/




function returnTextQuestionOLD (i) {
    return '<div style="text-align:left;margin:3px;" onclick="toggleText(this)"><input type="hidden" name="text-'+i+'" value="false"><span>Ajouter un champs texte</span></div><textarea name="correction-'+i+'" style="visibility:hidden; display:block; width:100%" placeholder="Vous pouvez rentrer la correction/justification/explication" ></textarea>'
}

function addAnswerOLD () {
    a=document.querySelector("#listeQue");
    b = document.createElement("li");
    c=document.querySelector("#ajoutrep");
    d = document.querySelectorAll(".reponse");
    n=d.length;
    b.innerHTML="<span class=\"froom\"> Réponse "+(n)+" :</span><textarea placeholder=\"Ne sera pas interprété par markdown. Pour les maths, utiliser \\(...\\) ou \\[...\\]\" class=\"nreponse\" name=\""+n+"\" id=\""+n+"\" style=\"width:100%\"></textarea>"+returnTextQuestion(n)+"<div><ul><li style=\"display:inline-block; margin-left:20px;\"><a class=\"room\" onclick=\"removeElement(this)\">Enlever cette réponse</a></li><li style=\"display:inline-block; margin-left:20px;\" onclick=\"setTrue(this)\">Choisir comme réponse correcte</li></ul></div>";
    //     b.style="background-color:rgba(75,0,0,0.5)";
    b.classList.add("reponse");
    a.insertBefore(b,c);
}

function setValueOLD(value, elem) {
/*    isMultiAnswer = document.querySelector("#multi").checked;
    if (!isMultiAnswer) {
	let a=document.querySelector(".true");
	if(a) {
	    a.classList.replace("true", "false");
	    a.querySelector(".set-true").classList.remove("selected");
	    a.querySelector(".set-false").classList.add("selected");
	}
    }*/
    elem.classList.remove("true", "false", "to_correct");
    elem.classList.add(value);
    elem.querySelector(".select.selected").classList.remove("selected");
    elem.querySelector(".set-"+value).classList.add("selected");
    //     document.querySelector("#true").value=elem.parentNode.parentNode.parentNode.querySelector("textarea").id;
//    document.querySelector("#true").value=document.querySelector(".true textarea").id;
}

function renumberOLD() {
    i=0;
    q = document.querySelectorAll(".reponse");
    q.forEach(function (elem) {  
	elem.querySelector(".nreponse").innerHTML = "Réponse "+ i + " :";
	elem.querySelector("value-reponse").name=""+i;
	elem.querySelector("value-reponse").id=""+i;
	i++;
    });
//    document.querySelector("#true").value=document.querySelector(".true textarea").id;
}

function toggleMultiAnswerOLD() {
    isMultiAnswer = document.querySelector("#multi").checked;
    if(isMultiAnswer) {
	document.querySelectorAll(".correct").forEach((button) => {
	    button.textContent = "Changer valeur de vérité";
	});
	
    }
    else {
	document.querySelectorAll(".correct").forEach((button) => {
	    button.textContent = "Choisir comme réponse correcte";
	});
	
    }
    
}
