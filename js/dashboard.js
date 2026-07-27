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
    getDocs,
    query,
    where,
    Timestamp
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
        totalPending.textContent = "Loading...";

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

 // Today's Collection

let total = 0;

// Today 12:00 AM
const today = new Date();
today.setHours(0, 0, 0, 0);

// Tomorrow 12:00 AM
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);

const todayQuery = query(
    collection(db, "collections"),
    where(
        "createdAt",
        ">=",
        Timestamp.fromDate(today)
    ),
    where(
        "createdAt",
        "<",
        Timestamp.fromDate(tomorrow)
    )
);

const collectionSnapshot =
await getDocs(todayQuery);

collectionSnapshot.forEach(doc => {

    const data = doc.data();

    total += Number(
        data.receivedAmount ||
        data.totalAmount ||
        0
    );

});

todayCollection.textContent =
"₹ " + total.toLocaleString("en-IN");

        // Total Pending

let pendingTotal = 0;

const pendingSnapshot =
await getDocs(collection(db, "pendingRegister"));

pendingSnapshot.forEach(doc => {

    const data = doc.data();

    if (data.status === "PENDING") {

        pendingTotal += Number(data.pendingAmount || 0);

    }

});

totalPending.textContent =
"₹ " + pendingTotal.toLocaleString("en-IN");

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
