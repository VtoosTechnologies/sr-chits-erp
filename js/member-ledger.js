//==================================================
// SR Chits ERP
// Member Ledger
// Part 2AA
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

const totalDebit =
document.getElementById("totalDebit");

const totalCredit =
document.getElementById("totalCredit");

const closingBalance =
document.getElementById("closingBalance");

const ledgerBody =
document.getElementById("ledgerBody");

const printBtn =
document.getElementById("printBtn");

//==================================================
// Variables
//==================================================

let selectedMember = null;

let pendingRecords = [];

let collectionRecords = [];

let ledger = [];

//==================================================
// Initial Load
//==================================================

window.addEventListener(
"DOMContentLoaded",
()=>{

selectedMemberCard.style.display="none";

memberList.style.display="none";

});

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
// Render Member List
//==================================================

function renderMemberList(list){

memberList.innerHTML="";

if(list.length===0){

memberList.style.display="none";

return;

}

memberList.style.display="block";

const unique={};

list.forEach(member=>{

const key =
member.memberId ||
member.mobileNumber;

if(!unique[key]){

unique[key]=member;

}

});

Object.values(unique).forEach(member=>{

const div =
document.createElement("div");

div.className="search-item";

div.innerHTML=`
<strong>${member.memberName}</strong><br>
<small>${member.mobileNumber || "-"}</small>
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

async function selectMember(member){

selectedMember=member;

searchMember.value=
member.memberName;

memberList.style.display="none";

selectedMemberCard.style.display="block";

memberCode.textContent=
member.memberCode || "-";

memberName.textContent=
member.memberName || "-";

memberMobile.textContent=
member.mobileNumber || "-";

ledgerBody.innerHTML=`
<tr>
<td colspan="6">
Loading Ledger...
</td>
</tr>
`;

await loadLedger();

}
