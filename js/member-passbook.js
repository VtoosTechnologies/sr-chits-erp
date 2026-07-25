//==================================================
// SR Chits ERP
// Member Passbook V2.0
// Aadhaar Based Multi Group
//==================================================

import { db } from "./firebase.js";

import {
collection,
query,
where,
orderBy,
getDocs
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

//==================================================
// Session
//==================================================

const aadhaarNumber =
sessionStorage.getItem("aadhaarNumber");

if (!aadhaarNumber) {

    window.location.href =
    "member-login.html";

}

//==================================================
// Elements
//==================================================

const memberName =
document.getElementById("memberName");

const referenceNo =
document.getElementById("referenceNo");

const groupName =
document.getElementById("groupName");

const memberCode =
document.getElementById("memberCode");

const totalDebit =
document.getElementById("totalDebit");

const totalCredit =
document.getElementById("totalCredit");

const balance =
document.getElementById("balance");

const transactionList =
document.getElementById("transactionList");

//==================================================
// Helpers
//==================================================

function formatCurrency(value){

return "₹" +
Number(value || 0)
.toLocaleString("en-IN");

}

function formatDate(timestamp){

if(!timestamp) return "-";

if(timestamp.seconds){

const date =
new Date(timestamp.seconds * 1000);

return date.toLocaleDateString(
"en-GB"
);

}

return timestamp;

}
//==================================================
// Load Passbook
//==================================================

async function loadPassbook(){

try{

//--------------------------------------
// Get All Member Records
//--------------------------------------

const memberQuery = query(
collection(db,"members"),
where("aadhaarNumber","==",aadhaarNumber)
);

const memberSnapshot =
await getDocs(memberQuery);

if(memberSnapshot.empty){

alert("Member not found.");

return;

}

let memberIds = [];

let memberCodes = [];

let groupNames = [];

let firstMember = null;

memberSnapshot.forEach(docSnap=>{

const data = docSnap.data();

if(!firstMember){

firstMember = data;

}

memberIds.push(docSnap.id);

memberCodes.push(data.memberCode);

groupNames.push(data.groupName);

});

//--------------------------------------
// Header
//--------------------------------------

memberName.textContent =
firstMember.memberName || "-";

referenceNo.textContent =
firstMember.referenceNo || "-";

memberCode.textContent =
memberCodes.join(", ");

groupName.textContent =
groupNames.join(", ");

//--------------------------------------
// Read Ledger
//--------------------------------------

let allTransactions = [];

for(const id of memberIds){

const ledgerQuery = query(
collection(db,"memberLedger"),
where("memberId","==",id),
orderBy("transactionDate","asc")
);

const ledgerSnapshot =
await getDocs(ledgerQuery);

ledgerSnapshot.forEach(doc=>{

allTransactions.push(doc.data());

});

}

//--------------------------------------
// Sort Date
//--------------------------------------

allTransactions.sort((a,b)=>{

const d1 =
a.transactionDate.seconds || 0;

const d2 =
b.transactionDate.seconds || 0;

return d1-d2;

});

if(allTransactions.length===0){

transactionList.innerHTML=
`
<div class="empty">
No Transactions Found.
</div>
`;

return;

}

let html="";

let debitTotal=0;

let creditTotal=0;

let runningBalance=0;
            //--------------------------------------
        // Prepare Transactions
        //--------------------------------------

        allTransactions.forEach(data => {

            const debit = Number(data.debit || 0);
            const credit = Number(data.credit || 0);

            debitTotal += debit;
            creditTotal += credit;

            runningBalance = debitTotal - creditTotal;

            html += `
            <div class="transaction-item">

                <div class="transaction-header">

                    <span>${formatDate(data.transactionDate)}</span>

                    <span>${data.transactionType || "-"}</span>

                </div>

                <div class="transaction-body">

                    <div>
                        <strong>Group</strong><br>
                        ${data.groupName || "-"}
                    </div>

                    <div>
                        <strong>Receipt</strong><br>
                        ${data.receiptNo || "-"}
                    </div>

                    <div>
                        <strong>Installment</strong><br>
                        ${data.installmentNo || "-"}
                    </div>

                    <div>
                        <strong>Debit</strong><br>
                        ${formatCurrency(debit)}
                    </div>

                    <div>
                        <strong>Credit</strong><br>
                        ${formatCurrency(credit)}
                    </div>

                </div>

                <div class="transaction-footer">

                    Balance :
                    ${formatCurrency(runningBalance)}

                </div>

            </div>
            `;

        });

        transactionList.innerHTML = html;

        totalDebit.textContent = formatCurrency(debitTotal);
        totalCredit.textContent = formatCurrency(creditTotal);
        balance.textContent = formatCurrency(runningBalance);

    }
    catch(error){

        console.error(error);

        alert("Unable to load passbook.");

    }

}

loadPassbook();

//==================================================
// Back Button
//==================================================

document
.getElementById("backBtn")
.addEventListener("click",()=>{

    window.location.href =
    "member-dashboard.html";

});
