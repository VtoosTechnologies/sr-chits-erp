//==================================================
// SR Chits ERP
// Prize Payment
// Part 1
//==================================================

import { db } from "./firebase.js";

import {
collection,
getDocs
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

//==================================================
// Elements
//==================================================

const chitAmount =
document.getElementById("chitAmount");

const group =
document.getElementById("group");

const auctionMonth =
document.getElementById("auctionMonth");

const winner =
document.getElementById("winner");

const memberName =
document.getElementById("memberName");

const prizeAmount =
document.getElementById("prizeAmount");

const oldPending =
document.getElementById("oldPending");

const adjustmentType =
document.getElementById("adjustmentType");

const adjustAmount =
document.getElementById("adjustAmount");

const prizePayable =
document.getElementById("prizePayable");

const paidAmount =
document.getElementById("paidAmount");

const balanceAmount =
document.getElementById("balanceAmount");

const paymentMethod =
document.getElementById("paymentMethod");

const paymentStatus =
document.getElementById("paymentStatus");

const remarks =
document.getElementById("remarks");

//==================================================
// Load Chit Amount
//==================================================

async function loadChitAmounts(){

const snapshot =
await getDocs(collection(db,"groups"));

let amounts = [];

snapshot.forEach(doc=>{

const data = doc.data();

if(!amounts.includes(data.chitAmount)){

amounts.push(data.chitAmount);

}

});

amounts.sort((a,b)=>a-b);

amounts.forEach(amount=>{

const option =
document.createElement("option");

option.value = amount;

option.textContent =
"₹ " + Number(amount).toLocaleString();

chitAmount.appendChild(option);

});

}

loadChitAmounts();
//==================================================
// Load Groups
//==================================================

chitAmount.addEventListener("change", loadGroups);

async function loadGroups(){

group.innerHTML =
'<option value="">Select Group</option>';

auctionMonth.innerHTML =
'<option value="">Select Month</option>';

winner.innerHTML =
'<option value="">Select Member</option>';

const snapshot =
await getDocs(collection(db,"groups"));

snapshot.forEach(doc=>{

const data = doc.data();

if(String(data.chitAmount) === chitAmount.value){

const option =
document.createElement("option");

option.value = doc.id;

const startDate = new Date(data.startDate);

const formattedDate = startDate.toLocaleDateString(
"en-GB",
{
day:"2-digit",
month:"short",
year:"2-digit"
}
).replace(/ /g,"-");

option.textContent =
`${data.groupCode} | ${formattedDate}`;

group.appendChild(option);

}

});

}

//==================================================
// Load Auction Months
//==================================================

group.addEventListener("change", loadAuctionMonths);

async function loadAuctionMonths(){

auctionMonth.innerHTML =
'<option value="">Select Month</option>';

const snapshot =
await getDocs(collection(db,"auctions"));

snapshot.forEach(doc=>{

const data = doc.data();

if(data.groupId === group.value){

const option =
document.createElement("option");

option.value = data.month;
option.textContent = data.month;

auctionMonth.appendChild(option);

}

});

}

//==================================================
// Load Prize Winners
//==================================================

auctionMonth.addEventListener("change", loadPrizeWinners);

async function loadPrizeWinners(){

winner.innerHTML =
'<option value="">Select Member</option>';

const snapshot =
await getDocs(collection(db,"auctions"));

snapshot.forEach(doc=>{

const data = doc.data();

if(
data.groupId === group.value &&
data.auctionMonth === auctionMonth.value
){

const option =
document.createElement("option");

option.value = doc.id;
option.textContent =
data.memberName;

winner.appendChild(option);

}

});

}

//==================================================
// Load Member Details
//==================================================

winner.addEventListener("change", loadMemberDetails);

async function loadMemberDetails(){

const memberSnapshot =
await getDocs(collection(db,"members"));

memberSnapshot.forEach(doc=>{

const data = doc.data();

if(doc.id == winner.value){

memberName.value =
data.memberName || "";

oldPending.value =
data.pendingAmount || 0;

}

});

const auctionSnapshot =
await getDocs(collection(db,"auctions"));

auctionSnapshot.forEach(doc=>{

const data = doc.data();

if(
data.groupId == group.value &&
String(data.month) == auctionMonth.value &&
data.memberId == winner.value
){
prizeAmount.value = data.prizeAmount || 0;

calculatePrize();
});

}
//==================================================
// Auto Calculation
//==================================================

adjustmentType.addEventListener("change", calculatePrize);
adjustAmount.addEventListener("input", calculatePrize);
paidAmount.addEventListener("input", calculatePrize);

function calculatePrize(){

let prize =
Number(prizeAmount.value) || 0;

let pending =
Number(oldPending.value) || 0;

let adjust = 0;

if(adjustmentType.value == "none"){

adjust = 0;

}

else if(adjustmentType.value == "full"){

adjust = pending;

adjustAmount.value = pending;

}

else if(adjustmentType.value == "custom"){

adjust =
Number(adjustAmount.value) || 0;

if(adjust > pending){

adjust = pending;
adjustAmount.value = pending;

}

}

const payable =
prize - adjust;

prizePayable.value = payable;

const paid =
Number(paidAmount.value) || 0;

const balance =
payable - paid;

balanceAmount.value = balance;

// Summary

document.getElementById("summaryPrize").innerHTML =
"₹" + prize.toLocaleString();

document.getElementById("summaryAdjusted").innerHTML =
"₹" + adjust.toLocaleString();

document.getElementById("summaryPaid").innerHTML =
"₹" + paid.toLocaleString();

document.getElementById("summaryBalance").innerHTML =
"₹" + balance.toLocaleString();

if(balance <= 0){

paymentStatus.value =
"Completed";

}

else if(paid > 0){

paymentStatus.value =
"Partially Paid";

}

else{

paymentStatus.value =
"Pending";

}

}

//==================================================
// Buttons
//==================================================

document
.getElementById("saveBtn")
.addEventListener("click",()=>{

alert(
"Prize Payment Save - Firestore Integration Next"
);

});

document
.getElementById("resetBtn")
.addEventListener("click",()=>{

location.reload();

});

document
.getElementById("printBtn")
.addEventListener("click",()=>{

window.print();

});
