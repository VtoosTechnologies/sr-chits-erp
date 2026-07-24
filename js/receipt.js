//==================================================
// SR Chits ERP
// Receipt Module
// receipt.js
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
// Get Transaction Number
//==================================================

const params = new URLSearchParams(window.location.search);

const transactionNo =
params.get("transactionNo");

//==================================================
// Elements
//==================================================

const receiptNo =
document.getElementById("receiptNo");

const receiptDate =
document.getElementById("receiptDate");

const memberName =
document.getElementById("memberName");

const memberCode =
document.getElementById("memberCode");

const groupName =
document.getElementById("groupName");

const groupCode =
document.getElementById("groupCode");

const installment =
document.getElementById("installment");

const previousPending =
document.getElementById("previousPending");

const receivedAmount =
document.getElementById("receivedAmount");

const balancePending =
document.getElementById("balancePending");

const paymentMode =
document.getElementById("paymentMode");

const remarks =
document.getElementById("remarks");

//==================================================
// Start
//==================================================

if(!transactionNo){

alert("Transaction Number Missing");

throw new Error("Transaction Number Missing");

}

loadReceipt();
//==================================================
// Load Receipt
// Part 2
//==================================================

async function loadReceipt(){

const q = query(
collection(db,"collections"),
where("transactionNo","==",transactionNo)
);

const snapshot = await getDocs(q);

if(snapshot.empty){

alert("Receipt Not Found");
return;

}

//----------------------------------
// First Collection Entry
//----------------------------------

const firstData = snapshot.docs[0].data();

receiptNo.textContent = transactionNo;

memberName.textContent =
firstData.memberName || "-";

memberCode.textContent =
firstData.memberCode || "-";

groupName.textContent =
firstData.groupName || "-";

groupCode.textContent =
firstData.groupCode || "-";

installment.textContent =
firstData.installmentNo || "-";

paymentMode.textContent =
firstData.paymentMode || "-";

remarks.textContent =
firstData.remarks || "-";

//----------------------------------
// Receipt Date
//----------------------------------

if(firstData.createdAt){

receiptDate.textContent =
firstData.createdAt
.toDate()
.toLocaleString("en-IN");

}

//----------------------------------
// Amount
//----------------------------------

let totalReceived = 0;

snapshot.forEach(doc=>{

const data = doc.data();

totalReceived +=
Number(data.receivedAmount || 0);

});

receivedAmount.textContent =
"₹" +
totalReceived.toLocaleString("en-IN");

//----------------------------------
// Previous Pending
//----------------------------------

const pendingQ = query(
collection(db,"pendingRegister"),
where("aadhaarNumber","==",firstData.aadhaarNumber),
where("groupCode","==",firstData.groupCode)
);

const pendingSnapshot =
await getDocs(pendingQ);

let balance = 0;

pendingSnapshot.forEach(doc=>{

balance +=
Number(doc.data().pendingAmount || 0);

});

balancePending.textContent =
"₹" +
balance.toLocaleString("en-IN");

previousPending.textContent =
"₹" +
(balance + totalReceived)
.toLocaleString("en-IN");

}
