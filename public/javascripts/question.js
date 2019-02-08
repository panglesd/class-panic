     // ICI ajouter les events listener
function addReponseListener(div) {
    div.querySelector(".remove").addEventListener("click", (ev) => {
	removeElement(div);
    });
    div.querySelectorAll("fieldset").forEach((f) => { addHideAndShow(f) });
}

function addHideAndShow(fieldset) {
    let i = 1;
    fieldset.querySelector("legend").addEventListener("click", (ev) => {
	i=1-i;
	fieldset.querySelector(".wrapperFieldset").style.display = i == 0 ? "none" : "";
    });
}

document.querySelectorAll(".reponse").forEach(addReponseListener);

// Le HTML d'une question

function points(sel, val) {
    let s = document.querySelector("#strategy");
    switch(s.value) {
    case "normal":
	if(val=="true" && sel == "selected") return "1";
	return "0";
    case "QCM":
	if(val=="true" && sel == "selected") return "1";
	if(val=="false" && sel == "selected") return "-1";
	return "0";
    case "hardQCM":
	if(val=="true" && sel == "selected") return "1";
	if(val=="false" && sel == "selected") return "-1";
	if(val=="true" && sel == "unselected") return "-1";
	return "0";
    default:
	return "";
    }
}

function returnHTMLQuestion (i) {

//    return    '<li class="reponse to_correct">'+
    return    '		<!--    Numéro de réponse                -->'+
'		<span class="froom nreponse"> Réponse '+i+' :</span>'+
'		<!--    Texte de la réponse              -->'+
'		<textarea'+
'		    rows="2"'+
'		    placeholder="Ne sera pas interprété par markdown. Pour les maths, utiliser \(...\) ou \[...\]"'+
'		    class="value-reponse-textarea"'+
'		    name="value-reponse-'+i+'"'+
'		    style="width:100%"></textarea>'+
'		<!--    Réponse custom ou non            -->'+
'		<fieldset>'+
'		    <legend>Type de question</legend>'+
'		    <div class="wrapperFieldset">'+
'			<input type="checkbox" class="texted-hidden" name="texted-'+i+'"> <label for="texted-'+i+'">Possède un champs texte.</label>'+
'			<input name="hasFile-'+i+'" type="checkbox"><span class="fileToggle">Ajouter un upload de fichier</span>'+
'		    </div>'+
'		</fieldset>'+
'		<!--    Peut-on rendre un fichier ?      -->'+
'		<fieldset>'+
'		    <legend>Correction</legend>'+
'		    <div class="wrapperFieldset">'+
'			Cette réponse est'+
'			<input type="radio" value="true" name="correctness-'+i+'" id="true-'+i+'"/>'+
'			<label for="true-'+i+'"> Juste </label>'+
'			<input checked type="radio" id="tocorrect-'+i+'" value="to_correct" name="correctness-'+i+'"/>'+
'			<label for="tocorrect-'+i+'"> À corriger </label>'+
'			<input type="radio" id="false-'+i+'"  value="false" name="correctness-'+i+'"/>'+
'			<label for="false-'+i+'"> Fausse </label>'+
'			<textarea'+
'			    rows="2"'+
'			    class="correction-textarea"'+
'			    name="correction-'+i+'"'+
'			    style="width:100%"'+
'			    placeholder="Commentaire ou correction" ></textarea>'+
'			<div'+
'			    class="text"'+
'			    style="text-align:left;margin:3px;">'+
'			    '+
'			    <!--		    <input name="multipleFile-'+i+'" type="checkbox">Multiple </span> -->'+
'			    <div>'+
'				<span style="font-size: 1em;">Ajouter des fichiers pour la correction : </span><input name="correcFile-'+i+'" multiple type="file">'+
'			    </div>'+
'			</div></div>		'+
'		</fieldset>		<!--    Coefficient                      -->'+
'		'+
'		<fieldset>'+
'		    <legend>Notation</legend>'+
'		    <div class="wrapperFieldset">'+
'			<div'+
'			    class="text"'+
'				   style="text-align:left;margin:3px;">'+
'			    Cette réponse est sur  <input style="width:30px;" name="max-points-'+i+'" type="number" value="1"> points.<br>'+
'			    <table>'+
'				<tr>'+
'				    <td></td>'+
'				    <td>Faux</td>'+
'				    <td>Juste</td></tr>'+
'				<tr>'+
'				    <td>Selectionnée</td>'+
'				    <td>'+ // Dépend de la stratégie en cours !
	'					<input style="width:30px;" name="selected-false-'+i+'" type="number" value="'+points("selected", "false")+'"> points par défaut'+
'				    </td>'+
'				    <td>'+
'					<input style="width:30px;" name="selected-true-'+i+'" type="number" value="'+points("selected", "true")+'"> points par défaut'+
'				    </td>'+
'				</tr>'+
'				<tr>'+
'				    <td>Non selectionnée</td>'+
'				    <td>'+
'					<input style="width:30px;" name="unselected-false-'+i+'" type="number" value="'+points("unselected", "false")+'"> points par défaut'+
'				    </td>'+
'				    <td>'+
'					<input style="width:30px;" name="unselected-true-'+i+'" type="number" value="'+points("unselected", "true")+'"> points par défaut'+
'				    </td>'+
'				</tr>'+
'			    </table>'+
'			</div>		'+
'		    </div>		</fieldset>	<!--    Boutons pour le management       -->'+
'		    <div>'+
'			<ul>'+
'			    <li style="display:inline-block; margin-right:20px;">'+
'				<a class="room remove">Enlever cette réponse</a>'+
'			    </li>'+
'			</ul>'+
	'		    </div>';//+
//	'	    </li>';
}

function addAnswer () {
    let ul = document.querySelector("#listeQue");
    let li = document.createElement("li");
    let liButton = document.querySelector("#ajoutrep");
    let n = document.querySelectorAll(".reponse").length;
    li.innerHTML=returnHTMLQuestion(n);
    li.classList.add("reponse", "to_correct");
    ul.insertBefore(li,liButton);
    addReponseListener(li);
}


// Avoir ou non un champs texte dans la réponse

function toggleText(elem) {
    let text = elem.querySelector(".text");
    text.classList.toggle("texted");
    let value = elem.querySelector(".texted-hidden").value = elem.querySelector(".texted-hidden").value=="true" ? "false" : "true";
    elem.querySelector(".correction-textarea").style.display = elem.querySelector(".correction-textarea").style.display=="block" ? "none" : "block";
    let text_string = text.querySelector("span");
    if(text_string.textContent == "Enlever le champs texte")
	text_string.textContent = "Ajouter un champs texte";
    else
	text_string.textContent = "Enlever le champs texte";
}
// Avoir ou non un fichier

function toggleFile(elem) {
    let text = elem.querySelector(".text");
    text.classList.toggle("texted");
    let value = elem.querySelector(".texted-hidden").value = elem.querySelector(".texted-hidden").value=="true" ? "false" : "true";
    elem.querySelector(".correction-textarea").style.visibility = elem.querySelector(".correction-textarea").style.visibility=="hidden" ? "visible" : "hidden";
    let text_string = text.querySelector("span");
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
    let q = document.querySelectorAll(".reponse");
    q.forEach(function (elem, i) {  
	elem.querySelector(".nreponse").innerHTML = "Réponse "+ i + " :";
	elem.querySelector(".value-reponse-textarea").name="value-reponse-"+i;
	elem.querySelector(".texted-hidden").name="texted-"+i;
	elem.querySelector(".correctness-hidden").name="correctness-"+i;
	elem.querySelector(".correction-textarea").name="correction-"+i;
    });
}

function removeElement(elem) {
    elem.remove();
    renumber();
}
