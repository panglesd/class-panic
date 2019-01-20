//var socket = io.connect(server+'/users');
var socket = io.connect('https://wim.choum.net/users');

/*********************************************************************/
/*                 Actions à effectuer à toute connection            */
/*********************************************************************/

// On informe le serveur dans quel room on est
socket.on('connect', () => {
//    socket.emit("chooseCourse", courseID);
    callSearch();
});


socket.on("users", (list) => {
    console.log(list) ;
    let wrap = document.querySelector("#wrapper-student-list");
    let ul = document.createElement("ul");
    list.forEach((student) => {
	let li = document.createElement("li");
	li.textContent = student.fullName+" ("+student.studentNumber+"), " + "eleve de "+student.institution+", promotion "+student.promotion+"/"+(student.promotion+1);
	if (student.courseID)
	    li.style.color="red";
	if (student.isTDMan)
	    li.style.color="green";
	if (student.id == course.ownerID)
	    li.style.color="orange";
	
	li.id = student.id;
	li.onclick = (event) => {event.target.classList.toggle("selected-for-subscription");};
	li.classList.add("room");
	ul.appendChild(li);
    });
    wrap.innerHTML = '';
    wrap.appendChild(ul);
    
});

function callSearch() {
     let name = document.querySelector("#name").value;
     let n_etu = document.querySelector("#n_etu").value;
     let promotion = document.querySelector("#promotion").value;
     let institution = document.querySelector("#institution").value;
     searchStudent(name, n_etu, promotion, institution);
 }
function searchStudent(name, n_etu, promotion, institution) {
    let search = {
	name:name,
	n_etu:n_etu,
	promotion:promotion,
	institution:institution
    }
    socket.emit("getUser", courseID, search);

}

function subscribeStudent() {
    let l = document.querySelectorAll("#wrapper-student-list ul li.selected-for-subscription");
    let arr = Array.from(l);
    console.log("arr is", arr);
    socket.emit("subscribeList", courseID, arr.map((e) => { return parseInt(e.id)}));
    // Prevenir l'utilisateur de l'inscription
}
function subscribeTDMan() {
    let l = document.querySelectorAll("#wrapper-student-list ul li.selected-for-subscription");
    let arr = Array.from(l);
    console.log("arr is", arr);
    console.log({
		    canOwnRoom: document.querySelector("#canOwnRoom").checked,
		    canAllRoom: document.querySelector("#canAllRoom").checked,
		    canOwnSet: document.querySelector("#canOwnSet").checked,
		    canAllSet: document.querySelector("#canAllSet").checked,
		    canSubscribe: document.querySelector("#canSubscribe").checked
    });
    socket.emit("subscribeListTDMan", courseID, arr.map((e) => { return parseInt(e.id)}),
		{
		    canOwnRoom: document.querySelector("#canOwnRoom").checked,
		    canAllRoom: document.querySelector("#canAllRoom").checked,
		    canOwnSet: document.querySelector("#canOwnSet").checked,
		    canAllSet: document.querySelector("#canAllSet").checked,
		    canSubscribe: document.querySelector("#canSubscribe").checked
		});
    document.querySelector(".window").classList.remove("shown");
    // Prevenir l'utilisateur de l'inscription
}
function unSubscribeStudent() {
    let l = document.querySelectorAll("#wrapper-student-list ul li.selected-for-subscription");
    let arr = Array.from(l);
    console.log("arr is", arr);
    socket.emit("unSubscribeList", courseID, arr.map((e) => { return parseInt(e.id)}));
    // Prevenir l'utilisateur de l'inscription
}


function selectAll() {
    Array.from(document.querySelectorAll("#wrapper-student-list li")).forEach((li) => {
	li.classList.add("selected-for-subscription");
    });
}
function unSelectAll() {
    Array.from(document.querySelectorAll("#wrapper-student-list li")).forEach((li) => {
	li.classList.remove("selected-for-subscription");
    });
}
    
