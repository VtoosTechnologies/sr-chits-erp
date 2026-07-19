//==================================================
// SR Chits ERP
// Dashboard
//==================================================

import { auth, db } from "./firebase.js";

import {
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

//==================================================
// Elements
//==================================================

const totalMembers = document.getElementById("totalMembers");
const totalGroups = document.getElementById("totalGroups");
const todayCollection = document.getElementById("todayCollection");
const totalStaff = document.getElementById("totalStaff");
const logoutBtn = document.getElementById("logoutBtn");

//==================================================
// Check Login
//==================================================

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.href = "login.html";
        return;

    }

    console.log("Logged in :", user.email);

    await loadDashboard();

});

//==================================================
// Dashboard
//==================================================

async function loadDashboard() {

    try {

        totalMembers.textContent = "...";
        totalGroups.textContent = "...";
        todayCollection.textContent = "Loading...";
        totalStaff.textContent = "...";

        // Members

        const memberSnapshot =
            await getDocs(collection(db, "members"));

        totalMembers.textContent =
            memberSnapshot.size;

        // Groups

        const groupSnapshot =
            await getDocs(collection(db, "groups"));

        totalGroups.textContent =
            groupSnapshot.size;

        // Collections

        let total = 0;

        const collectionSnapshot =
            await getDocs(collection(db, "collections"));

        collectionSnapshot.forEach(doc => {

            total += Number(
                doc.data().totalAmount || 0
            );

        });

        todayCollection.textContent =
            "₹ " +
            total.toLocaleString("en-IN");

        // Staff

        totalStaff.textContent = "1";

    }

    catch (error) {

        console.error(error);

        alert("Dashboard Loading Failed");

    }

}

//==================================================
// Logout
//==================================================

logoutBtn.addEventListener("click", async () => {

    const ok =
        confirm("Are you sure you want to logout?");

    if (!ok) return;

    try {

        await signOut(auth);

        window.location.href = "login.html";

    }

    catch (error) {

        alert(error.message);

    }

});
