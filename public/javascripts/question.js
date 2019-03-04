String.prototype.trunc = String.prototype.trunc ||
      function(n){
          return (this.length > n) ? this.substr(0, n-1) + '...' : this;
      };
// ICI ajouter les events listener
function addReponseListener(div) {
    div.querySelector(".remove").addEventListener("click", (ev) => {
	removeElement(div);
    });
    div.querySelectorAll("fieldset").forEach((f) => { addHideAndShow(f); });
}

function addHideAndShow(fieldset) {
    let i = 1;
    let f = (ev) => {
	i=1-i;
	let legend = fieldset.querySelector("legend");
	if(i==0) {
	    fieldset.querySelector(".wrapperFieldset").style.display = i == 0 ? "none" : "";
	    // let oldLegend = legend.querySelector(".legend").innerText;
	    // legend.innerHTML = " <span class='textLegend'>Possède une champs texte</span>  <span class='fileLegend'>Possède un upload de fichiers</span> <span class='validity'></span> <span class='correction'></span> <span class='correcFichiers'></span> <span class='coefLegend'></span><span class='notaDetails'></span>";
	    let temp;
	    if((temp = fieldset.querySelector(".texted"))) {
		legend.querySelector(".textLegend").innerText = temp.checked ? "Avec champs texte" : "Sans champs texte";
		legend.querySelector(".textLegend").classList.remove("hidden");
	    }
	    if((temp = fieldset.querySelector(".filed"))) {
		legend.querySelector(".fileLegend").innerText = temp.checked ? "Avec upload de fichiers" : "Sans upload de fichiers";
		legend.querySelector(".fileLegend").classList.remove("hidden");
	    }
	    if((temp = fieldset.querySelector("input[type=radio]:checked"))) {
		legend.querySelector(".validity").innerText = "Par défaut : "+ (temp.value == "true" ? "Juste" : (temp.value=="false" ? "Fausse":"À corriger"));
		legend.querySelector(".validity").classList.remove("hidden");
	    }
	    if((temp = fieldset.querySelector("textarea.correction-textarea"))) {
		if(temp.value)
		    legend.querySelector(".correction").innerText = "Correction : "+temp.value.trunc(50);
		else
		    legend.querySelector(".correction").innerText = "Pas de correction texte";
		legend.querySelector(".correction").classList.remove("hidden");
	    }
	    if((temp = fieldset.querySelector(".coef[type=number]"))) {
		legend.querySelector(".coefLegend").innerText = "Coef : "+temp.value;
		legend.querySelector(".coefLegend").classList.remove("hidden");
	    }
	    if((temp = fieldset.querySelector("table"))) {
		legend.querySelector(".notaDetails").innerText = "Selectionné : ✔ "+temp.querySelectorAll("input[type=number]")[1].value+", ✘ "+temp.querySelectorAll("input[type=number]")[0].value+", non selectionné : ✔ "+temp.querySelectorAll("input[type=number]")[3].value+", ✘ "+temp.querySelectorAll("input[type=number]")[2].value;
		legend.querySelector(".notaDetails").classList.remove("hidden");
	    }

	}
	else {
	    legend.querySelectorAll("span").forEach((elem)=>{elem.classList.add("hidden");});
	    legend.querySelector(".legend").classList.remove("hidden");
	    fieldset.querySelector(".wrapperFieldset").style.display = i == 0 ? "none" : "";
	}
    };
    f();
    fieldset.querySelector("legend").addEventListener("click", f);
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
'		<fieldset class="fieldTypeDeQuestion">'+
'		    <legend><span class="legend"> Type de question</span>  <span class="hidden textLegend">Champs texte</span>  <span class="hidden fileLegend">Upload de fichiers</span> <span class="hidden validity"></span> <span class="hidden correction"></span> <span class="hidden correcFichiers"></span> <span class="hidden coefLegend"></span><span class="hidden notaDetails"></span></legend>'+
'		    <div class="wrapperFieldset">'+
'			<input class="texted" type="checkbox" class="texted-hidden" name="texted-'+i+'"> <label for="texted-'+i+'">Possède un champs texte.</label>'+
'			<input class="filed" name="hasFile-'+i+'" type="checkbox"><span class="fileToggle">Ajouter un upload de fichier</span>'+
'		    </div>'+
'		</fieldset>'+
'		<!--    Peut-on rendre un fichier ?      -->'+
'		<fieldset class="fieldCorrection">'+
'		    <legend><span class="legend"> Correction</span> <span class="hidden textLegend">Champs texte</span>  <span class="hidden fileLegend">Upload de fichiers</span> <span class="hidden validity"></span> <span class="hidden correction"></span> <span class="hidden correcFichiers"></span> <span class="hidden coefLegend"></span><span class="hidden notaDetails"></span></legend>'+
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
'		<fieldset class="fieldCorrection">'+
'		    <legend><span class="legend">Notation</span> <span class="hidden textLegend">Champs texte</span>  <span class="hidden fileLegend">Upload de fichiers</span> <span class="hidden validity"></span> <span class="hidden correction"></span> <span class="hidden correcFichiers"></span> <span class="hidden coefLegend"></span><span class="hidden notaDetails"></span></legend>'+
'		    <div class="wrapperFieldset">'+
'			<div'+
'			    class="text"'+
'				   style="text-align:left;margin:3px;">'+
'			    Cette réponse est sur  <input style="width:30px;" name="max-points-'+i+'" type="number" value="1"> points, et a pour coef  <input class="coef" style="width:30px;" name="coef-rep-'+i+'" type="number" value="1">.<br>'+
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

// function toggleText(elem) {
//     let text = elem.querySelector(".text");
//     text.classList.toggle("texted");
//     let value = elem.querySelector(".texted-hidden").value = elem.querySelector(".texted-hidden").value=="true" ? "false" : "true";
//     elem.querySelector(".correction-textarea").style.display = elem.querySelector(".correction-textarea").style.display=="block" ? "none" : "block";
//     let text_string = text.querySelector("span");
//     if(text_string.textContent == "Enlever le champs texte")
// 	text_string.textContent = "Ajouter un champs texte";
//     else
// 	text_string.textContent = "Enlever le champs texte";
// }

// Avoir ou non un fichier

// function toggleFile(elem) {
//     let text = elem.querySelector(".text");
//     text.classList.toggle("texted");
//     let value = elem.querySelector(".texted-hidden").value = elem.querySelector(".texted-hidden").value=="true" ? "false" : "true";
//     elem.querySelector(".correction-textarea").style.visibility = elem.querySelector(".correction-textarea").style.visibility=="hidden" ? "visible" : "hidden";
//     let text_string = text.querySelector("span");
//     if(text_string.textContent == "Enlever le champs texte")
// 	text_string.textContent = "Ajouter un champs texte";
//     else
// 	text_string.textContent = "Enlever le champs texte";
// }

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
