//==================================================
// Group Collection Dashboard
// Part 1 - Imports & Load Groups
//==================================================

import { db } from "../firebase.js";

import {
collection,
getDocs,
query,
where
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

//==================================================
// Elements
//==================================================

const groupSelect = document.getElementById("groupSelect");
const loadDashboard = document.getElementById("loadDashboard");

const totalMembers = document.getElementById("totalMembers");
const monthlyTarget = document.getElementById("monthlyTarget");
const totalReceived = document.getElementById("totalReceived");
const totalPending = document.getElementById("totalPending");
const paidMembers = document.getElementById("paidMembers");
const partialMembers = document.getElementById("partialMembers");
const pendingMembers = document.getElementById("pendingMembers");
const auctionDay = document.getElementById("auctionDay");

const dashboardBody = document.getElementById("dashboardBody");

//==================================================
// Load Groups
//==================================================

async function loadGroups() {

groupSelect.innerHTML = `
<option value="">
Select Group
</option>`;

const snapshot = await getDocs(collection(db, "groups"));

snapshot.forEach(doc => {

const group = doc.data();

groupSelect.innerHTML += `
<option value="${doc.id}">
${group.groupCode} - ₹${group.chitAmount}
</option>`;

});

}

loadGroups();

//==================================================
// Load Dashboard Button
//==================================================

loadDashboard.addEventListener("click", () => {

const groupId = groupSelect.value;

if (!groupId) {

alert("Please select a group.");

return;

}

loadGroupDashboard(groupId);

});
//==================================================
// Part 2 - Load Group Dashboard
//==================================================

async function loadGroupDashboard(groupId) {

dashboardBody.innerHTML = `
<tr>
<td colspan="7">Loading...</td>
</tr>`;

//----------------------------
// Group Details
//----------------------------

const groupSnapshot = await getDocs(
query(
collection(db, "groups"),
where("__name__", "==", groupId)
)
);

if (groupSnapshot.empty) {

dashboardBody.innerHTML = `
<tr>
<td colspan="7">Group Not Found</td>
</tr>`;

return;

}

const group = groupSnapshot.docs[0].data();

auctionDay.textContent = group.auctionDay || "-";

//----------------------------
// Load Members
//----------------------------

const memberSnapshot = await getDocs(
query(
collection(db, "members"),
where("groupCode", "==", group.groupCode)
)
);

const members = [];

memberSnapshot.forEach(doc => {

members.push({
id: doc.id,
...doc.data()
});

});

totalMembers.textContent = members.length;

// Monthly Target

const monthlyDue = Number(group.monthlyAmount || group.installmentAmount || 0);

monthlyTarget.textContent =
"₹" + (monthlyDue * members.length).toLocaleString();

// Continue to Summary Calculation

calculateDashboard(group, members, monthlyDue);

}
