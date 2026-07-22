//==================================================
// SR Chits ERP
// Member Statement
// Part - 3A
//==================================================

import { db } from "../firebase.js";

import {
collection,
getDocs
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

//==================================================
// Collections
//==================================================

const membersRef =
collection(db, "members");

const memberLedgerRef =
collection(db, "memberLedger");

const prizePaymentRef =
collection(db, "prizePayments");

//==================================================
// Elements
//==================================================

const memberSelect =
document.getElementById("memberSelect");

const viewStatement =
document.getElementById("viewStatement");

const memberCode =
document.getElementById("memberCode");

const memberName =
document.getElementById("memberName");

const mobileNumber =
document.getElementById("mobileNumber");

const groupName =
document.getElementById("groupName");

const totalCollection =
document.getElementById("totalCollection");

const totalPrize =
document.getElementById("totalPrize");

const prizePaid =
document.getElementById("prizePaid");

const balanceAmount =
document.getElementById("balanceAmount");

const statementBody =
document.getElementById("statementBody");

//==================================================
// Initial Load
//==================================================

document.addEventListener(
"DOMContentLoaded",
async()=>{

await loadMembers();

});

//==================================================
// Load Members
//==================================================

async function loadMembers(){

memberSelect.innerHTML=`
<option value="">
Select Member
</option>`;

const snapshot=
await getDocs(membersRef);

snapshot.forEach(doc=>{

const data=doc.data();

memberSelect.innerHTML+=`

<option value="${doc.id}">

${data.memberCode} - ${data.memberName}

</option>

`;

});

}

//==================================================
// View Statement
//==================================================

viewStatement.addEventListener(
"click",
loadMemberStatement
);
//==================================================
// Load Member Statement
// Part - 3B
//==================================================

async function loadMemberStatement(){

const memberId = memberSelect.value;

if(!memberId){

alert("Please select a member.");

return;

}

//------------------------------------------
// Get Member Details
//------------------------------------------

const membersSnapshot =
await getDocs(membersRef);

let selectedMember = null;

membersSnapshot.forEach(doc=>{

if(doc.id===memberId){

selectedMember = doc.data();

}

});

if(!selectedMember){

alert("Member not found.");

return;

}

//------------------------------------------
// Member Details
//------------------------------------------

memberCode.textContent =
selectedMember.memberCode || "-";

memberName.textContent =
selectedMember.memberName || "-";

mobileNumber.textContent =
selectedMember.mobileNumber || "-";

groupName.textContent =
selectedMember.groupName || "-";

//------------------------------------------
// Summary Variables
//------------------------------------------

let collectionTotal = 0;

let prizeTotal = 0;

let prizePaidTotal = 0;

//------------------------------------------
// Collection Total
//------------------------------------------

const ledgerSnapshot =
await getDocs(memberLedgerRef);

ledgerSnapshot.forEach(doc=>{

const data = doc.data();

if(data.memberId===memberId){

collectionTotal +=
Number(data.debit || 0);

}

});

//------------------------------------------
// Prize Details
//------------------------------------------

const prizeSnapshot =
await getDocs(prizePaymentRef);

prizeSnapshot.forEach(doc=>{

const data = doc.data();

if(data.memberId===memberId){

prizeTotal +=
Number(data.prizeAmount || 0);

prizePaidTotal +=
Number(data.paidAmount || 0);

}

});

//------------------------------------------
// Balance
//------------------------------------------

const balance =
prizeTotal - prizePaidTotal;

//------------------------------------------
// Summary Cards
//------------------------------------------

totalCollection.textContent =
"₹" +
collectionTotal.toLocaleString();

totalPrize.textContent =
"₹" +
prizeTotal.toLocaleString();

prizePaid.textContent =
"₹" +
prizePaidTotal.toLocaleString();

balanceAmount.textContent =
"₹" +
balance.toLocaleString();
//==================================================
// Part - 3C
// Load Statement Table
//==================================================

statementBody.innerHTML = `
<tr>
<td colspan="6">Loading...</td>
</tr>`;

const ledgerSnapshot2 =
await getDocs(memberLedgerRef);

statementBody.innerHTML = "";

let records = [];

ledgerSnapshot2.forEach(doc => {

const data = doc.data();

if(data.memberId === memberId){

records.push(data);

}

});

//------------------------------------------
// Sort by Date
//------------------------------------------

records.sort((a,b)=>{

return new Date(a.transactionDate) -
new Date(b.transactionDate);

});

//------------------------------------------
// Table
//------------------------------------------

if(records.length===0){

statementBody.innerHTML=`

<tr>

<td colspan="6">

No Statement Available

</td>

</tr>

`;

return;

}

records.forEach(item=>{

statementBody.innerHTML += `

<tr>

<td>${item.transactionDate || "-"}</td>

<td>${item.transactionType || "-"}</td>

<td>

₹${Number(item.debit || 0).toLocaleString()}

</td>

<td>

₹${Number(item.credit || 0).toLocaleString()}

</td>

<td>

₹${Number(item.balance || 0).toLocaleString()}

</td>

<td>

${item.remarks || "-"}

</td>

</tr>

`;

});
}
