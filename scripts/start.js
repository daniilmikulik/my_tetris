function store() {
    let input = document.getElementById("user_name");
    let name = input.value;

    if (name !== "") {
        localStorage.setItem("playerName", name);
        window.location.href = ("../html/index.html");
    }
}


function fillInput(){
    if (localStorage.hasOwnProperty("playerName")){
        let input = document.getElementById("user_name");
        input.value = localStorage.getItem("playerName");
    }
}