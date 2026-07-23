//==================================================
// SR Chits ERP
// Advance Register
// Part 3A
//==================================================

import { db } from "./firebase.js";

import {
collection,
getDocs,
query,
orderBy,
limit
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

//==================================================
// Elements
//==================================================

const searchMember =
document.getElementById("searchMember");

const memberList =
document.getElementById("memberList");

const memberCard =
document.getElementById("memberCard");

const memberCode =
document.getElementById("memberCode");

const memberName =
document.getElementById("memberName");

const mobileNumber =
document.getElementById("mobileNumber");

const address =
document.getElementById("address");

const advanceNo =
document.getElementById("advanceNo");

const advanceDate =
document.getElementById("advanceDate");

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
// Variables
//==================================================

let selectedMember = null;

//==================================================
// Initial Load
//==================================================

window.addEventListener(
"DOMContentLoaded",
async()=>{

memberCard.style.display="none";

memberList.style.display="none";

advanceDate.value =
new Date().toISOString().split("T")[0];

await generateAdvanceNumber();

});

//==================================================
// Generate Advance Number
//==================================================

async function generateAdvanceNumber(){

try{

const q=query(
collection(db,"advances"),
orderBy("createdAt","desc"),
limit(1)
);

const snapshot=
await getDocs(q);

let nextNumber=1;

if(!snapshot.empty){

const lastNo=
snapshot.docs[0].data().advanceNo || "ADV000000";

nextNumber=
parseInt(lastNo.replace("ADV",""))+1;

}

advanceNo.value=
"ADV"+
String(nextNumber).padStart(6,"0");

}
catch(error){

console.error(error);

advanceNo.value="ADV000001";

}

}

//==================================================
// Live Member Search
//==================================================

searchMember.addEventListener(
"input",
async()=>{

const keyword=
searchMember.value.trim().toLowerCase();

memberList.innerHTML="";

memberList.style.display="none";

if(keyword.length<2){

return;

}

const snapshot=
await getDocs(
collection(db,"members")
);

const results=[];

snapshot.forEach(doc=>{

const data=doc.data();

const code=
(data.memberCode||"").toLowerCase();

const name=
(data.memberName||"").toLowerCase();

const mobile=
(data.mobileNumber||"").toLowerCase();

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
// Render Member List
//==================================================

function renderMemberList(list){

memberList.innerHTML="";

if(list.length===0){

memberList.style.display="none";

return;

}

memberList.style.display="block";

list.forEach(member=>{

const div=
document.createElement("div");

div.className="search-item";

div.innerHTML=`
<strong>${member.memberName}</strong><br>
<small>${member.memberCode}</small>
`;

div.onclick=()=>{

selectMember(member);

};

memberList.appendChild(div);

});

}

//==================================================
// Select Member
//==================================================

function selectMember(member){

selectedMember=member;

searchMember.value=
member.memberName;

memberList.style.display="none";

memberCard.style.display="block";

memberCode.value=
member.memberCode || "";

memberName.value=
member.memberName || "";

mobileNumber.value=
member.mobileNumber || "";

address.value=
member.address || "";

}
