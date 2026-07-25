//==================================================
// SR Chits ERP
// My Chits V2.1
// Aadhaar Based Multi Group
//==================================================

import { db } from "./firebase.js";

import {
collection,
query,
where,
getDocs
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

//==================================================
// Session Check
//==================================================

const aadhaarNumber =
sessionStorage.getItem("aadhaarNumber");

if (!aadhaarNumber) {

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
// Currency
//==================================================

function formatCurrency(value){

    return "₹" +
    Number(value || 0)
    .toLocaleString("en-IN");

}
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

let totalActive = 0;

let firstMember = true;

for(const docSnap of memberSnapshot.docs){

const member = docSnap.data();

if(firstMember){

memberName.textContent =
member.memberName || "-";

referenceNo.textContent =
member.referenceNo || "-";

firstMember = false;

}

totalActive++;

let groupName = "-";

let chitAmount = 0;

let monthlyAmount = 0;

const groupQuery = query(
collection(db,"groups"),
where("groupCode","==",member.groupCode)
);

const groupSnapshot =
await getDocs(groupQuery);

if(!groupSnapshot.empty){

const group =
groupSnapshot.docs[0].data();

groupName =
group.groupName || "-";

chitAmount =
group.chitAmount || 0;

monthlyAmount =
group.monthlyAmount || 0;

}
        html += `
        <div class="chit-card">

            <div class="chit-title">
                ${groupName}
            </div>

            <div class="chit-row">
                <span>Status</span>
                <span class="status-active">
                    ${member.accountStatus || "Active"}
                </span>
            </div>

            <div class="chit-row">
                <span>Member Code</span>
                <span>${member.memberCode || "-"}</span>
            </div>

            <div class="chit-row">
                <span>Group Code</span>
                <span>${member.groupCode || "-"}</span>
            </div>

            <div class="chit-row">
                <span>Chit Value</span>
                <span>${formatCurrency(chitAmount)}</span>
            </div>

            <div class="chit-row">
                <span>Monthly Amount</span>
                <span>${formatCurrency(monthlyAmount)}</span>
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

    }

    totalGroups.textContent = totalActive;

    chitContainer.innerHTML = html;

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

    if(e.target.classList.contains("passbook-btn")){

        sessionStorage.setItem(
            "selectedMemberId",
            e.target.dataset.member
        );

        window.location.href =
        "member-passbook.html";

    }

    if(e.target.classList.contains("payment-btn")){

        sessionStorage.setItem(
            "selectedMemberId",
            e.target.dataset.member
        );

        window.location.href =
        "member-payment-history.html";

    }

});

//==================================================
// Back Button
//==================================================

document
.getElementById("backBtn")
.addEventListener("click",()=>{

    window.location.href =
    "member-dashboard.html";

});
