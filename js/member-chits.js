//==================================================
// SR Chits ERP
// My Chits V2.0
// Aadhaar Based
//==================================================

import { db } from "./firebase.js";

import {
collection,
query,
where,
getDocs
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

//==================================================
// Session
//==================================================

const aadhaarNumber =
sessionStorage.getItem("aadhaarNumber");

if(!aadhaarNumber){

window.location.href =
"member-login.html";

}

//==================================================
// Elements
//==================================================

const memberName =
document.getElementById("memberName");

const referenceNo =
document.getElementById("referenceNo");

const totalGroups =
document.getElementById("totalGroups");

const chitContainer =
document.getElementById("chitContainer");
//==================================================
// Load My Chits
//==================================================

async function loadMyChits(){

try{

const memberQuery = query(
collection(db,"members"),
where("aadhaarNumber","==",aadhaarNumber)
);

const memberSnapshot =
await getDocs(memberQuery);

if(memberSnapshot.empty){

alert("No Chits Found.");

return;

}

let html = "";

let firstMember = null;

let totalActive = 0;

memberName.textContent = "Loading...";

memberSnapshot.forEach(docSnap=>{

const member = docSnap.data();

if(!firstMember){

firstMember = member;

memberName.textContent =
member.memberName || "-";

referenceNo.textContent =
member.referenceNo || "-";

}

totalActive++;

html += `
<div class="chit-card">

<div class="chit-title">

${member.groupName || "-"}

</div>

<div class="chit-row">

<span>Status</span>

<span class="status-active">

${member.accountStatus || "Active"}

</span>

</div>

<div class="chit-row">

<span>Member Code</span>

<span>

${member.memberCode || "-"}

</span>

</div>

<div class="chit-row">

<span>Group Code</span>

<span>

${member.groupCode || "-"}

</span>

</div>

<div class="card-buttons">

<button
class="passbook-btn"
data-member="${docSnap.id}">

Passbook

</button>

<button
class="payment-btn"
data-member="${docSnap.id}">

Payments

</button>

</div>

</div>
`;

});

totalGroups.textContent =
totalActive;

chitContainer.innerHTML =
html;
    //--------------------------------------------------
// Render Completed
//--------------------------------------------------

}
catch(error){

console.error(error);

alert("Unable to load My Chits.");

}

}

loadMyChits();

//==================================================
// Button Events
//==================================================

document.addEventListener("click",(e)=>{

//----------------------------
// Passbook
//----------------------------

if(e.target.classList.contains("passbook-btn")){

const memberId =
e.target.dataset.member;

// Selected Group
sessionStorage.setItem(
"selectedMemberId",
memberId
);

window.location.href =
"member-passbook.html";

}

//----------------------------
// Payments
//----------------------------

if(e.target.classList.contains("payment-btn")){

const memberId =
e.target.dataset.member;

sessionStorage.setItem(
"selectedMemberId",
memberId
);

window.location.href =
"member-payment-history.html";

}

});

//==================================================
// Back
//==================================================

document
.getElementById("backBtn")
.addEventListener("click",()=>{

window.location.href =
"member-dashboard.html";

});
