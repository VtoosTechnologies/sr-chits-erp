//==================================================
// SR Chits ERP
// Collection Receipt
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
// Elements
//==================================================

const receiptNo =
document.getElementById("receiptNo");

const transactionNo =
document.getElementById("transactionNo");

const referenceNo =
document.getElementById("referenceNo");

const memberName =
document.getElementById("memberName");

const groupName =
document.getElementById("groupName");

const installmentNo =
document.getElementById("installmentNo");

const paymentMode =
document.getElementById("paymentMode");

const receivedAmount =
document.getElementById("receivedAmount");

const remarks =
document.getElementById("remarks");

const collectionDate =
document.getElementById("collectionDate");

const printReceipt =
document.getElementById("printReceipt");

const shareReceipt =
document.getElementById("shareReceipt");

//==================================================
// Get Transaction Number
//==================================================

const params =
new URLSearchParams(window.location.search);

const transaction =
params.get("transactionNo");

if(!transaction){

alert("Transaction Number Missing");

throw new Error("Transaction Number Missing");

}

//==================================================
// Load Receipt
//==================================================

window.addEventListener(
"DOMContentLoaded",
loadReceipt
);

async function loadReceipt(){

const q =
query(
collection(db,"collections"),
where("transactionNo","==",transaction)
);

const snapshot =
await getDocs(q);

if(snapshot.empty){

alert("Receipt Not Found");

return;

}

const data =
snapshot.docs[0].data();
//==================================================
// Fill Receipt Data
//==================================================

receiptNo.textContent =
data.receiptNo || "-";

transactionNo.textContent =
data.transactionNo || "-";

referenceNo.textContent =
data.referenceNo || "-";

memberName.textContent =
data.memberName || "-";

groupName.textContent =
data.groupName || "-";

installmentNo.textContent =
data.installmentNo || "-";

paymentMode.textContent =
data.paymentMode || "-";

receivedAmount.textContent =
"₹" +
Number(
data.receivedAmount || 0
).toLocaleString("en-IN");

remarks.textContent =
data.remarks || "-";

if(data.collectionDate){

    if(data.collectionDate.toDate){

        collectionDate.textContent =
        data.collectionDate
        .toDate()
        .toLocaleString("en-IN");

    }else{

        collectionDate.textContent =
        new Date(
        data.collectionDate
        ).toLocaleString("en-IN");

    }

}else{

    collectionDate.textContent = "-";

}

}

//==================================================
// Print Receipt
//==================================================

printReceipt.addEventListener(
"click",
()=>{

window.print();

});

//==================================================
// Share Receipt
//==================================================

shareReceipt.addEventListener(
"click",
async ()=>{

const message =

`SR CHITS ERP

Receipt No : ${receiptNo.textContent}

Transaction : ${transactionNo.textContent}

Reference : ${referenceNo.textContent}

Member : ${memberName.textContent}

Group : ${groupName.textContent}

Installment : ${installmentNo.textContent}

Amount : ${receivedAmount.textContent}

Date : ${collectionDate.textContent}`;

if(navigator.share){

await navigator.share({

title:"Collection Receipt",

text:message

});

}else{

navigator.clipboard.writeText(message);

alert("Receipt copied to clipboard.");

}

});
