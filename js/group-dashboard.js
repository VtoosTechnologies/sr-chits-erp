//==================================================
// Group Collection Dashboard
// Part 1 - Imports & Load Groups
//==================================================

import { db } from "./firebase.js";

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
alert("Groups Found : " + snapshot.size);
console.log(snapshot.size);
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
//==================================================
// Part 3A
// Dashboard Calculation
//==================================================

async function calculateDashboard(
group,
members,
monthlyDue
){

let totalReceivedAmount = 0;
let totalPendingAmount = 0;

let paidCount = 0;
let partialCount = 0;
let pendingCount = 0;

dashboardBody.innerHTML = "";

const collectionSnapshot =
await getDocs(
query(
collection(db,"collections"),
where("groupCode","==",group.groupCode)
)
);

const pendingSnapshot =
await getDocs(
query(
collection(db,"pendingRegister"),
where("groupCode","==",group.groupCode)
)
);

//----------------------------------
// Total Collection
//----------------------------------

collectionSnapshot.forEach(doc=>{

const data = doc.data();

totalReceivedAmount +=
Number(
data.receivedAmount || 0
);

});

//----------------------------------
// Member Status
//----------------------------------

const memberStatus = {};

pendingSnapshot.forEach(doc=>{

const data = doc.data();

const key =
data.aadhaarNumber;

if(!memberStatus[key]){

memberStatus[key]={

pending:0,

status:"PAID"

};

}

memberStatus[key].pending +=
Number(
data.pendingAmount || 0
);

if(data.status==="PENDING"){

memberStatus[key].status="PENDING";

}

if(data.status==="PARTIAL"){

memberStatus[key].status="PARTIAL";

}

});

members.forEach(member=>{

const status =
memberStatus[
member.aadhaarNumber
];

if(!status){

paidCount++;

return;

}

totalPendingAmount +=
status.pending;

if(status.status==="PAID"){

paidCount++;

}

else if(
status.status==="PARTIAL"
){

partialCount++;

}

else{

pendingCount++;

}

});

//----------------------------------
// Summary Cards
//----------------------------------

totalReceived.textContent =
"₹"+
totalReceivedAmount.toLocaleString("en-IN");

totalPending.textContent =
"₹"+
totalPendingAmount.toLocaleString("en-IN");

paidMembers.textContent =
paidCount;

partialMembers.textContent =
partialCount;

pendingMembers.textContent =
pendingCount;

// Continue Part 3B

renderMembersTable(
members,
memberStatus,
monthlyDue
);

}
//==================================================
// Part 3B
// Render Members Table
//==================================================

function renderMembersTable(
members,
memberStatus,
monthlyDue
){

dashboardBody.innerHTML = "";

members.forEach((member,index)=>{

const statusData =
memberStatus[member.aadhaarNumber] || {
pending:0,
status:"PAID"
};

const pending =
Number(statusData.pending || 0);

const received =
monthlyDue - pending;

let statusText = "🟢 Paid";
let statusClass = "paid";

if(statusData.status==="PARTIAL"){
statusText = "🟡 Partial";
statusClass = "partial";
}

if(statusData.status==="PENDING"){
statusText = "🔴 Pending";
statusClass = "pending";
}

dashboardBody.innerHTML += `

<tr>

<td>${index+1}</td>

<td>${member.memberCode}</td>

<td>${member.memberName}</td>

<td>₹${monthlyDue.toLocaleString("en-IN")}</td>

<td>₹${received.toLocaleString("en-IN")}</td>

<td>₹${pending.toLocaleString("en-IN")}</td>

<td class="${statusClass}">
${statusText}
</td>

</tr>

`;

});

}
