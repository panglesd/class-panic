function toggleText(elem) {
    elem.classList.toggle("texted");
    value = elem.querySelector("input").value = elem.querySelector("input").value=="true" ? "false" : "true";
    elem.nextSibling.style.visibility = elem.nextSibling.style.visibility=="hidden" /* && elem.parentNode.classList.contains("true")*/ ? "visible" : "hidden";
    text = elem.querySelector("span")
    if(text.textContent == "Enlever le champs texte")
	text.textContent = "Ajouter un champs texte";
    else
	text.textContent = "Enlever le champs texte";
}

function returnTextQuestion (i) {
    return '<div style="text-align:left;margin:3px;" onclick="toggleText(this)"><input type="hidden" name="text-'+i+'" value="false"><span>Ajouter un champs texte</span></div><textarea name="correction-'+i+'" style="visibility:hidden; display:block; width:100%" placeholder="Vous pouvez rentrer la correction/justification/explication" ></textarea>'
}

function addAnswer () {
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

function setTrue(elem) {
    a=document.querySelector(".true");
    isMultiAnswer = document.querySelector("#multi").checked;
    if (a && !isMultiAnswer)
	a.classList.remove("true");
    elem.parentNode.parentNode.parentNode.classList.add("true");
    //     document.querySelector("#true").value=elem.parentNode.parentNode.parentNode.querySelector("textarea").id;
    document.querySelector("#true").value=document.querySelector(".true textarea").id;
}

function renumber() {
    i=0;
    q = document.querySelectorAll(".nreponse");
    q.forEach(function (elem) {  
	elem.previousElementSibling.innerHTML = "Réponse "+ i + " :";
	elem.name=""+i;
	elem.id=""+i;
	i++;
    });
    document.querySelector("#true").value=document.querySelector(".true textarea").id;
}
function removeElement(elem) {
    elem.parentNode.parentNode.parentNode.parentNode.remove();
    renumber();
}

function toggleMultiAnswer() {
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
