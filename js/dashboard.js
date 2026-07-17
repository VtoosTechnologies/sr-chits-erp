import { auth } from "./firebase.js";

import {
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

// Check Login Status
onAuthStateChanged(auth, (user) => {

    if (!user) {

        window.location.href = "login.html";
        return;

    }

    console.log("Logged in as:", user.email);

});

// Logout Button
const logoutBtn = document.getElementById("logoutBtn");

logoutBtn.addEventListener("click", async () => {

    try {

        await signOut(auth);

        alert("Logout Successful");

        window.location.href = "login.html";

    } catch (error) {

        alert(error.message);

    }

});
