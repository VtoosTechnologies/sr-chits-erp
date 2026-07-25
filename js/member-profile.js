//==================================================
// Member Profile
//==================================================

import { db } from "../firebase.js";

import {
    doc,
    getDoc
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

const memberPhoto = document.getElementById("memberPhoto");

const memberName = document.getElementById("memberName");
const userId = document.getElementById("userId");

const profileMemberName = document.getElementById("profileMemberName");
const profileUserId = document.getElementById("profileUserId");
const referenceNo = document.getElementById("referenceNo");
const memberCode = document.getElementById("memberCode");
const memberNumber = document.getElementById("memberNumber");

const mobileNumber = document.getElementById("mobileNumber");
const address = document.getElementById("address");

const aadhaarNumber = document.getElementById("aadhaarNumber");
const accountStatus = document.getElementById("accountStatus");

const groupName = document.getElementById("groupName");
const groupCode = document.getElementById("groupCode");
const chitAmount = document.getElementById("chitAmount");
const monthlyAmount = document.getElementById("monthlyAmount");
const totalInstallments = document.getElementById("totalInstallments");
const joinDate = document.getElementById("joinDate");

//==================================================
// Mask Aadhaar
//==================================================

function maskAadhaar(value) {

    if (!value) return "-";

    const last4 = value.slice(-4);

    return "XXXX XXXX " + last4;
}

//==================================================
// Load Profile
//==================================================

async function loadProfile() {

    try {

        const docRef = doc(db, "members", memberId);

        const snap = await getDoc(docRef);

        if (!snap.exists()) {

            alert("Member not found.");

            return;
        }

        const data = snap.data();

        memberName.textContent = data.memberName || "-";
        userId.textContent = data.userId || "-";

        profileMemberName.textContent = data.memberName || "-";
        profileUserId.textContent = data.userId || "-";
        referenceNo.textContent = data.referenceNo || "-";
        memberCode.textContent = data.memberCode || "-";
        memberNumber.textContent = data.memberNumber || "-";

        mobileNumber.textContent = data.mobileNumber || "-";
        address.textContent = data.address || "-";

        aadhaarNumber.textContent =
            maskAadhaar(data.aadhaarNumber);

        accountStatus.textContent =
            data.accountStatus || "Active";

        groupName.textContent =
            data.groupName || "-";

        groupCode.textContent =
            data.groupCode || "-";

        chitAmount.textContent =
            data.chitAmount || "-";

        monthlyAmount.textContent =
            data.monthlyAmount || "-";

        totalInstallments.textContent =
            data.totalInstallments || "-";

        joinDate.textContent =
            data.joinDate || "-";

        if (data.photoURL) {

            memberPhoto.src = data.photoURL;

        }

    }
    catch (error) {

        console.error(error);

        alert("Unable to load profile.");

    }

}

loadProfile();

//==================================================
// Back Button
//==================================================

document.getElementById("backBtn")
.addEventListener("click", () => {

    window.location.href = "member-dashboard.html";

});

//==================================================
// Print
//==================================================

document.getElementById("printBtn")
.addEventListener("click", () => {

    window.print();

});
//==================================================
// Download PDF
//==================================================

document.getElementById("downloadPdfBtn")
.addEventListener("click", () => {

    const element = document.querySelector(".container");

    const member =
        profileMemberName.textContent || "Member";

    const user =
        profileUserId.textContent || "Profile";

    const options = {

        margin: 0.4,

        filename: `${user}_Profile.pdf`,

        image: {
            type: "jpeg",
            quality: 1
        },

        html2canvas: {
            scale: 2,
            useCORS: true
        },

        jsPDF: {
            unit: "in",
            format: "a4",
            orientation: "portrait"
        }

    };

    html2pdf()
        .set(options)
        .from(element)
        .save();

});
