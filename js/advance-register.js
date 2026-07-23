//==================================================
// SR Chits ERP
// Advance Register
// Part 3A
//==================================================

import { db } from "./firebase.js";

import {
collection,
getDocs,
addDoc,
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

try{

const snapshot=
await getDocs(
collection(db,"members")
);

const results=[];

snapshot.forEach(doc=>{

const data=doc.data();

const name=
(data.memberName||"").toLowerCase();

const mobile=
(data.mobileNumber||"").toLowerCase();

if(

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

}
catch(error){

console.error(error);

}

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
async function selectMember(member){

selectedMember = member;

searchMember.value = member.memberName;

memberList.style.display = "none";
memberList.innerHTML = "";

searchMember.blur();

selectedMemberCard.style.display = "block";

memberCode.textContent =
member.memberCode || "-";

memberName.textContent =
member.memberName || "-";

memberMobile.textContent =
member.mobileNumber || "-";

ledgerBody.innerHTML = `
<tr>
<td colspan="6">
Loading Ledger...
</td>
</tr>
`;

await loadLedger();

}
//==================================================
// Save Advance
// Part 3B
//==================================================

saveAdvance.addEventListener("click", async () => {

    try {

        if (!selectedMember) {
            alert("Please select a member.");
            return;
        }

        if (advanceAmount.value.trim() == "") {
            alert("Enter Advance Amount");
            return;
        }

        const amount = Number(advanceAmount.value);

        //------------------------------------------------
        // Save Advances
        //------------------------------------------------

        const docRef = await addDoc(
            collection(db, "advances"),
            {

                advanceNo: advanceNo.value,

                memberId: selectedMember.memberId || selectedMember.id,

                memberCode: selectedMember.memberCode,

                customerCode: selectedMember.memberCode,

                memberName: selectedMember.memberName,

                customerName: selectedMember.memberName,

                mobileNumber: selectedMember.mobileNumber,

                address: selectedMember.address || "",

                advanceAmount: amount,

                interest: 0,

                advanceDate: advanceDate.value,

                dueDate: dueDate.value,

                paidAmount: 0,

                balanceAmount: amount,

                status: "Open",

                remarks: remarks.value,

                createdAt: new Date()

            }
        );

        //------------------------------------------------
        // Save Advance Ledger
        //------------------------------------------------

        await addDoc(
            collection(db, "advanceLedger"),
            {

                transactionNo:
                    "ADL" + Date.now(),

                advanceId:
                    docRef.id,

                advanceNo:
                    advanceNo.value,

                memberId:
                    selectedMember.memberId || selectedMember.id,

                memberCode:
                    selectedMember.memberCode,

                customerCode:
                    selectedMember.memberCode,

                memberName:
                    selectedMember.memberName,

                customerName:
                    selectedMember.memberName,

                mobileNumber:
                    selectedMember.mobileNumber,

                transactionDate:
                    advanceDate.value,

                transactionType:
                    "Advance Given",

                debit:
                    amount,

                credit:
                    0,

                balance:
                    amount,

                paymentMode:
                    paymentMode.value,

                remarks:
                    remarks.value,

                createdAt:
                    new Date()

            }
        );

        alert("Advance Saved Successfully");

        //------------------------------------------------
        // Reset
        //------------------------------------------------

        searchMember.value = "";

        memberCard.style.display = "none";

        selectedMember = null;

        advanceAmount.value = "";

        dueDate.value = "";

        remarks.value = "";

        paymentMode.value = "Cash";

        advanceDate.value =
            new Date().toISOString().split("T")[0];

        await generateAdvanceNumber();

    }

    catch (error) {

        console.error(error);

        alert(error.message);

    }

});
