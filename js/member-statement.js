//==================================================
// SR Chits ERP
// Member Statement V4
// Part 1
//==================================================

import { db } from "./firebase.js";

import {
collection,
getDocs,
query,
where
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

//==================================================
// Collections
//==================================================

const membersRef =
collection(db,"members");

const memberLedgerRef =
collection(db,"memberLedger");

const prizePaymentRef =
collection(db,"prizePayments");

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
// Variables
//==================================================

let selectedMember = null;

//==================================================
// Initial Load
//==================================================

window.addEventListener(
"DOMContentLoaded",
async()=>{

await loadMembers();

});

//==================================================
// Load Members
// Aadhaar Based
//==================================================

async function loadMembers(){

memberSelect.innerHTML=`
<option value="">
Select Member
</option>`;

const snapshot =
await getDocs(membersRef);

const uniqueMembers = {};

snapshot.forEach(doc=>{

const data = doc.data();

const key =
data.aadhaarNumber;

if(!uniqueMembers[key]){

uniqueMembers[key]={

id:doc.id,

...data

};

}

});

Object.values(uniqueMembers)
.sort((a,b)=>
a.memberName.localeCompare(b.memberName)
)
.forEach(member=>{

memberSelect.innerHTML += `

<option value="${member.aadhaarNumber}">

${member.memberName}
(${member.memberCode})

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
// Part 2
//==================================================

async function loadMemberStatement(){

const aadhaarNumber =
memberSelect.value;

if(!aadhaarNumber){

alert("Please select a member.");

return;

}

//------------------------------------------
// Get Member Details
//------------------------------------------

const memberQuery = query(
membersRef,
where(
"aadhaarNumber",
"==",
aadhaarNumber
)
);

const memberSnapshot =
await getDocs(memberQuery);

if(memberSnapshot.empty){

alert("Member not found.");

return;

}

selectedMember =
memberSnapshot.docs[0].data();

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
selectedMember.groupCode || "-";

//------------------------------------------
// Reset Summary
//------------------------------------------

let collectionTotal = 0;

let prizeTotal = 0;

let prizePaidTotal = 0;

let outstanding = 0;

//------------------------------------------
// Load Member Ledger
//------------------------------------------

const ledgerQuery = query(
memberLedgerRef,
where(
"aadhaarNumber",
"==",
aadhaarNumber
)
);

const ledgerSnapshot =
await getDocs(ledgerQuery);

const ledgerRecords = [];

ledgerSnapshot.forEach(doc=>{

const data = doc.data();

ledgerRecords.push(data);

if(data.transactionType==="COLLECTION"){

collectionTotal +=
Number(data.amount || 0);

}

});

//------------------------------------------
// Prize Payment
//------------------------------------------

const prizeQuery = query(
prizePaymentRef,
where(
"aadhaarNumber",
"==",
aadhaarNumber
)
);

const prizeSnapshot =
await getDocs(prizeQuery);

prizeSnapshot.forEach(doc=>{

const data = doc.data();

prizeTotal +=
Number(data.prizeAmount || 0);

prizePaidTotal +=
Number(data.paidAmount || 0);

});

//------------------------------------------
// Outstanding
//------------------------------------------

outstanding =
prizeTotal -
prizePaidTotal;

//------------------------------------------
// Summary Cards
//------------------------------------------

totalCollection.textContent =
"₹" +
collectionTotal.toLocaleString("en-IN");

totalPrize.textContent =
"₹" +
prizeTotal.toLocaleString("en-IN");

prizePaid.textContent =
"₹" +
prizePaidTotal.toLocaleString("en-IN");

balanceAmount.textContent =
"₹" +
outstanding.toLocaleString("en-IN");

//------------------------------------------
// Continue Part 3
//------------------------------------------

renderStatement(
ledgerRecords
);

}
//==================================================
// Render Statement
// Part 3
//==================================================

function renderStatement(records){

statementBody.innerHTML="";

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

//------------------------------------------
// Sort by Date
//------------------------------------------

records.sort((a,b)=>{

const first =
a.createdAt?.toDate
? a.createdAt.toDate().getTime()
: new Date(a.createdAt).getTime();

const second =
b.createdAt?.toDate
? b.createdAt.toDate().getTime()
: new Date(b.createdAt).getTime();

return first-second;

});

//------------------------------------------
// Running Balance
//------------------------------------------

let runningBalance = 0;

records.forEach(item=>{

const amount =
Number(item.amount || 0);

let debit = 0;
let credit = 0;

//------------------------------------------
// Debit
//------------------------------------------

if(
item.transactionType==="Advance Given" ||
item.transactionType==="Installment Due"
){

debit = amount;
runningBalance += amount;

}

//------------------------------------------
// Credit
//------------------------------------------

if(
item.transactionType==="COLLECTION"
){

credit = amount;
runningBalance -= amount;

}

const date =
item.createdAt?.toDate
? item.createdAt.toDate().toLocaleDateString("en-GB")
: "-";

statementBody.innerHTML += `

<tr>

<td>${date}</td>

<td>${item.transactionType || "-"}</td>

<td>${item.groupCode || "-"}</td>

<td>
₹${debit.toLocaleString("en-IN")}
</td>

<td>
₹${credit.toLocaleString("en-IN")}
</td>

<td>
₹${runningBalance.toLocaleString("en-IN")}
</td>

</tr>

`;

});

}

//==================================================
// Print
//==================================================

window.printStatement=function(){

window.print();

};
