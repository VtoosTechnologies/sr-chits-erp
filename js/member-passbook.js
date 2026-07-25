//==================================================
// Member Passbook
//==================================================

import { db } from "./firebase.js";

import {
doc,
getDoc,
collection,
query,
where,
orderBy,
getDocs
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

//==================================================
// Session Check
//==================================================

const memberId = sessionStorage.getItem("memberId");

if (!memberId) {

    window.location.href = "member-login.html";

}

//==================================================
// Elements
//==================================================

const memberName = document.getElementById("memberName");
const referenceNo = document.getElementById("referenceNo");
const groupName = document.getElementById("groupName");
const memberCode = document.getElementById("memberCode");

const totalDebit = document.getElementById("totalDebit");
const totalCredit = document.getElementById("totalCredit");
const balance = document.getElementById("balance");

const transactionList = document.getElementById("transactionList");

//==================================================
// Currency Format
//==================================================

function formatCurrency(value) {

    return "₹" + Number(value || 0).toLocaleString("en-IN");

}

//==================================================
// Load Passbook
//==================================================

async function loadPassbook() {

    try {

        //--------------------------------------------------
        // Member Details
        //--------------------------------------------------

        const memberRef = doc(db, "members", memberId);

        const memberSnap = await getDoc(memberRef);

        if (!memberSnap.exists()) {

            alert("Member not found.");

            return;

        }

        const member = memberSnap.data();

        memberName.textContent =
            member.memberName || "-";

        referenceNo.textContent =
            member.referenceNo || "-";

        memberCode.textContent =
            member.memberCode || "-";

        groupName.textContent =
            member.groupName || "-";

        //--------------------------------------------------
        // Ledger Entries
        //--------------------------------------------------

        const ledgerQuery = query(
            collection(db, "memberLedger"),
            where("memberId", "==", memberId),
            orderBy("transactionDate", "asc")
        );

        const ledgerSnapshot = await getDocs(ledgerQuery);

        if (ledgerSnapshot.empty) {

            transactionList.innerHTML =
            `
            <div class="empty">
                No transactions found.
            </div>
            `;

            return;

        }

        let html = "";

        let debitTotal = 0;
        let creditTotal = 0;
        let runningBalance = 0;

        ledgerSnapshot.forEach(docSnap => {

            const data = docSnap.data();

            const debit =
                Number(data.debit || 0);

            const credit =
                Number(data.credit || 0);

            debitTotal += debit;
            creditTotal += credit;

            runningBalance =
                debitTotal - creditTotal;

            html +=

            `
            <div class="transaction-item">

                <div class="transaction-header">

                    <span>
                        ${data.transactionDate || "-"}
                    </span>

                    <span>
                        ${data.transactionType || "-"}
                    </span>

                </div>

                <div class="transaction-body">

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

        totalDebit.textContent =
            formatCurrency(debitTotal);

        totalCredit.textContent =
            formatCurrency(creditTotal);

        balance.textContent =
            formatCurrency(runningBalance);

    }

    catch (error) {

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
.addEventListener("click", () => {

    window.location.href =
        "member-dashboard.html";

});
