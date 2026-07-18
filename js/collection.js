//==================================================
// SR Chits ERP
// Collection Module
// Part - 3A
//==================================================

import { db } from "./firebase.js";

import {
collection,
getDocs,
addDoc,
query,
where,
orderBy
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

//==================================================
// Elements
//==================================================

const chitAmountFilter =
document.getElementById("chitAmountFilter");

const auctionDayFilter =
document.getElementById("auctionDayFilter");

const member =
document.getElementById("member");

const groupCode =
document.getElementById("groupCode");

const groupName =
document.getElementById("groupName");

const totalMembers =
document.getElementById("totalMembers");

const currentMonth =
document.getElementById("currentMonth");

const memberCode =
document.getElementById("memberCode");

const memberName =
document.getElementById("memberName");

const mobileNumber =
document.getElementById("mobileNumber");

const collectionMonth =
document.getElementById("collectionMonth");

const monthlyAmount =
document.getElementById("monthlyAmount");

const fineAmount =
document.getElementById("fineAmount");

const totalAmount =
document.getElementById("totalAmount");

const collectionDate =
document.getElementById("collectionDate");

const paymentMode =
document.getElementById("paymentMode");

const remarks =
document.getElementById("remarks");

const saveCollection =
document.getElementById("saveCollection");

//==================================================
// Variables
//==================================================

let groups = [];

let selectedGroup = null;

let members = [];

let selectedMember = null;

//==================================================
// Initial Load
//==================================================

window.addEventListener("DOMContentLoaded", async () => {

collectionDate.value =
new Date().toISOString().split("T")[0];

await loadChitAmounts();

});

//==================================================
// Load Chit Amount Filter
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

chitAmountFilter.addEventListener("change", async () => {

auctionDayFilter.innerHTML =
`<option value="">Select Auction Day</option>`;

member.innerHTML =
`<option value="">Select Member</option>`;

clearDetails();

selectedGroup = null;
selectedMember = null;

if(!chitAmountFilter.value) return;

const q = query(
collection(db,"groups"),
where("chitAmount","==",Number(chitAmountFilter.value))
);

const snapshot = await getDocs(q);

groups = [];

snapshot.forEach(doc=>{

groups.push({
id:doc.id,
...doc.data()
});

});

groups.sort((a,b)=>a.auctionDay-b.auctionDay);

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

clearDetails();

member.innerHTML =
`<option value="">Select Member</option>`;

selectedMember = null;

selectedGroup =
groups.find(g=>g.id===auctionDayFilter.value);

if(!selectedGroup) return;

groupCode.textContent =
selectedGroup.groupCode;

groupName.textContent =
selectedGroup.groupName;

totalMembers.textContent =
selectedGroup.totalMembers;

// Current Collection Month
const auctionSnapshot =
await getDocs(query(
collection(db,"auctions"),
where("groupId","==",selectedGroup.id),
orderBy("auctionMonth","desc")
));

let month = 1;

if(!auctionSnapshot.empty){

month =
auctionSnapshot.docs[0].data().auctionMonth;

}

currentMonth.textContent = month;

collectionMonth.value = month;

// Monthly Amount
monthlyAmount.value =
Math.ceil(
Number(selectedGroup.chitAmount) /
Number(selectedGroup.totalMembers)
);

calculateTotal();

await loadMembers();

});

//==================================================
// Load Members
//==================================================

async function loadMembers(){

member.innerHTML =
`<option value="">Select Member</option>`;

const q = query(
collection(db,"members"),
where("groupId","==",selectedGroup.id)
);

const snapshot =
await getDocs(q);
throw new Error("Selected Group ID = " + selectedGroup.id + " | Members = " + snapshot.size);
members = [];

snapshot.forEach(doc=>{

members.push({
id:doc.id,
...doc.data()
});

});

members.sort((a,b)=>
Number(a.memberNo || 0) -
Number(b.memberNo || 0)
);

members.forEach(data=>{

member.innerHTML +=
`
<option value="${data.id}">
${data.memberNo} - ${data.memberName}
</option>
`;

});

}
//==================================================
// Member Change
//==================================================

member.addEventListener("change",()=>{

selectedMember =
members.find(m=>m.id===member.value);

if(!selectedMember){

memberCode.textContent="-";
memberName.textContent="-";
mobileNumber.textContent="-";

return;

}

memberCode.textContent =
selectedMember.memberCode;

memberName.textContent =
selectedMember.memberName;

mobileNumber.textContent =
selectedMember.mobileNumber || "-";

});

//==================================================
// Fine Amount Change
//==================================================

fineAmount.addEventListener("input",calculateTotal);

//==================================================
// Calculate Total Amount
//==================================================

function calculateTotal(){

const monthly =
Number(monthlyAmount.value)||0;

const fine =
Number(fineAmount.value)||0;

totalAmount.value =
monthly + fine;

}

//==================================================
// Clear Screen
//==================================================

function clearDetails(){

groupCode.textContent="-";

groupName.textContent="-";

totalMembers.textContent="-";

currentMonth.textContent="-";

memberCode.textContent="-";

memberName.textContent="-";

mobileNumber.textContent="-";

collectionMonth.value="";

monthlyAmount.value="";

fineAmount.value=0;

totalAmount.value="";

remarks.value="";

member.innerHTML=
`<option value="">Select Member</option>`;

}
//==================================================
// Save Collection
//==================================================

saveCollection.addEventListener("click", async () => {

try{

if(!selectedGroup){

alert("Please Select Group");

return;

}

if(!selectedMember){

alert("Please Select Member");

return;

}

const month =
Number(collectionMonth.value);

const duplicateQuery =
query(
collection(db,"collections"),
where("groupId","==",selectedGroup.id),
where("memberId","==",selectedMember.id),
where("collectionMonth","==",month)
);

const duplicateSnapshot =
await getDocs(duplicateQuery);

if(!duplicateSnapshot.empty){

alert("Collection already completed for this month.");

return;

}

await addDoc(
collection(db,"collections"),
{

groupId:selectedGroup.id,

groupCode:selectedGroup.groupCode,

groupName:selectedGroup.groupName,

memberId:selectedMember.id,

memberCode:selectedMember.memberCode,

memberName:selectedMember.memberName,

mobile:selectedMember.mobile || "",

collectionMonth:month,

monthlyAmount:Number(monthlyAmount.value),

fineAmount:Number(fineAmount.value),

totalAmount:Number(totalAmount.value),

collectionDate:collectionDate.value,

paymentMode:paymentMode.value,

remarks:remarks.value.trim(),

createdAt:new Date()

}
);

alert("Collection Saved Successfully.");

clearDetails();

member.innerHTML =
`<option value="">Select Member</option>`;

selectedMember=null;

selectedGroup=null;

chitAmountFilter.value="";

auctionDayFilter.innerHTML=
`<option value="">Select Auction Day</option>`;

}
catch(error){

console.error(error);

alert("Error while saving collection.");

}

});
