import { db } from "./firebase.js";

import {
    collection,
    addDoc,
    getDocs,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

const saveGroupBtn = document.getElementById("saveGroupBtn");
const groupsList = document.getElementById("groupsList");

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
                <p><b>Monthly Amount :</b> ₹${data.monthlyAmount}</p>
                <p><b>Status :</b> ${data.status}</p>
            </div>
        `;

    });

}

loadGroups();

saveGroupBtn.addEventListener("click", async () => {

    const groupName = document.getElementById("groupName").value.trim();
    const chitAmount = Number(document.getElementById("chitAmount").value);
    const totalMembers = Number(document.getElementById("totalMembers").value);
    const duration = Number(document.getElementById("duration").value);
    const auctionDay = Number(document.getElementById("auctionDay").value);
    const startDate = document.getElementById("startDate").value;
    const status = document.getElementById("status").value;

    if (
        !groupName ||
        !chitAmount ||
        !totalMembers ||
        !duration ||
        !auctionDay ||
        !startDate
    ) {
        alert("Please fill all fields");
        return;
    }

    const monthlyAmount = chitAmount / duration;

    // Temporary Group Code
    const groupCode = "SR-01L-D01-G01";

    await addDoc(collection(db, "groups"), {
        groupCode,
        groupName,
        chitAmount,
        totalMembers,
        duration,
        auctionDay,
        startDate,
        monthlyAmount,
        status,
        createdAt: serverTimestamp()
    });

    alert("Group Added Successfully");

    document.getElementById("groupName").value = "";
    document.getElementById("chitAmount").value = "";
    document.getElementById("totalMembers").value = "";
    document.getElementById("duration").value = "";
    document.getElementById("auctionDay").value = "";
    document.getElementById("startDate").value = "";
    document.getElementById("monthlyAmount").value = "";
    document.getElementById("status").value = "Active";

    loadGroups();

});
