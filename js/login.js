import { login } from "./auth.js";

const loginBtn = document.getElementById("loginBtn");

loginBtn.addEventListener("click", async () => {

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if(email === "" || password === ""){
        alert("Please enter Email and Password");
        return;
    }

    try{

        await login(email, password);

        alert("Login Successful");

        window.location.href = "dashboard.html";

    }catch(error){

        alert(error.message);

    }

});
