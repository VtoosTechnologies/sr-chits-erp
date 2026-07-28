//==================================================
// Receipt History
// SR Chits ERP
//==================================================

import { db } from "../firebase.js";

import {
collection,
getDocs
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

//==================================================
// Elements
//==================================================

const collectionTab =
document.getElementById("collectionTab");

const auctionTab =
document.getElementById("auctionTab");

const searchBtn =
document.getElementById("searchBtn");

const fromDate =
document.getElementById("fromDate");

const toDate =
document.getElementById("toDate");

const receiptTable =
document.getElementById("receiptTable");

const totalReceipts =
document.getElementById("totalReceipts");

//==================================================

let currentType = "collection";

//==================================================
// Tab Events
//==================================================

collectionTab.onclick = () => {

currentType = "collection";

collectionTab.classList.add("active");
auctionTab.classList.remove("active");

clearTable();

};

auctionTab.onclick = () => {

currentType = "auction";

auctionTab.classList.add("active");
collectionTab.classList.remove("active");

clearTable();

};

//==================================================

searchBtn.onclick = () => {

loadReceipts();

};

//==================================================

function clearTable(){

receiptTable.innerHTML = `
<tr>
<td colspan="5">
No Records Found
</td>
</tr>
`;

totalReceipts.textContent = "0";

}

//==================================================

async function loadReceipts(){

const from = fromDate.value;
const to = toDate.value;

if(!from || !to){

alert("Select From Date and To Date");

return;

}

receiptTable.innerHTML="";

let count = 0;

//==================================================
// Collection Receipt
//==================================================

if(currentType=="collection"){

const snapshot =
await getDocs(collection(db,"transactions"));

snapshot.forEach(doc=>{

const data = doc.data();

if(data.type!="COLLECTION") return;

const date =
data.createdAt?.toDate();

if(!date) return;

const receiptDate =
date.toISOString().split("T")[0];

if(receiptDate < from) return;

if(receiptDate > to) return;

count++;

receiptTable.innerHTML += `

<tr>

<td>${data.receiptNo || "-"}</td>

<td>${receiptDate}</td>

<td>${data.memberName || "-"}</td>

<td>₹${data.amount || 0}</td>

<td>

<button
class="viewBtn"
onclick="window.location='collection-receipt.html?id=${doc.id}'">

👁 View

</button>

</td>

</tr>

`;

});

}

//==================================================
// Auction Receipt
//==================================================

else{

const snapshot =
await getDocs(collection(db,"auctionPayments"));

snapshot.forEach(doc=>{

const data = doc.data();

const date =
data.createdAt?.toDate();

if(!date) return;

const receiptDate =
date.toISOString().split("T")[0];

if(receiptDate < from) return;

if(receiptDate > to) return;

count++;

receiptTable.innerHTML += `

<tr>

<td>${data.receiptNo || "-"}</td>

<td>${receiptDate}</td>

<td>${data.winnerName || "-"}</td>

<td>₹${data.prizeAmount || 0}</td>

<td>

<button
class="viewBtn"
onclick="window.location='auction-receipt.html?id=${doc.id}'">

👁 View

</button>

</td>

</tr>

`;

});

}

//==================================================

if(count==0){

receiptTable.innerHTML=`

<tr>

<td colspan="5">

No Records Found

</td>

</tr>

`;

}

totalReceipts.textContent = count;

}

//==================================================

clearTable();
