//==================================================
// SR Chits ERP
// Member Ledger
// Part 2AA
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

const searchMember =
document.getElementById("searchMember");

const memberList =
document.getElementById("memberList");

const selectedMemberCard =
document.getElementById("selectedMemberCard");

const memberCode =
document.getElementById("memberCode");

const memberName =
document.getElementById("memberName");

const memberMobile =
document.getElementById("memberMobile");

const totalDebit =
document.getElementById("totalDebit");

const totalCredit =
document.getElementById("totalCredit");

const closingBalance =
document.getElementById("closingBalance");

const ledgerBody =
document.getElementById("ledgerBody");

const printBtn =
document.getElementById("printBtn");

//==================================================
// Variables
//==================================================

let selectedMember = null;

let pendingRecords = [];

let collectionRecords = [];

let ledger = [];

//==================================================
// Initial Load
//==================================================

window.addEventListener(
"DOMContentLoaded",
()=>{

selectedMemberCard.style.display="none";

memberList.style.display="none";

});

//==================================================
// Live Member Search
//==================================================

searchMember.addEventListener(
"input",
async ()=>{

const keyword =
searchMember.value.trim().toLowerCase();

memberList.innerHTML="";

memberList.style.display="none";

if(keyword.length<2){

return;

}

const snapshot =
await getDocs(
collection(db,"members")
);

const results=[];

snapshot.forEach(doc=>{

const data=doc.data();

const code =
(data.memberCode || "")
.toLowerCase();

const name =
(data.memberName || "")
.toLowerCase();

const mobile =
(data.mobileNumber || "")
.toLowerCase();

if(

code.includes(keyword) ||

name.includes(keyword) ||

mobile.includes(keyword)

){

results.push({

id:doc.id,

...data

});

}

});

renderMemberList(results);

});

//==================================================
// Render Member List
//==================================================

function renderMemberList(list){

memberList.innerHTML="";

if(list.length===0){

memberList.style.display="none";

return;

}

memberList.style.display="block";

const unique={};

list.forEach(member=>{

const key =
member.memberId ||
member.mobileNumber;

if(!unique[key]){

unique[key]=member;

}

});

Object.values(unique).forEach(member=>{

const div =
document.createElement("div");

div.className="search-item";

div.innerHTML=`
<strong>${member.memberName}</strong><br>
<small>${member.mobileNumber || "-"}</small>
`;

div.onclick=()=>{

selectMember(member);

};

memberList.appendChild(div);

});

}

//==================================================
// Select Member
//==================================================

async function selectMember(member){

selectedMember=member;

searchMember.value=
member.memberName;

memberList.style.display="none";

selectedMemberCard.style.display="block";

memberCode.textContent=
member.memberCode || "-";

memberName.textContent=
member.memberName || "-";

memberMobile.textContent=
member.mobileNumber || "-";

ledgerBody.innerHTML=`
<tr>
<td colspan="6">
Loading Ledger...
</td>
</tr>
`;

await loadLedger();

}
//==================================================
// Load Member Ledger
// Part 2AB
//==================================================

async function loadLedger() {

    ledger = [];
    pendingRecords = [];
    collectionRecords = [];

    let debitTotal = 0;
    let creditTotal = 0;
    let pendingTotal = 0;

    //--------------------------------------------------
    // Collections
    //--------------------------------------------------

    const collectionQuery = query(
        collection(db, "collections"),
        where("memberId", "==", selectedMember.memberId)
    );

    const collectionSnap = await getDocs(collectionQuery);

    collectionSnap.forEach(doc => {

        const data = doc.data();

        const amount =
            Number(data.receivedAmount || 0);

        debitTotal += amount;

        collectionRecords.push(data);

        ledger.push({
            date: data.createdAt?.toDate?.() || new Date(),
            type: "Collection",
            group: data.groupCode || "-",
            debit: amount,
            credit: 0
        });

    });

    //--------------------------------------------------
    // Advance Ledger
    //--------------------------------------------------

    const advanceQuery = query(
        collection(db, "advanceLedger"),
        where("memberCode", "==", selectedMember.memberCode)
    );

    const advanceSnap = await getDocs(advanceQuery);

    advanceSnap.forEach(doc => {

        const data = doc.data();

        const debit =
            Number(data.debit || 0);

        const credit =
            Number(data.credit || 0);

        debitTotal += debit;
        creditTotal += credit;

        ledger.push({

            date:
                data.createdAt?.toDate?.() ||
                new Date(),

            type:
                data.transactionType ||
                "Advance",

            group: "Advance",

            debit,

            credit

        });

    });
//--------------------------------------------------
// Advances
//--------------------------------------------------

const advancesQuery = query(
    collection(db, "advances"),
    where("memberCode", "==", selectedMember.memberCode)
);

const advancesSnap = await getDocs(advancesQuery);

advancesSnap.forEach(doc => {

    const data = doc.data();

    const amount = Number(data.advanceAmount || 0);

    debitTotal += amount;

    ledger.push({

        date:
            data.createdAt?.toDate?.() ||
            new Date(),

        type: "Advance Given",

        group: "Advance",

        debit: amount,

        credit: 0

    });

});
    //--------------------------------------------------
    // Pending Register
    //--------------------------------------------------

    const pendingQuery = query(
        collection(db, "pendingRegister"),
        where("memberId", "==", selectedMember.memberId)
    );

    const pendingSnap = await getDocs(pendingQuery);

    pendingSnap.forEach(doc => {

        const data = doc.data();

        pendingRecords.push(data);
        pendingTotal += Number(data.pendingAmount || 0);

        ledger.push({

            date:
                data.createdAt?.toDate?.() ||
                new Date(),

            type: "Pending",

            group:
                data.groupCode || "-",

            debit: 0,

            credit:
                Number(data.pendingAmount || 0)

        });

    });

    //--------------------------------------------------
    // Sort by Date
    //--------------------------------------------------

    ledger.sort((a, b) => a.date - b.date);

    renderLedger(
        debitTotal,
        creditTotal
    );

}
//==================================================
// Render Ledger
// Part 2B
//==================================================

function renderLedger(totalDebitValue, totalCreditValue) {

    ledgerBody.innerHTML = "";

    if (ledger.length === 0) {

        ledgerBody.innerHTML = `
        <tr>
            <td colspan="6">
                No Ledger Records Found
            </td>
        </tr>
        `;

        totalDebit.textContent = "₹0";
        totalCredit.textContent = "₹0";
        closingBalance.textContent = "₹0";

        return;
    }

    let runningBalance = 0;

    ledger.forEach(item => {

        runningBalance += Number(item.debit || 0);
        runningBalance -= Number(item.credit || 0);

        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${formatDate(item.date)}</td>
            <td>${item.type}</td>
            <td>${item.group}</td>
            <td>₹${Number(item.debit || 0).toLocaleString()}</td>
            <td>₹${Number(item.credit || 0).toLocaleString()}</td>
            <td>₹${runningBalance.toLocaleString()}</td>
        `;

        ledgerBody.appendChild(tr);

    });

    totalDebit.textContent =
        "₹" + totalDebitValue.toLocaleString();

    totalCredit.textContent =
        "₹" + totalCreditValue.toLocaleString();

    closingBalance.textContent =
        "₹" + runningBalance.toLocaleString();

}

//==================================================
// Format Date
//==================================================

function formatDate(date) {

    if (!date) return "-";

    const d = new Date(date);

    return d.toLocaleDateString("en-GB");

}

//==================================================
// Print
//==================================================

printBtn.addEventListener("click", () => {

    window.print();

});
