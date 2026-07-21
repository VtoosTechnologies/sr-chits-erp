//==================================================
// SR Chits ERP
// Member Ledger
// Part 3A
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

const chitAmount =
document.getElementById("chitAmount");

const group =
document.getElementById("group");

const member =
document.getElementById("member");

const searchBtn =
document.getElementById("searchBtn");

const ledgerBody =
document.getElementById("ledgerBody");

const totalDebit =
document.getElementById("totalDebit");

const totalCredit =
document.getElementById("totalCredit");

const closingBalance =
document.getElementById("closingBalance");

//==================================================
// Initial Load
//==================================================

loadChitAmounts();

//==================================================
// Load Chit Amounts
//==================================================

async function loadChitAmounts(){
    console.log("Member Ledger Loaded");

    chitAmount.innerHTML =
    '<option value="">Select Chit Amount</option>';

    const snapshot =
    await getDocs(collection(db,"groups"));
    console.log("Groups Count :", snapshot.size);

    const amounts = [];

    snapshot.forEach(doc=>{

        const data = doc.data();

        if(!amounts.includes(Number(data.chitAmount))){

            amounts.push(Number(data.chitAmount));

        }

    });

    amounts.sort((a,b)=>a-b);

    amounts.forEach(amount=>{

        const option =
        document.createElement("option");

        option.value = amount;

        option.textContent =
        "₹ " + amount.toLocaleString("en-IN");

        chitAmount.appendChild(option);

    });

}

//==================================================
// Load Groups
//==================================================

chitAmount.addEventListener("change",loadGroups);

async function loadGroups(){

    group.innerHTML =
    '<option value="">Select Group</option>';

    member.innerHTML =
    '<option value="">Select Member</option>';

    const snapshot =
    await getDocs(collection(db,"groups"));

    snapshot.forEach(doc=>{

        const data = doc.data();

        if(Number(data.chitAmount)===Number(chitAmount.value)){

            const option =
            document.createElement("option");

            option.value = data.groupCode;

            option.textContent =
            data.groupCode;

            group.appendChild(option);

        }

    });

}

//==================================================
// Load Members
//==================================================

group.addEventListener("change",loadMembers);

async function loadMembers(){

    member.innerHTML =
    '<option value="">Select Member</option>';

    const snapshot =
    await getDocs(collection(db,"members"));

snapshot.forEach(doc=>{

    const data = doc.data();

    if(data.groupCode === group.value){

        const option =
        document.createElement("option");

        option.value = doc.id;

        option.textContent =
        data.memberName;

        member.appendChild(option);

    }

});

}
//==================================================
// Search Ledger
//==================================================

searchBtn.addEventListener("click", loadLedger);

async function loadLedger(){
    alert("Selected Member ID : " + member.value);

    if(member.value===""){
        alert("Please select Member");
        return;
    }

    ledgerBody.innerHTML="";

    const ledgerQuery=query(
        collection(db,"memberLedger"),
        where("memberId","==",member.value),
    );
let snapshot;
    try{

    snapshot =
    await getDocs(ledgerQuery);

}
catch(error){

    alert(error.message);

    console.error(error);

    return;

}

    if(snapshot.empty){

        ledgerBody.innerHTML=`
        <tr>
            <td colspan="6" style="text-align:center;">
                No Ledger Found
            </td>
        </tr>`;

        totalDebit.textContent="₹ 0";
        totalCredit.textContent="₹ 0";
        closingBalance.textContent="₹ 0";

        return;
    }

    let debitTotal=0;
    let creditTotal=0;
    let balance=0;

    snapshot.forEach(doc=>{
        const data = doc.data();

debitTotal += Number(data.debit) || 0;
creditTotal += Number(data.credit) || 0;
balance = Number(data.balance) || 0;

        ledgerBody.innerHTML += `
        <tr>

            <td>${data.transactionDate}</td>

            <td>${data.receiptNo}</td>

            <td>${data.transactionType}</td>

            <td>
            ₹ ${Number(data.debit).toLocaleString("en-IN")}
            </td>

            <td>
            ₹ ${Number(data.credit).toLocaleString("en-IN")}
            </td>

            <td>
            ₹ ${Number(data.balance).toLocaleString("en-IN")}
            </td>

        </tr>`;
    });

    totalDebit.textContent =
    "₹ " + debitTotal.toLocaleString("en-IN");

    totalCredit.textContent =
    "₹ " + creditTotal.toLocaleString("en-IN");

    closingBalance.textContent =
    "₹ " + balance.toLocaleString("en-IN");

}
