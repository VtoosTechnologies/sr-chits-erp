/*==================================================
SR Chits ERP
Collection Report
Part - 1
==================================================*/

import { db } from "./firebase.js";

import {
collection,
getDocs
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

/*==================================================
Elements
==================================================*/

const totalPending =
document.getElementById("totalPending");

const totalAdvance =
document.getElementById("totalAdvance");

const pendingMembers =
document.getElementById("pendingMembers");

const completedMembers =
document.getElementById("completedMembers");

const totalMembers =
document.getElementById("totalMembers");

const footerPending =
document.getElementById("footerPending");

const footerAdvance =
document.getElementById("footerAdvance");

const reportBody =
document.getElementById("reportBody");

const statusFilter =
document.getElementById("statusFilter");

const searchInput =
document.getElementById("searchInput");

const searchReport =
document.getElementById("searchReport");

/*==================================================
Variables
==================================================*/

let ledgerData = [];
let memberData = [];
let groupMemberData = [];
let reportData = [];

/*==================================================
Load Data
==================================================*/

async function loadData(){

const ledgerSnap =
await getDocs(collection(db,"memberLedger"));

ledgerData =
ledgerSnap.docs.map(doc=>({

id:doc.id,
...doc.data()

}));

const memberSnap =
await getDocs(collection(db,"members"));

memberData =
memberSnap.docs.map(doc=>({

id:doc.id,
...doc.data()

}));

const groupSnap =
await getDocs(collection(db,"groupMembers"));

groupMemberData =
groupSnap.docs.map(doc=>({

id:doc.id,
...doc.data()

}));

buildReport();

}

/*==================================================
Start
==================================================*/

loadData();
/*==================================================
Build Collection Report
==================================================*/

function buildReport(){

reportData = [];

let totalPendingAmount = 0;
let totalAdvanceAmount = 0;
let totalPendingMembers = 0;
let totalCompletedMembers = 0;

memberData.forEach(member=>{

const memberId =
member.referenceNo;

const memberLedger =
ledgerData.filter(item=>
item.referenceNo===memberId
);

const memberGroups =
new Set(
groupMemberData
.filter(g=>g.referenceNo===memberId)
.map(g=>g.groupCode)
);

let balance = 0;

memberLedger.forEach(entry=>{

balance += Number(entry.debit || 0);

balance -= Number(entry.credit || 0);

});

let pending = 0;
let advance = 0;

if(balance > 0){

pending = balance;

}
else if(balance < 0){

advance = Math.abs(balance);

}

const status =
pending>0
? "PENDING"
: "COMPLETED";

if(status==="PENDING"){
totalPendingMembers++;
}else{
totalCompletedMembers++;
}

totalPendingAmount += pending;
totalAdvanceAmount += advance;

reportData.push({

referenceNo:member.referenceNo,
memberName:member.memberName,
mobileNumber:member.mobileNumber || "",
groups:memberGroups.size,
pending,
advance,
status

});

});

totalPending.textContent =
"₹" +
totalPendingAmount.toLocaleString("en-IN");

totalAdvance.textContent =
"₹" +
totalAdvanceAmount.toLocaleString("en-IN");

pendingMembers.textContent =
totalPendingMembers;

completedMembers.textContent =
totalCompletedMembers;

footerPending.textContent =
"₹" +
totalPendingAmount.toLocaleString("en-IN");

footerAdvance.textContent =
"₹" +
totalAdvanceAmount.toLocaleString("en-IN");

totalMembers.textContent =
reportData.length;

renderReport(reportData);

}
/*==================================================
Render Collection Report
==================================================*/

function renderReport(data){

reportBody.innerHTML = "";

if(data.length===0){

reportBody.innerHTML = `
<tr>
<td colspan="5">No Records Found</td>
</tr>
`;

return;

}

data.sort((a,b)=>b.pending-a.pending);

data.forEach(item=>{

reportBody.innerHTML += `

<tr>

<td>${item.referenceNo}</td>

<td>${item.memberName}</td>

<td>${item.groups}</td>

<td>₹${Number(item.pending).toLocaleString("en-IN")}</td>

<td>₹${Number(item.advance).toLocaleString("en-IN")}</td>

</tr>

`;

});

}

/*==================================================
Filter Report
==================================================*/

function filterReport(){

const status =
statusFilter.value;

const keyword =
searchInput.value
.toLowerCase()
.trim();

let filtered =
reportData;

if(status!=="ALL"){

filtered =
filtered.filter(item=>
item.status===status
);

}

if(keyword){

filtered =
filtered.filter(item=>

(item.referenceNo || "")
.toLowerCase()
.includes(keyword)

||

(item.memberName || "")
.toLowerCase()
.includes(keyword)

||

(item.mobileNumber || "")
.includes(keyword)

);

}

renderReport(filtered);

}

/*==================================================
Events
==================================================*/

searchReport.addEventListener(
"click",
filterReport
);

statusFilter.addEventListener(
"change",
filterReport
);

searchInput.addEventListener(
"keyup",
filterReport
);
/*==================================================
Excel Export
==================================================*/

document
.getElementById("exportExcel")
.addEventListener("click", exportExcel);

function exportExcel(){

let csv = [];

csv.push([
"Customer ID",
"Member Name",
"Groups",
"Pending Amount",
"Advance (Loan)"
].join(","));

reportData.forEach(item=>{

csv.push([

item.referenceNo,

`"${item.memberName}"`,

item.groups,

item.pending,

item.advance

].join(","));

});

const blob =
new Blob([csv.join("\n")],{
type:"text/csv;charset=utf-8;"
});

const link =
document.createElement("a");

link.href =
URL.createObjectURL(blob);

link.download =
"Collection_Report.csv";

document.body.appendChild(link);

link.click();

document.body.removeChild(link);

}

/*==================================================
Print Report
==================================================*/

document
.getElementById("printReport")
.addEventListener("click",()=>{

window.print();

});
