const loginBtn = document.getElementById("loginBtn");

loginBtn.addEventListener("click", () => {

    const email =
    document.getElementById("email").value.trim();

    const password =
    document.getElementById("password").value.trim();

    if(email === "" || password === ""){

        alert("Please enter Email and Password");

        return;

    }

    alert("Validation Success");

});
