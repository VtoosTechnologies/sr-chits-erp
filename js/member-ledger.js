//==================================================
// SR Chits ERP
// Member Ledger V3
// Part 1
//==================================================

import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    query,
    where,
    orderBy
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
const referenceNo =
document.getElementById("referenceNo");


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
// Live Search
//==================================================

searchMember.addEventListener("input", async () => {
    try {

        const keyword = searchMember.value.trim().toLowerCase();

        memberList.innerHTML = "";
        memberList.style.display = "none";

        if (keyword.length < 2) return;

        const snapshot = await getDocs(collection(db, "members"));

        const results = [];

        snapshot.forEach(doc => {

            const data = doc.data();

            const reference =
(data.referenceNo || "").toLowerCase();

const code =
(data.memberCode || "").toLowerCase();

const name =
(data.memberName || "").toLowerCase();

const mobile =
(data.mobileNumber || "").toLowerCase();

if(

reference.includes(keyword) ||

code.includes(keyword) ||

name.includes(keyword) ||

mobile.includes(keyword)

)
             {

               results.push({
    id: doc.id,
    ...data
});

            }

        });
        const uniqueMembers = {};

results.forEach(member => {

    const key = member.aadhaarNumber;

    if (!uniqueMembers[key]) {
        uniqueMembers[key] = member;
    }

});

renderMemberList(Object.values(uniqueMembers));

    } catch (error) {

        console.error(error);
        alert(error.message);

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

        const div=document.createElement("div");

        div.className="search-item";

        div.innerHTML=`

<strong>${member.memberName}</strong><br>

<small>
${member.referenceNo}
</small>

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

    searchMember.value =
    member.memberName;

    memberList.style.display="none";
    memberList.innerHTML="";

    selectedMemberCard.style.display="block";
    referenceNo.textContent =
member.referenceNo || "-";
memberCode.textContent =
member.memberCode || "-";
    memberName.textContent =
    member.memberName || "-";

    memberMobile.textContent =
    member.mobileNumber || "-";

    ledgerBody.innerHTML = `
        <tr>
            <td colspan="8">
                Loading Ledger...
            </td>
        </tr>
    `;

    await loadLedger();

}
//==================================================
// Load Ledger
// Part 3
//==================================================
async function loadLedger() {
    try {

    ledger = [];

    let debitTotal = 0;
    let creditTotal = 0;

    const ledgerSnap = await getDocs(
        query(
            collection(db, "memberLedger"),
            where(
                "memberId",
                "==",
                selectedMember.referenceNo
            )
        )
    );

    ledgerSnap.forEach(doc => {

        const data = doc.data();

const debit =
    Number(data.debit || 0);

const credit =
    Number(data.credit || 0);

// Outstanding calculation-ku
// Installment transactions mattum eduthukkanum

if (
    data.transactionType === "INSTALLMENT_DUE" ||
    data.transactionType === "INSTALLMENT_COLLECTION"
) {

    debitTotal += debit;
    creditTotal += credit;

}

        ledger.push({
date:
data.transactionDate?.toDate?.() ||
data.createdAt?.toDate?.() ||
data.transactionDate ||
data.createdAt,


receiptNo:
data.receiptNo || "-",

type:
data.transactionType || "-",

group:
data.groupCode || "-",

debit:
debit,

credit:
credit,

balance:
Number(data.balance || 0),

remarks:
data.remarks || "",
prizeAmount:
Number(data.prizeAmount || 0),            

adjustedAmount:
Number(data.adjustedAmount || 0)

});

    });

    ledger.sort((a, b) => a.date - b.date);

   const outstandingTotal =
debitTotal - creditTotal;

renderLedger(
    debitTotal,
    creditTotal,
    outstandingTotal
);
        } catch (error) {

        console.error(error);
        alert(error.message);

    }

}
//==================================================
// Render Ledger
//==================================================

function renderLedger(
    totalDebitValue,
    totalCreditValue,
    outstandingTotal
){

    ledgerBody.innerHTML = "";

    if(ledger.length === 0){

        ledgerBody.innerHTML = `
        <tr>
            <td colspan="8">
                No Ledger Records Found
            </td>
        </tr>
        `;

        totalDebit.textContent = "₹0";
        totalCredit.textContent = "₹0";
        closingBalance.textContent = "₹0";

        return;

    }

    let runningBalance = 0;

    ledger.forEach(item=>{
if (
    item.type === "INSTALLMENT_DUE" ||
    item.type === "INSTALLMENT_COLLECTION"
) {

    runningBalance += Number(item.debit || 0);
    runningBalance -= Number(item.credit || 0);

}

        const tr = document.createElement("tr");
tr.innerHTML = `
<td>${formatDate(item.date)}</td>

<td>${item.receiptNo}</td>

<td>${item.type}</td>

<td>${item.group}</td>

<td>
${
item.type === "PRIZE_AMOUNT_RECEIVED"

?

"-"

:

`₹${Number(item.debit || 0).toLocaleString("en-IN")}`
}
</td>

<td>
${
item.type === "Advance Adjustment"
?
`Adjusted ₹${Number(item.adjustedAmount || 0).toLocaleString("en-IN")}`

:

item.type === "PRIZE_AMOUNT_RECEIVED"

?

"-"

:

`₹${Number(item.credit || 0).toLocaleString("en-IN")}`
}
</td>

<td>
₹${runningBalance.toLocaleString("en-IN")}
</td>

<td>
${
item.type === "PRIZE_AMOUNT_RECEIVED"
?
`Prize Amount Received ₹${item.prizeAmount.toLocaleString("en-IN")} (Information Only)`
:
item.remarks
}
</td>
`;
        ledgerBody.appendChild(tr);

    });

    totalDebit.textContent =
        "₹" + totalDebitValue.toLocaleString("en-IN");

    totalCredit.textContent =
        "₹" + totalCreditValue.toLocaleString("en-IN");

    if(outstandingTotal > 0){

    closingBalance.textContent =
    "₹" + outstandingTotal.toLocaleString("en-IN");

}else if(outstandingTotal < 0){

    closingBalance.textContent =
    "Advance ₹" +
    Math.abs(outstandingTotal).toLocaleString("en-IN");

}else{

    closingBalance.textContent = "₹0";

    }

}

//==================================================
// Format Date
//==================================================
function formatDate(date){

    if(!date) return "-";

    const d = new Date(date);

    if(isNaN(d.getTime())){
        return "-";
    }

    return d.toLocaleDateString("en-GB");

}
//==================================================
// Print
//==================================================

printBtn.addEventListener("click",()=>{

    window.print();

});
