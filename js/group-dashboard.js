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

//----------------------------
// Get Latest Auction Monthly Amount
//----------------------------

let monthlyDue = 0;
let latestMonth = 0;
const auctionSnapshot = await getDocs(
query(
collection(db, "auctions"),
where("groupId", "==", groupId)
)
);

if (!auctionSnapshot.empty) {
let latestAuction = null;

auctionSnapshot.forEach(doc => {

const auction = doc.data();

if ((auction.month || 0) > latestMonth) {

latestMonth = auction.month;
latestAuction = auction;

}

});

if (latestAuction) {

monthlyDue =
Number(latestAuction.monthlyAmount || 0);

}

}

monthlyTarget.textContent =
"₹" + (monthlyDue * members.length).toLocaleString("en-IN");

// Continue to Summary Calculation

calculateDashboard(
group,
members,
monthlyDue,
latestMonth
);

}
//==================================================
// Part 3A
// Dashboard Calculation
//==================================================
async function calculateDashboard(
group,
members,
monthlyDue,
currentAuctionMonth
){

let totalReceivedAmount = 0;
let totalPendingAmount = 0;

let paidCount = 0;
let partialCount = 0;
let pendingCount = 0;

dashboardBody.innerHTML = "";

//----------------------------------
// Load Pending Register
//----------------------------------

const pendingSnapshot = await getDocs(
query(
collection(db,"pendingRegister"),
where("groupCode","==",group.groupCode),
where("auctionMonth","==",currentAuctionMonth)
)
);

//----------------------------------
// Member Wise Pending
//----------------------------------

const memberPending = {};

pendingSnapshot.forEach(doc=>{

const data = doc.data();

const key = data.aadhaarNumber;

if(!memberPending[key]){

memberPending[key]={
paid:0,
pending:0
};

}

memberPending[key].paid +=
Number(data.paidAmount || 0);

memberPending[key].pending +=
Number(data.pendingAmount || 0);

});
//----------------------------------
// Table Data
//----------------------------------

dashboardBody.innerHTML = "";

members.forEach((member,index)=>{

const memberData =
memberPending[member.aadhaarNumber] || {
paid:0,
pending:monthlyDue
};

const received =
Number(memberData.paid);

const pending =
Number(memberData.pending);

totalReceivedAmount += received;
totalPendingAmount += pending;

let statusText = "🟢 Paid";
let statusClass = "paid";

if(received==0){

statusText="🔴 Pending";
statusClass="pending";
pendingCount++;

}
else if(received<monthlyDue){

statusText="🟡 Partial";
statusClass="partial";
partialCount++;

}
else{

paidCount++;

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

//----------------------------------
// Summary
//----------------------------------

monthlyTarget.textContent =
"₹"+(monthlyDue * members.length).toLocaleString("en-IN");

totalReceived.textContent =
"₹"+totalReceivedAmount.toLocaleString("en-IN");

totalPending.textContent =
"₹"+totalPendingAmount.toLocaleString("en-IN");

paidMembers.textContent = paidCount;
partialMembers.textContent = partialCount;
pendingMembers.textContent = pendingCount;

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
Math.max(monthlyDue - pending, 0);

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
