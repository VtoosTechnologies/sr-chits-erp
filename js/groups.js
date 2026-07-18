import { db } from "./firebase.js";

import {
    collection,
    addDoc,
    getDocs,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

//==================================================
// Elements
//==================================================

const saveGroupBtn = document.getElementById("saveGroupBtn");
const groupsList = document.getElementById("groupsList");

const fixedMonthly = document.getElementById("fixedMonthly");
const monthlyAmountInput = document.getElementById("monthlyAmount");

//==================================================
// Fixed Monthly Checkbox
//==================================================

fixedMonthly.addEventListener("change", () => {

    monthlyAmountInput.disabled = !fixedMonthly.checked;

    if (!fixedMonthly.checked) {
        monthlyAmountInput.value = "";
    }

});

//==================================================
// Load Groups
//==================================================

async function loadGroups() {

    groupsList.innerHTML = "";

    const snapshot = await getDocs(collection(db, "groups"));

    snapshot.forEach((doc) => {

        const data = doc.data();

        groupsList.innerHTML += `

        <div class="group-card">

            <h3>${data.groupName}</h3>

            <p><b>Group Code :</b> ${data.groupCode}</p>

            <p><b>Chit Amount :</b> ₹${data.chitAmount}</p>

            <p><b>Total Members :</b> ${data.totalMembers}</p>

            <p><b>Duration :</b> ${data.duration} Months</p>

            <p><b>Auction Day :</b> ${data.auctionDay}</p>

            <p><b>Start Date :</b> ${data.startDate}</p>

            ${data.fixedMonthly
                ? `<p><b>Monthly Amount :</b> ₹${data.monthlyAmount}</p>`
                : `<p><b>Monthly Amount :</b> Variable</p>`
            }

            <p><b>Status :</b> ${data.status}</p>

        </div>

        `;

    });

}

loadGroups();
//==================================================
// Save Group
//==================================================

saveGroupBtn.addEventListener("click", async () => {

    const chitAmount = Number(document.getElementById("chitAmount").value);
    const totalMembers = Number(document.getElementById("totalMembers").value);
    const duration = Number(document.getElementById("duration").value);
    const auctionDay = Number(document.getElementById("auctionDay").value);
    const startDate = document.getElementById("startDate").value;
    const status = document.getElementById("status").value;

    const fixedMonthly = document.getElementById("fixedMonthly").checked;

    let monthlyAmount = 0;

    if (fixedMonthly) {
        monthlyAmount = Number(document.getElementById("monthlyAmount").value);

        if (!monthlyAmount || monthlyAmount <= 0) {
            alert("Please enter Monthly Amount");
            return;
        }
    }

    if (
        !chitAmount ||
        !totalMembers ||
        !duration ||
        !auctionDay ||
        !startDate
    ) {
        alert("Please fill all required fields");
        return;
    }

    //==============================================
    // Group Name
    //==============================================

    let groupName = "";

    if (chitAmount >= 100000) {
        groupName = `${chitAmount / 100000} Lakh Monthly Chit`;
    } else {
        groupName = `${chitAmount / 1000}K Monthly Chit`;
    }

    //==============================================
    // Group Code
    //==============================================

    const amountCode =
        chitAmount >= 100000
            ? String(chitAmount / 100000).padStart(2, "0") + "L"
            : Math.floor(chitAmount / 1000) + "K";

    const dayCode = String(auctionDay).padStart(2, "0");

    const groupSnapshot = await getDocs(collection(db, "groups"));

    const nextGroupNo = String(groupSnapshot.size + 1).padStart(2, "0");

    const groupCode = `SR-${amountCode}-D${dayCode}-G${nextGroupNo}`;

    //==============================================
    // Save
    //==============================================

    await addDoc(collection(db, "groups"), {
        groupCode,
        groupName,
        chitAmount,
        totalMembers,
        duration,
        auctionDay,
        startDate,
        fixedMonthly,
        monthlyAmount,
        status,
        createdAt: serverTimestamp()
    });

    alert("Group Added Successfully");

    //==============================================
    // Reset Form
    //==============================================

    document.getElementById("chitAmount").value = "";
    document.getElementById("totalMembers").value = "";
    document.getElementById("duration").value = "";
    document.getElementById("auctionDay").value = "";
    document.getElementById("startDate").value = "";
    document.getElementById("fixedMonthly").checked = false;
    document.getElementById("monthlyAmount").value = "";
    document.getElementById("monthlyAmount").disabled = true;
    document.getElementById("status").value = "Active";

    loadGroups();

});
