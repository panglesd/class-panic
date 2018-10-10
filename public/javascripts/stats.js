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

socketStats.on("newStats", (filter, res) => {
    console.log("on a reçu :", filter, res);
    wrapper = document.querySelector("#wrapper-stats");
    wrapper.innerHTML = "<table>";
    res.forEach((data) => {
	data.enonce = JSON.parse(data.customQuestion).enonce
	if(data.response>-1)
	    data.responseText = JSON.parse(data.customQuestion).reponses[data.response].reponse + " " + data.responseText
	else
	    data.responseText = "Non répondu"
    });
    
    var table = new Tabulator("#wrapper-stats", {
	//	 layout:"fitColumns", //fit columns to width of table (optional)
	columns:[ //Define Table Columns
	    {title:"Eleve", field:"fullName"},
	    {title:"Enonce", field:"enonce"},
	    //		   {title:"Réponse", field:"responseText"},
	    {title:"Réponse perso", field:"responseText"},
	    {title:"Justesse", field:"correct"},
	    {title:"Instance de Question", field:"blocID"},
	    {title:"Question", field:"questionID"},
	    {title:"Cours", field:"courseID"},
	    {title:"Salle", field:"roomID"},
	    {title:"Date", field:"time"}
	]
    });
    table.setData(res);
    
});
update();
document.querySelector("#statsForm").addEventListener('change', (ev) => {
    update();
});

