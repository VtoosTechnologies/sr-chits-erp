//==================================================
// SR Chits ERP
// Collection History
// Part - 4D
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

const chitAmountFilter =
document.getElementById("chitAmountFilter");

const auctionDayFilter =
document.getElementById("auctionDayFilter");

const collectionMonthFilter =
document.getElementById("collectionMonthFilter");

const loadHistory =
document.getElementById("loadHistory");

const historyTable =
document.getElementById("historyTable");

const totalCollections =
document.getElementById("totalCollections");

const totalMonthly =
document.getElementById("totalMonthly");

const totalFine =
document.getElementById("totalFine");

const totalAmount =
document.getElementById("totalAmount");

const pendingMembers =
document.getElementById("pendingMembers");

//==================================================
// Variables
//==================================================

let groups = [];

let selectedGroup = null;

//==================================================
// Initial Load
//==================================================

window.addEventListener("DOMContentLoaded", async () => {

await loadChitAmounts();

});

//==================================================
// Load Chit Amounts
//==================================================

async function loadChitAmounts(){

const snapshot =
await getDocs(collection(db,"groups"));

const amounts = [];

snapshot.forEach(doc=>{

const data = doc.data();

if(!amounts.includes(data.chitAmount)){

amounts.push(data.chitAmount);

}

});

amounts.sort((a,b)=>a-b);

chitAmountFilter.innerHTML =
`<option value="">Select Chit Amount</option>`;

amounts.forEach(amount=>{

chitAmountFilter.innerHTML +=
`
<option value="${amount}">
₹${Number(amount).toLocaleString("en-IN")}
</option>
`;

});

}
//==================================================
// Chit Amount Change
//==================================================

chitAmountFilter.addEventListener("change", async ()=>{

auctionDayFilter.innerHTML =
`<option value="">Select Auction Day</option>`;

collectionMonthFilter.innerHTML =
`<option value="">Select Collection Month</option>`;

selectedGroup = null;

if(!chitAmountFilter.value) return;

const q = query(
collection(db,"groups"),
where("chitAmount","==",Number(chitAmountFilter.value))
);

const snapshot =
await getDocs(q);

groups = [];

snapshot.forEach(doc=>{

groups.push({
id:doc.id,
...doc.data()
});

});

groups.sort((a,b)=>
a.auctionDay-b.auctionDay
);

groups.forEach(group=>{

auctionDayFilter.innerHTML +=
`
<option value="${group.id}">
${group.auctionDay}
</option>
`;

});

});

//==================================================
// Auction Day Change
//==================================================

auctionDayFilter.addEventListener("change", async ()=>{

collectionMonthFilter.innerHTML =
`<option value="">Select Collection Month</option>`;

selectedGroup =
groups.find(g=>g.id===auctionDayFilter.value);

if(!selectedGroup) return;

const q = query(
collection(db,"collections"),
where("groupId","==",selectedGroup.id)
);

const snapshot =
await getDocs(q);

const months = [];

snapshot.forEach(doc=>{

const data = doc.data();

if(!months.includes(data.collectionMonth)){

months.push(data.collectionMonth);

}

});

months.sort((a,b)=>a-b);

months.forEach(month=>{

collectionMonthFilter.innerHTML +=
`
<option value="${month}">
Month ${month}
</option>
`;

});

});
//==================================================
// Load History
//==================================================

loadHistory.addEventListener("click", async ()=>{

if(!selectedGroup){

alert("Please Select Group");

return;

}

if(!collectionMonthFilter.value){

alert("Please Select Collection Month");

return;

}

const month =
Number(collectionMonthFilter.value);

const q = query(
collection(db,"collections"),
where("groupId","==",selectedGroup.id),
where("collectionMonth","==",month)
);

const snapshot =
await getDocs(q);

historyTable.innerHTML = "";

let sno = 1;

let monthlyTotal = 0;
let fineTotal = 0;
let grandTotal = 0;

snapshot.forEach(doc=>{

const data = doc.data();

monthlyTotal += Number(data.monthlyAmount || 0);
fineTotal += Number(data.fineAmount || 0);
grandTotal += Number(data.totalAmount || 0);

historyTable.innerHTML +=
`
<tr>

<td>${sno++}</td>

<td>${data.memberCode}</td>

<td>${data.memberName}</td>

<td>${data.collectionMonth}</td>

<td>₹${Number(data.monthlyAmount).toLocaleString("en-IN")}</td>

<td>₹${Number(data.fineAmount).toLocaleString("en-IN")}</td>

<td>₹${Number(data.totalAmount).toLocaleString("en-IN")}</td>

<td>${data.collectionDate}</td>

<td>${data.paymentMode}</td>

<td>
<button class="edit-btn action-btn">
Edit
</button>

<button class="delete-btn action-btn">
Delete
</button>
</td>

</tr>
`;

});

if(snapshot.empty){

historyTable.innerHTML =
`
<tr>

<td colspan="10"
style="text-align:center;">

No Collection History Found

</td>

</tr>
`;

}

totalCollections.textContent =
snapshot.size;

totalMonthly.textContent =
"₹" + monthlyTotal.toLocaleString("en-IN");

totalFine.textContent =
"₹" + fineTotal.toLocaleString("en-IN");

totalAmount.textContent =
"₹" + grandTotal.toLocaleString("en-IN");

pendingMembers.textContent =
selectedGroup.totalMembers - snapshot.size;

});
