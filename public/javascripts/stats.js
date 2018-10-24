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
//	data.response = [{n:1, text:"eo"},{n:3, text:"eablado"}]
//	data.response = 2
	console.log("now", data);
	data.response.forEach((reponse, index) => {
	    if(index==0) {
		innerHTML += "<tr><td rowspan='"+data.response.length+"'> " + data.fullName + "</td>" +
		"<td rowspan='"+data.response.length+"'> " + data.enonce + "</td>"
		    //		"<tr><td rowspan='"+data.response.length+"'> " + data.fullName + "</td>" +
	    }
	    innerHTML += "<td> " + data.customQuestion.reponses[reponse.n].reponse +"</td>" +
		"<td> " + reponse.text +"</td>"
	    if(index==0) {
		innerHTML += "<td rowspan='"+data.response.length+"'> " + data.correct + "</td>";
		let d = new Date(Date.parse(data.time));
		let options = {weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "numeric", minute:"numeric"};
		innerHTML += "<td rowspan='"+data.response.length+"'> " + d.toLocaleDateString('fr-FR', options) + "</td>"
		//		"<tr><td rowspan='"+data.response.length+"'> " + data.fullName + "</td>" +
	    }
	    innerHTML += "</tr>"
	});
    })
    table.innerHTML = "<tr><th>Nom</th><th>Énoncé</th><th>Réponse</th><th>Justification</th><th>Correction</th><th>Date</th></tr>"+
	innerHTML
    wrapper.appendChild(table)
    
});
update();
document.querySelector("#statsForm").addEventListener('change', (ev) => {
    update();
});

