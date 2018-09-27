var socket = io.connect(server+'/users');

socket.on("users", (list) => {
    console.log(list) ;
    wrap = document.querySelector("#wrapper-student-list");
    ul = document.createElement("ul");
    list.forEach((student) => {
	li = document.createElement("li");
	li.textContent = student.fullName+" ("+student.studentNumber+")" + "\
 eleve de "+student.institution+"\\n promotion "+student.promotion+"/"+(student.promotion+1);
	li.id = student.id;
	li.classList.add("room");
	ul.appendChild(li);
    });
    wrap.innerHTML = '';
    wrap.appendChild(ul);
    
});

function searchStudent(name, n_etu, promotion, institution) {
    search = {
	name:name,
	n_etu:n_etu,
	promotion:promotion,
	institution:institution
    }
    socket.emit("getUser", search);

}
