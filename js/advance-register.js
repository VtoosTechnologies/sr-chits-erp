//==================================================
// SR Chits ERP
// Advance Register
// Part - 3A
//==================================================

import { db } from "./firebase.js";

import {

collection,
addDoc,
getDocs,
query,
orderBy,
limit

} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

//==================================================
// Elements
//==================================================

const advanceNo =
document.getElementById("advanceNo");

const advanceDate =
document.getElementById("advanceDate");

const customerCode =
document.getElementById("customerCode");

const customerName =
document.getElementById("customerName");

const mobileNumber =
document.getElementById("mobileNumber");

const address =
document.getElementById("address");

const advanceAmount =
document.getElementById("advanceAmount");

const dueDate =
document.getElementById("dueDate");

const paymentMode =
document.getElementById("paymentMode");

const remarks =
document.getElementById("remarks");

const saveAdvance =
document.getElementById("saveAdvance");

//==================================================
// Initial Load
//==================================================

window.addEventListener(
"DOMContentLoaded",
async ()=>{

const today =
new Date().toISOString().split("T")[0];

advanceDate.value = today;

await generateAdvanceNumber();

});
//==================================================
// Generate Advance Number
//==================================================

async function generateAdvanceNumber(){

try{

const q = query(
collection(db,"advances"),
orderBy("createdAt","desc"),
limit(1)
);

const snapshot =
await getDocs(q);

let nextNumber = 1;

if(!snapshot.empty){

const lastAdvanceNo =
snapshot.docs[0].data().advanceNo || "ADV000000";

const number =
parseInt(
lastAdvanceNo.replace("ADV","")
);

nextNumber = number + 1;

}

advanceNo.value =
"ADV" +
String(nextNumber)
.padStart(6,"0");

}
catch(error){

console.error(error);

advanceNo.value =
"ADV000001";

}

}
//==================================================
// Save Advance
//==================================================

saveAdvance.addEventListener("click", async ()=>{
  console.log("Save Button Clicked");
try{

if(customerName.value.trim()==""){

alert("Enter Customer Name");
return;

}

if(advanceAmount.value=="" ||
Number(advanceAmount.value)<=0){

alert("Enter Advance Amount");
return;

}

//--------------------------------------
// Save Advance Master
//--------------------------------------

const docRef =
await addDoc(
collection(db,"advances"),
{

advanceNo:
advanceNo.value,

customerCode:
customerCode.value.trim(),

customerName:
customerName.value.trim(),

mobileNumber:
mobileNumber.value.trim(),

address:
address.value.trim(),

advanceAmount:
Number(advanceAmount.value),

interest:0,

advanceDate:
advanceDate.value,

dueDate:
dueDate.value,

paidAmount:0,

balanceAmount:
Number(advanceAmount.value),

status:"Open",

remarks:
remarks.value.trim(),

createdAt:
new Date()

}
);

//--------------------------------------
// Save Advance Ledger
//--------------------------------------

await addDoc(
collection(db,"advanceLedger"),
{

transactionNo:
"ADL"+Date.now(),

advanceId:
docRef.id,

advanceNo:
advanceNo.value,

customerCode:
customerCode.value.trim(),

customerName:
customerName.value.trim(),

mobileNumber:
mobileNumber.value.trim(),

transactionDate:
advanceDate.value,

transactionType:
"Advance Given",

debit:
Number(advanceAmount.value),

credit:0,

balance:
Number(advanceAmount.value),

paymentMode:
paymentMode.value,

remarks:
remarks.value.trim(),

createdAt:
new Date()

}
);

alert("Advance Saved Successfully");

//--------------------------------------
// Clear Form
//--------------------------------------

customerCode.value="";

customerName.value="";

mobileNumber.value="";

address.value="";

advanceAmount.value="";

dueDate.value="";

remarks.value="";

paymentMode.value="Cash";

advanceDate.value=
new Date().toISOString().split("T")[0];

await generateAdvanceNumber();

}
catch(error){

console.error(error);

alert("Error while saving Advance.");

}

});
