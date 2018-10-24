var socketStats = io.connect(server+'/stats');

function update() {
    filter = {};
    
    list = ["studentNumber",
	    "studentName",
	    "courseID",
	    "roomID",
	    "setID",
	    "questionID",
	    "dateBegin",
	    "dateEnd"];
    
    list.forEach(function (cond) {
	//	 console.log(cond);
	window[cond] = document.querySelector("#"+cond);
	console.log(window[cond]);
	console.log(window[cond].value);
	if(window[cond].value)
	    filter[cond] = window[cond].value
    });
    socketStats.emit("stats", filter);
    
    console.log("filter", filter);
}

socketStats.on("newStats", (filter, res2) => {
    res=res2
    console.log("on a reçu :", filter, res);
    wrapper = document.querySelector("#wrapper-stats");
    wrapper.innerHTML = "<table>";
/*    res.forEach((data) => {
	data.customQuestion = JSON.parse(data.customQuestion);
	data.enonce = data.customQuestion.enonce
	data.response = JSON.parse(data.response)
    });
  */  
/*    var table = new Tabulator("#wrapper-stats", {
	//	 layout:"fitColumns", //fit columns to width of table (optional)
	columns:[ //Define Table Columns
	    {title:"Eleve", field:"fullName"},
	    {title:"Enonce", field:"enonce"},
	    {title:"Réponse perso", field:"response"},
	    {title:"Justesse", field:"correct"},
	    {title:"Instance de Question", field:"blocID"},
	    {title:"Question", field:"questionID"},
	    {title:"Cours", field:"courseID"},
	    {title:"Salle", field:"roomID"},
	    {title:"Date", field:"time"}
	]
    });
    table.setData(res);*/
    wrapper = document.querySelector("#wrapper-stats");
    table = document.createElement("table");
    innerHTML = ""
    res.forEach((data2, inde) => {
	data = data2
	data.customQuestion = JSON.parse(data.customQuestion);
	data.enonce = data.customQuestion.enonce
	data.response = JSON.parse(data.response)
	data.room = JSON.parse(data.roomText)
	data.set = JSON.parse(data.setText)
//	data.response = [{n:1, text:"eo"},{n:3, text:"eablado"}]
//	data.response = 2
	console.log("now", data);
	if(data.response.length==0) {
	    innerHTML += "<tr style='background-color:rgba("+((1-score)*255)+","+(score*255) +",0,0.5)'>"
	    innerHTML += "<td  class='user'  studentNumber='"+data.studentNumber+"' id='user-"+data.userID+"'> " + data.fullName + "<span class='studentNumber' id='studentNumber-"+data.studentNumber+"'></span></td>" +
		"<td class='enonce' id='enonce-"+data.questionID+"'> " + data.enonce + "</td>"
	    innerHTML += "<td> Aucune réponse </td>" +
		"<td></td>"
	    innerHTML += "<td class='room' id='room-"+data.roomID+"'> " + data.room.name + "</td>";
	    console.log("data", data);
	    innerHTML += "<td class='set' id='set-"+data.setID+"'> " + (typeof data.set != "undefined" ? data.set.name : "") + "</td>";
	    innerHTML += "<td> " + data.correct + "</td>";
	    let d = new Date(Date.parse(data.time));
	    let options = {weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "numeric", minute:"numeric"};
	    innerHTML += "<td> " + d.toLocaleDateString('fr-FR', options) + "</td>"
	    innerHTML += "</tr>"
	}
	data.response.forEach((reponse, index) => {
	    score = Math.random()
	    innerHTML += "<tr style='background-color:rgba("+((1-score)*255)+","+(score*255) +",0,0.5)'>"
	    if(index==0) {
		innerHTML += "<td rowspan='"+data.response.length+"'  class='user'  id='user-"+data.userID+"'> " + data.fullName + "<span class='studentNumber' id='studentNumber-"+data.studentNumber+"'></span></td> " +
		    "<td rowspan='"+data.response.length+"' class='enonce' id='enonce-"+data.questionID+"'> " + data.enonce + "</td>"
		//		"<tr><td rowspan='"+data.response.length+"'> " + data.fullName + "</td>" +
	    }
	    innerHTML += "<td> " + data.customQuestion.reponses[reponse.n].reponse +"</td>" +
		"<td> " + reponse.text +"</td>"
	    if(index==0) {
		innerHTML += "<td rowspan='"+data.response.length+"' class='room' id='room-"+data.roomID+"'> " + data.room.name + "</td>";
		console.log("data", data);
		innerHTML += "<td rowspan='"+data.response.length+"' class='set' id='set-"+data.setID+"'> " + (typeof data.set != "undefined" ? data.set.name : "") + "</td>";
		innerHTML += "<td rowspan='"+data.response.length+"'> " + data.correct + "</td>";
		let d = new Date(Date.parse(data.time));
		let options = {weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "numeric", minute:"numeric"};
		innerHTML += "<td rowspan='"+data.response.length+"'> " + d.toLocaleDateString('fr-FR', options) + "</td>"
		//		"<tr><td rowspan='"+data.response.length+"'> " + data.fullName + "</td>" +
	    }
	    innerHTML += "</tr>"
	});
    })
    table.innerHTML = "<tr><th>Nom</th><th>Énoncé</th><th>Réponse</th><th>Justification</th><th>Salle</th><th>Set</th><th>Correction</th><th>Date</th></tr>"+
	innerHTML
    table.querySelectorAll("td.set").forEach((td) => {
	td.addEventListener("click", (ev) => {
	    console.log(td.id.split("set-")[1]);
	    if(document.querySelector("#setID").value ==td.id.split("set-")[1])
		document.querySelector("#setID").value = ""
	    else
		document.querySelector("#setID").value=td.id.split("set-")[1]
	    update()
	})
    });
    table.querySelectorAll("td.room").forEach((td) => {
	td.addEventListener("click", (ev) => {
	    console.log(td.id.split("room-")[1]);
	    if(document.querySelector("#roomID").value ==td.id.split("room-")[1])
		document.querySelector("#roomID").value = ""
	    else
		document.querySelector("#roomID").value=td.id.split("room-")[1]
	    update()
	})
    });
    table.querySelectorAll("td.user").forEach((td) => {
	td.addEventListener("click", (ev) => {
	    console.log(td.id.split("user-")[1]);
	    if(document.querySelector("#studentNumber").value ==td.querySelector(".studentNumber").id.split("studentNumber-")[1])
		document.querySelector("#studentNumber").value = ""
	    else
		document.querySelector("#studentNumber").value=td.querySelector(".studentNumber").id.split("studentNumber-")[1]
	    update()
	})
    });
    table.querySelectorAll("td.enonce").forEach((td) => {
	td.addEventListener("click", (ev) => {
	    console.log(td.id.split("enonce-")[1]);
	    if(document.querySelector("#questionID").value ==td.id.split("enonce-")[1])
		document.querySelector("#questionID").value = ""
	    else
		document.querySelector("#questionID").value=td.id.split("enonce-")[1]
	    update()
	})
    });
    wrapper.appendChild(table)
    
});
update();
document.querySelector("#statsForm").addEventListener('change', (ev) => {
    update();
});

