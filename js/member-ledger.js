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

            const name = (data.memberName || "").toLowerCase();
            const mobile = (data.mobileNumber || "").toLowerCase();

            if (
                name.includes(keyword) ||
                mobile.includes(keyword)
            ) {

                results.push({
                    id: doc.id,
                    ...data
                });

            }

        });

        renderMemberList(results);

    } catch (error) {

        console.error(error);
        alert(error.message);

    }

});
//==================================================
// Render Member List
//==================================================

function renderMemberList(list){
alert("Members Found : " + list.length);
    memberList.innerHTML="";

    if(list.length===0){

        memberList.style.display="none";
        return;

    }

    memberList.style.display="block";
memberList.style.border = "2px solid red";
    list.forEach(member=>{

        const div=document.createElement("div");

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

    searchMember.value =
    member.memberName;

    memberList.style.display="none";
    memberList.innerHTML="";

    selectedMemberCard.style.display="block";

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
// Load Ledger
// Part 3
//==================================================

async function loadLedger(){

    ledger = [];

    let debitTotal = 0;
    let creditTotal = 0;
    let outstandingTotal = 0;

    //--------------------------------------------------
    // 1. Advance Given (Debit)
    //--------------------------------------------------

    const advanceSnap = await getDocs(
        query(
            collection(db,"advances"),
            where("memberId","==",selectedMember.memberId)
        )
    );

    advanceSnap.forEach(doc=>{

        const data = doc.data();

        const amount =
            Number(data.advanceAmount || 0);

        debitTotal += amount;

        ledger.push({

            date:
                data.createdAt?.toDate?.() ||
                new Date(),

            type:"Advance Given",

            group:
                data.advanceNo || "Advance",

            debit:amount,

            credit:0

        });

    });

    //--------------------------------------------------
    // 2. Advance Adjustment (Credit)
    //--------------------------------------------------

    const advanceLedgerSnap = await getDocs(
        query(
            collection(db,"advanceLedger"),
            where("memberId","==",selectedMember.memberId)
        )
    );

    advanceLedgerSnap.forEach(doc=>{

        const data = doc.data();

        const amount =
            Number(data.adjustedAmount || 0);

       ledger.push({

    date:
        data.createdAt?.toDate?.() ||
        new Date(),

    type:"Advance Adjustment",

    group:
        data.advanceNo || "Advance",

    debit:0,

    credit:0,

    adjustedAmount:amount

}); 

    });
        //--------------------------------------------------
    // 3. Collections (Credit)
    //--------------------------------------------------

    const collectionSnap = await getDocs(
        query(
            collection(db,"collections"),
            where("memberId","==",selectedMember.memberId)
        )
    );

    collectionSnap.forEach(doc=>{

        const data = doc.data();

        const amount =
            Number(data.receivedAmount || 0);

        // Advance Adjustment collection-ஐ skip
        if(data.groupCode === "ADVANCE"){
            return;
        }

        creditTotal += amount;

        ledger.push({

            date:
                data.createdAt?.toDate?.() ||
                new Date(),

            type:"Collection",

            group:
                data.groupCode || "-",

            debit:0,

            credit:amount

        });

    });
//--------------------------------------------------
// 4. Installment Due (Debit)
//--------------------------------------------------

const pendingSnap = await getDocs(
    query(
        collection(db,"pendingRegister"),
        where("memberId","==",selectedMember.memberId)
    )
);

pendingSnap.forEach(doc=>{

    const data = doc.data();

    const amount =
        Number(data.pendingAmount || 0);

    debitTotal += amount;

    ledger.push({

        date:
            data.createdAt?.toDate?.() ||
            new Date(),

        type:"Installment Due",

        group:
            data.groupCode || "-",

        debit:amount,

        credit:0

    });

});

    //--------------------------------------------------
    // Sort Ledger
    //--------------------------------------------------

    ledger.sort((a,b)=>a.date-b.date);

   const outstandingTotal =
    debitTotal - creditTotal;

renderLedger(
    debitTotal,
    creditTotal,
    outstandingTotal
); 

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
            <td colspan="6">
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

        runningBalance += Number(item.debit || 0);
        runningBalance -= Number(item.credit || 0);

        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${formatDate(item.date)}</td>
            <td>${item.type}</td>
            <td>${item.group}</td>
            <td>₹${Number(item.debit || 0).toLocaleString("en-IN")}</td>
            <td>
${
item.type==="Advance Adjustment"
?
`Adjusted ₹${Number(item.adjustedAmount||0).toLocaleString("en-IN")}`
:
`₹${Number(item.credit||0).toLocaleString("en-IN")}`
}
</td>
            <td>₹${runningBalance.toLocaleString("en-IN")}</td>
        `;

        ledgerBody.appendChild(tr);

    });

    totalDebit.textContent =
        "₹" + totalDebitValue.toLocaleString("en-IN");

    totalCredit.textContent =
        "₹" + totalCreditValue.toLocaleString("en-IN");

    closingBalance.textContent =
        "₹" + outstandingTotal.toLocaleString("en-IN");

}

//==================================================
// Format Date
//==================================================

function formatDate(date){

    if(!date) return "-";

    try{

        const d = new Date(date);

        return d.toLocaleDateString("en-GB");

    }catch{

        return "-";

    }

}

//==================================================
// Print
//==================================================

printBtn.addEventListener("click",()=>{

    window.print();

});
