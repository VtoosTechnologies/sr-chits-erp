//==================================================
// SR Chits ERP
// Collection Module V2
// Part 3A-1
//==================================================

import { db } from "./firebase.js";

import {
collection,
getDocs,
query,
where,
orderBy,
doc,
updateDoc,
addDoc,
serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";
alert("Collection JS Loaded");
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

const memberGroups =
document.getElementById("memberGroups");

const totalPending =
document.getElementById("totalPending");
const totalChitValue =
document.getElementById("totalChitValue");

const totalDemand =
document.getElementById("totalDemand");

const totalPaid =
document.getElementById("totalPaid");

const dashboardPending =
document.getElementById("dashboardPending");

const pendingList =
document.getElementById("pendingList");
const groupList =
document.getElementById("groupList");

const receivedAmount =
document.getElementById("receivedAmount");

const paymentMode =
document.getElementById("paymentMode");

const remarks =
document.getElementById("remarks");

const saveCollection =
document.getElementById("saveCollection");

const resetForm =
document.getElementById("resetForm");

//==================================================
// Variables
//==================================================

let selectedMember = null;

let pendingRecords = [];

let memberGroupsData = [];
//==================================================
// Initial Load
//==================================================

window.addEventListener(
"DOMContentLoaded",
async ()=>{

selectedMemberCard.style.display="none";

memberList.style.display="none";

pendingList.innerHTML="";
  groupList.innerHTML="";

totalPending.textContent="₹0";

}
);

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
// Render Member Search Result
//==================================================
function renderMemberList(list){

    memberList.innerHTML = "";

    if(list.length === 0){
        memberList.style.display = "none";
        return;
    }

    memberList.style.display = "block";

    const uniqueMembers = {};

    list.forEach(data => {

        const key =
data.aadhaarNumber || data.mobileNumber;

        if(!uniqueMembers[key]){
            uniqueMembers[key] = data;
        }

    });

    Object.values(uniqueMembers).forEach(data => {

        const item = document.createElement("div");

        item.className = "search-item";

        item.innerHTML = `
            <strong>${data.memberName}</strong><br>
            <small>${data.mobileNumber || "-"}</small>
        `;

        item.addEventListener("click", () => {
            selectMember(data);
        });

        memberList.appendChild(item);

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
member.memberCode;

memberName.textContent=
member.memberName;

memberMobile.textContent=
member.mobileNumber || "-";
await loadPendingDetails();

}

//==================================================
// Load Pending Register
//==================================================

async function loadPendingDetails(){

pendingList.innerHTML="";

totalPending.textContent="₹0";

pendingRecords=[];

memberGroupsData=[];

const q=query(

collection(db,"pendingRegister"),

where(
"aadhaarNumber",
"==",
selectedMember.aadhaarNumber
)

);

const snapshot=
await getDocs(q);
  alert("Pending Documents : " + snapshot.size);
  console.log("Selected Member Code:", selectedMember.memberCode);
console.log("Documents Found:", snapshot.size);

alert(
"Member : " + selectedMember.memberCode +
"\nDocuments : " + snapshot.size
);

let total=0;

snapshot.forEach(doc=>{

const data={

id:doc.id,

...doc.data()

};

if(

data.status==="PENDING" ||

data.status==="PARTIAL"

){

pendingRecords.push(data);

total +=
Number(
data.pendingAmount || 0
);

}

});

memberGroups.textContent=

new Set(

pendingRecords.map(r=>r.groupCode)

).size;
//----------------------------------
// Dashboard Calculation
//----------------------------------

let chitValue = 0;
let demand = 0;
let paid = 0;
let pending = 0;

const uniqueGroups = {};

snapshot.forEach(doc => {

const data = doc.data();

const amount = Number(data.monthlyAmount || 0);

demand += amount;

paid += Number(data.paidAmount || 0);

pending += Number(data.pendingAmount || 0);

if(!uniqueGroups[data.groupCode]){
    uniqueGroups[data.groupCode] = amount;
}

});

Object.values(uniqueGroups).forEach(value=>{
    chitValue += value;
});

totalChitValue.textContent =
"₹" + chitValue.toLocaleString("en-IN");

totalDemand.textContent =
"₹" + demand.toLocaleString("en-IN");

totalPaid.textContent =
"₹" + paid.toLocaleString("en-IN");

dashboardPending.textContent =
"₹" + pending.toLocaleString("en-IN");
totalPending.textContent=

"₹"+

total.toLocaleString("en-IN");
renderGroupCards();
renderPendingCards();

}
//==================================================
// Render Pending Cards
//==================================================
function renderGroupCards(){

    groupList.innerHTML = "";

    const groups = {};

    pendingRecords.forEach(record => {

        if(!groups[record.groupCode]){
            groups[record.groupCode] = {
                groupName: record.groupName,
                groupCode: record.groupCode,
                pending: 0
            };
        }

        groups[record.groupCode].pending += Number(record.pendingAmount || 0);

    });

    Object.values(groups).forEach(group => {

        const card = document.createElement("div");

        card.className = "pending-card";

        card.innerHTML = `
            <h4>${group.groupName}</h4>
            <p><b>Group :</b> ${group.groupCode}</p>
            <p class="pending-amount">
                ₹${group.pending.toLocaleString("en-IN")}
            </p>
        `;
      card.addEventListener("click", () => {

    pendingList.innerHTML = "";

    const groupPending = pendingRecords.filter(
        p => p.groupCode === group.groupCode
    );

    groupPending.forEach(record => {

        const pendingCard = document.createElement("div");

        pendingCard.className = "pending-card";

        pendingCard.innerHTML = `
            <h4>${record.groupName}</h4>
            <p><b>Installment :</b> ${record.installmentNo}</p>
            <p><b>Due Date :</b> ${formatDate(record.dueDate)}</p>
            <p class="pending-amount">
                ₹${Number(record.pendingAmount).toLocaleString("en-IN")}
            </p>
        `;

        pendingList.appendChild(pendingCard);

    });

});

        groupList.appendChild(card);

    });

}
function renderPendingCards(){

pendingList.innerHTML="";

if(pendingRecords.length===0){

pendingList.innerHTML=`

<div class="pending-card">

<h4>No Pending Found</h4>

<p>
This member has no pending collections.
</p>

</div>

`;

return;

}

pendingRecords.forEach(record=>{

const card=document.createElement("div");

card.className="pending-card";

card.innerHTML=`

<h4>${record.groupName}</h4>

<p>

<b>Group Code :</b>

${record.groupCode}

</p>

<p>

<b>Installment :</b>

${record.installmentNo}

</p>

<p>

<b>Due Date :</b>

${formatDate(record.dueDate)}

</p>

<p class="pending-amount">

₹${Number(
record.pendingAmount
).toLocaleString("en-IN")}

</p>

`;

pendingList.appendChild(card);

});

}

//==================================================
// Format Date
//==================================================

function formatDate(dateValue){

if(!dateValue) return "-";

try{

if(dateValue.toDate){

return dateValue
.toDate()
.toLocaleDateString("en-IN");

}

return new Date(dateValue)
.toLocaleDateString("en-IN");

}
catch{

return "-";

}

}

//==================================================
// Reset Screen
//==================================================

resetForm.addEventListener(
"click",
resetCollectionForm
);

function resetCollectionForm(){

selectedMember=null;

pendingRecords=[];

memberGroupsData=[];

searchMember.value="";

memberList.innerHTML="";

memberList.style.display="none";

selectedMemberCard.style.display="none";

pendingList.innerHTML="";
  groupList.innerHTML="";

memberCode.textContent="-";

memberName.textContent="-";

memberMobile.textContent="-";

memberGroups.textContent="0";

totalPending.textContent="₹0";
  totalChitValue.textContent="₹0";
totalDemand.textContent="₹0";
totalPaid.textContent="₹0";
dashboardPending.textContent="₹0";

receivedAmount.value="";

paymentMode.value="Cash";

remarks.value="";

}
//==================================================
// PART 4A
// Load Open Advances (FIFO)
//==================================================
async function loadOpenAdvances(aadhaarNumber){

    const q = query(
        collection(db, "advances"),
        where("aadhaarNumber", "==", aadhaarNumber),
        where("status", "==", "Open")
    );

    const snapshot = await getDocs(q);

    const advances = [];

    snapshot.forEach(doc => {
        advances.push({
            id: doc.id,
            ...doc.data()
        });
    });

    // Oldest First (JavaScript-ல் sort)
    advances.sort((a, b) => {

        const first = a.createdAt?.toDate
            ? a.createdAt.toDate().getTime()
            : 0;

        const second = b.createdAt?.toDate
            ? b.createdAt.toDate().getTime()
            : 0;

        return first - second;

    });

    return advances;

}

//==================================================
// Start Collection Process
//==================================================

async function processCollection(){
let received =
Number(receivedAmount.value);

if(received<=0){

alert("Invalid Collection Amount");

return;

}

if(pendingRecords.length===0){

alert("No Pending Available");

return;

}
//----------------------------------
// Variables
//----------------------------------

let balanceAmount = received;
  //----------------------------------
// Transaction Number
//----------------------------------

const transactionNo =
"COL-" +
Date.now();
  //----------------------------------
// Load Open Advances
//----------------------------------

const openAdvances = await loadOpenAdvances(
    selectedMember.aadhaarNumber
);

console.log(openAdvances);

alert(
    "Open Advances Found : " +
    openAdvances.length
);
//----------------------------------
// Advance FIFO Adjustment
//----------------------------------

for (const advance of openAdvances) {

    if (balanceAmount <= 0) {
        break;
    }

    const currentBalance =
        Number(advance.balanceAmount || 0);

    if (currentBalance <= 0) {
        continue;
    }

    const adjustAmount =
        Math.min(balanceAmount, currentBalance);

    const newBalance =
        currentBalance - adjustAmount;

    const newPaid =
        Number(advance.paidAmount || 0) + adjustAmount;

    await updateDoc(
        doc(db, "advances", advance.id),
        {
            balanceAmount: newBalance,
            paidAmount: newPaid,
            status: newBalance === 0 ? "Closed" : "Open",
            updatedAt: serverTimestamp()
        }
    );
//----------------------------------
// Save Advance Ledger
//----------------------------------

await addDoc(
    collection(db, "advanceLedger"),
    {

        advanceId: advance.id,

        advanceNo: advance.advanceNo || "",

        aadhaarNumber: selectedMember.aadhaarNumber,

        memberCode: selectedMember.memberCode,

        memberName: selectedMember.memberName,

        adjustedAmount: adjustAmount,

        balanceAmount: newBalance,

        paymentMode: paymentMode.value,

        remarks: remarks.value.trim(),
      transactionNo:
transactionNo,

        createdAt: serverTimestamp()

    }
);
    balanceAmount -= adjustAmount;

    alert(
        "Advance Adjusted : ₹" +
        adjustAmount +
        "\nBalance : ₹" +
        newBalance
    );

}
  //----------------------------------
// Only After Advance Adjustment
// Start Pending FIFO
//----------------------------------

if(balanceAmount > 0){

    pendingRecords.sort((a, b) => {

        const first =
            a.dueDate?.toDate
            ? a.dueDate.toDate().getTime()
            : new Date(a.dueDate).getTime();

        const second =
            b.dueDate?.toDate
            ? b.dueDate.toDate().getTime()
            : new Date(b.dueDate).getTime();

        if(first !== second){
            return first - second;
        }

        return Number(a.installmentNo || 0) -
               Number(b.installmentNo || 0);

    });

}
const collectionEntries = [];

const updatedPending = [];

//----------------------------------
// FIFO Loop
//----------------------------------
  //----------------------------------
// If Advance Still Pending
// Skip Pending FIFO
//----------------------------------

if (balanceAmount === 0) {

    collectionEntries.push({

        aadhaarNumber: selectedMember.aadhaarNumber,

        memberCode: selectedMember.memberCode,

        memberName: selectedMember.memberName,

        groupId: "",

        groupCode: "ADVANCE",

        groupName: "Advance Adjustment",

        installmentNo: 0,

        receivedAmount: received,

        paymentMode: paymentMode.value,

        remarks: remarks.value.trim(),

        transactionNo: transactionNo,

        createdAt: serverTimestamp()

    });

}

for(const pending of pendingRecords){

    if(balanceAmount <= 0){
        break;
    }

const pendingAmount =
Number(pending.pendingAmount);

let paidAmount = 0;

let remainingPending = 0;

let status = "PENDING";

//----------------------------------
// Full Payment
//----------------------------------

if(balanceAmount>=pendingAmount){

paidAmount =
pendingAmount;

remainingPending = 0;

status = "PAID";

balanceAmount -= pendingAmount;

}

//----------------------------------
// Partial Payment
//----------------------------------

else{

paidAmount =
balanceAmount;

remainingPending =
pendingAmount-paidAmount;

status = "PARTIAL";

balanceAmount = 0;

}

//----------------------------------
// Prepare Update
//----------------------------------

updatedPending.push({

docId:
pending.id,

paidAmount,

remainingPending,

status,

groupCode:
pending.groupCode,

groupName:
pending.groupName,

installmentNo:
pending.installmentNo,

aadhaarNumber:
pending.aadhaarNumber,

memberCode:
pending.memberCode,

memberName:
pending.memberName

});

//----------------------------------
// Collection Entry
//----------------------------------

collectionEntries.push({

aadhaarNumber:
pending.aadhaarNumber,

memberCode:
pending.memberCode,

memberName:
pending.memberName,

groupId:
pending.groupId,

groupCode:
pending.groupCode,

groupName:
pending.groupName,

installmentNo:
pending.installmentNo,

receivedAmount:
paidAmount,

paymentMode:
paymentMode.value,

remarks:
remarks.value.trim(),
transactionNo: transactionNo,
createdAt:
serverTimestamp()

});

}
  //==================================================
// PART 3B-2
// Update Pending Register
// Save Collection
//==================================================

//----------------------------------
// Update Pending Register
//----------------------------------

for(const item of updatedPending){

const pendingRef =
doc(
db,
"pendingRegister",
item.docId
);

// Read current pending document
const oldRecord =
pendingRecords.find(
p=>p.id===item.docId
);

const oldPaid =
Number(
oldRecord.paidAmount || 0
);

const newPaid =
oldPaid + item.paidAmount;

await updateDoc(
pendingRef,
{

paidAmount:
newPaid,

pendingAmount:
item.remainingPending,

status:
item.status,

updatedAt:
serverTimestamp()

}
);

}

//----------------------------------
// Save Collection Entries
//----------------------------------

for(const entry of collectionEntries){

await addDoc(
collection(db,"collections"),
{

aadhaarNumber:
entry.aadhaarNumber,

memberCode:
entry.memberCode,

memberName:
entry.memberName,

groupId:
entry.groupId,

groupCode:
entry.groupCode,

groupName:
entry.groupName,

installmentNo:
entry.installmentNo,

receivedAmount:
entry.receivedAmount,

paymentMode:
entry.paymentMode,

remarks:
entry.remarks,
transactionNo:
entry.transactionNo,
createdAt:
serverTimestamp()

}
);
//----------------------------------
// Save Member Ledger
//----------------------------------

await addDoc(
    collection(db, "memberLedger"),
    {

        aadhaarNumber: entry.aadhaarNumber,

        memberCode: entry.memberCode,

        memberName: entry.memberName,

        groupCode: entry.groupCode,

        groupName: entry.groupName,

        transactionType: "COLLECTION",

        amount: entry.receivedAmount,

        paymentMode: entry.paymentMode,

        remarks: entry.remarks,
      transactionNo:
entry.transactionNo,

        createdAt: serverTimestamp()

    }
);
}
//----------------------------------
// Reload Screen
//----------------------------------

await loadPendingDetails();
//----------------------------------
// Remaining Amount
//----------------------------------

if(balanceAmount>0){

alert(

"Excess Amount : ₹"+

balanceAmount.toLocaleString("en-IN")
);
  }else{

  alert("Collection Saved Successfully.");

}
// Close processCollection function
}
//==================================================
// Continue Part 3B-3
//==================================================
saveCollection.addEventListener(
"click",
async ()=>{

if(!selectedMember){

alert("Please select a member.");
return;

}

if(

receivedAmount.value==="" ||

Number(receivedAmount.value)<=0

){

alert("Enter received amount.");

receivedAmount.focus();

return;

}

try{
    await processCollection();
}
catch(error){
    console.error(error);
    alert(error.message);
}

});
