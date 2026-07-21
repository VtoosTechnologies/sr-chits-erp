//==================================================
// SR Chits ERP
// Collection Report
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

const groupsRef = collection(db, "groups");
const membersRef = collection(db, "members");
const collectionsRef = collection(db, "collections");

//==================================================
// Elements
//==================================================

const chitAmountFilter =
document.getElementById("chitAmountFilter");

const auctionDayFilter =
document.getElementById("auctionDayFilter");

const memberFilter =
document.getElementById("memberFilter");

const collectionMonth =
document.getElementById("collectionMonth");

const fromDate =
document.getElementById("fromDate");

const toDate =
document.getElementById("toDate");

const searchReport =
document.getElementById("searchReport");

const printReport =
document.getElementById("printReport");

const reportBody =
document.getElementById("reportBody");

const totalCollection =
document.getElementById("totalCollection");

const totalFine =
document.getElementById("totalFine");

const grandTotal =
document.getElementById("grandTotal");

const totalRecords =
document.getElementById("totalRecords");

//==================================================
// Initial Load
//==================================================

document.addEventListener("DOMContentLoaded", async () => {

    await loadChitAmounts();

    await loadAuctionDays();

    await loadMembers();

});

//==================================================
// Load Chit Amount Filter
//==================================================

async function loadChitAmounts() {

    chitAmountFilter.innerHTML =
    `<option value="">All Chit Amounts</option>`;

    const snapshot = await getDocs(groupsRef);

    const chitSet = new Set();

    snapshot.forEach(doc => {

        const data = doc.data();

        if (data.chitAmount) {
            chitSet.add(data.chitAmount);
        }

    });

    [...chitSet]
    .sort((a, b) => Number(a) - Number(b))
    .forEach(amount => {

        chitAmountFilter.innerHTML += `
        <option value="${amount}">
            ${amount}
        </option>`;

    });

}

//==================================================
// Load Auction Day Filter
//==================================================

async function loadAuctionDays() {

    auctionDayFilter.innerHTML =
    `<option value="">All Auction Days</option>`;

    const snapshot = await getDocs(groupsRef);

    const daySet = new Set();

    snapshot.forEach(doc => {

        const data = doc.data();

        if (data.auctionDay) {
            daySet.add(data.auctionDay);
        }

    });

    [...daySet]
    .sort((a, b) => Number(a) - Number(b))
    .forEach(day => {

        auctionDayFilter.innerHTML += `
        <option value="${day}">
            ${day}
        </option>`;

    });

}

//==================================================
// Load Member Filter
//==================================================

async function loadMembers() {

    memberFilter.innerHTML =
    `<option value="">All Members</option>`;

    const snapshot = await getDocs(membersRef);

    snapshot.forEach(doc => {

        const data = doc.data();

        memberFilter.innerHTML += `
        <option value="${data.memberCode}">
            ${data.memberCode} - ${data.memberName}
        </option>`;

    });

}
//==================================================
// Search Report
//==================================================

searchReport.addEventListener("click", loadReport);

async function loadReport() {

reportBody.innerHTML = `
<tr>
<td colspan="8">Loading...</td>
</tr>`;

let totalCollectionAmount = 0;
let totalFineAmount = 0;
let totalRecordCount = 0;

const chitFilter = chitAmountFilter.value;
const auctionFilter = auctionDayFilter.value;
const memberCodeFilter = memberFilter.value;
const monthFilter = collectionMonth.value;
const fromFilter = fromDate.value;
const toFilter = toDate.value;

const snapshot = await getDocs(collectionsRef);

reportBody.innerHTML = "";

snapshot.forEach(doc => {

const data = doc.data();

let show = true;

//----------------------------------
// Chit Amount Filter
//----------------------------------

if (
chitFilter &&
data.chitAmount != chitFilter
){

show = false;

}

//----------------------------------
// Auction Day Filter
//----------------------------------

if (
auctionFilter &&
data.auctionDay != auctionFilter
){

show = false;

}

//----------------------------------
// Member Filter
//----------------------------------

if (
memberCodeFilter &&
data.memberCode != memberCodeFilter
){

show = false;

}

//----------------------------------
// Collection Month Filter
//----------------------------------

if (
monthFilter &&
String(data.collectionMonth) != monthFilter
){

show = false;

}

//----------------------------------
// From Date
//----------------------------------

if (
fromFilter &&
data.collectionDate < fromFilter
){

show = false;

}

//----------------------------------
// To Date
//----------------------------------

if (
toFilter &&
data.collectionDate > toFilter
){

show = false;

}

if(!show) return;

//----------------------------------
// Totals
//----------------------------------

const collectionValue =
Number(data.monthlyAmount || 0);

const fineValue =
Number(data.fine || 0);

const totalValue =
collectionValue + fineValue;

totalCollectionAmount += collectionValue;
totalFineAmount += fineValue;
totalRecordCount++;

//----------------------------------
// Table
//----------------------------------

reportBody.innerHTML += `

<tr>

<td>${data.collectionDate || ""}</td>

<td>${data.groupCode || ""}</td>

<td>${data.memberName || ""}</td>

<td>${data.collectionMonth || ""}</td>

<td>₹${collectionValue.toLocaleString()}</td>

<td>₹${fineValue.toLocaleString()}</td>

<td>₹${totalValue.toLocaleString()}</td>

<td>${data.paymentMode || ""}</td>

</tr>

`;

});

//----------------------------------
// No Records
//----------------------------------

if(totalRecordCount===0){

reportBody.innerHTML=`
<tr>
<td colspan="8">
No Records Found
</td>
</tr>`;

}

//----------------------------------
// Summary Cards
//----------------------------------

totalCollection.textContent =
"₹" +
totalCollectionAmount.toLocaleString();

totalFine.textContent =
"₹" +
totalFineAmount.toLocaleString();

grandTotal.textContent =
"₹" +
(totalCollectionAmount + totalFineAmount)
.toLocaleString();

totalRecords.textContent =
totalRecordCount;

}
