//==================================================
// My Chits
//==================================================

import { db } from "./firebase.js";

import {
    doc,
    getDoc,
    collection,
    query,
    where,
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

const groupName = document.getElementById("groupName");
const detailGroupName = document.getElementById("detailGroupName");

const statusBadge = document.getElementById("statusBadge");

const chitAmount = document.getElementById("chitAmount");
const monthlyAmount = document.getElementById("monthlyAmount");

const groupCode = document.getElementById("groupCode");
const memberCode = document.getElementById("memberCode");
const memberNumber = document.getElementById("memberNumber");
const joinDate = document.getElementById("joinDate");
const totalInstallments = document.getElementById("totalInstallments");

//==================================================
// Load Member & Group
//==================================================

async function loadChitDetails() {

    try {

        const memberRef = doc(db, "members", memberId);

        const memberSnap = await getDoc(memberRef);

        if (!memberSnap.exists()) {

            alert("Member not found.");

            return;

        }

        const member = memberSnap.data();

        memberCode.textContent =
            member.memberCode || "-";

        memberNumber.textContent =
            member.memberNumber || "-";

        groupCode.textContent =
            member.groupCode || "-";

        joinDate.textContent =
            member.joinDate ||
            member.createdAt ||
            "-";

        statusBadge.textContent =
            member.accountStatus || "Active";

        if (member.groupCode) {

            const q = query(
                collection(db, "groups"),
                where("groupCode", "==", member.groupCode)
            );

            const snapshot = await getDocs(q);

            if (!snapshot.empty) {

                const group = snapshot.docs[0].data();

                groupName.textContent =
                    group.groupName || "-";

                detailGroupName.textContent =
                    group.groupName || "-";

                chitAmount.textContent =
                    "₹" +
                    Number(group.chitAmount || 0)
                    .toLocaleString("en-IN");

                monthlyAmount.textContent =
                    "₹" +
                    Number(group.monthlyAmount || 0)
                    .toLocaleString("en-IN");

                totalInstallments.textContent =
                    group.totalInstallments || "-";

            }

        }

    }

    catch (error) {

        console.error(error);

        alert("Unable to load chit details.");

    }

}

loadChitDetails();

//==================================================
// Back
//==================================================

document
.getElementById("backBtn")
.addEventListener("click", () => {

    window.location.href =
        "member-dashboard.html";

});

//==================================================
// Passbook
//==================================================

document
.getElementById("passbookBtn")
.addEventListener("click", () => {

    window.location.href =
        "member-passbook.html";

});

//==================================================
// Payment History
//==================================================

document
.getElementById("paymentBtn")
.addEventListener("click", () => {

    window.location.href =
        "member-payment-history.html";

});
