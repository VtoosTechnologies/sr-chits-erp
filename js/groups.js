import { db } from "./firebase.js";

import {
    collection,
    addDoc,
    getDocs
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
                <p>Chit Amount : ₹${data.chitAmount}</p>
                <p>Total Members : ${data.totalMembers}</p>
                <p>Monthly Amount : ₹${data.monthlyAmount}</p>
                <p>Duration : ${data.duration} Months</p>
                <p>Status : ${data.status}</p>
            </div>
        `;

    });

}

loadGroups();

saveGroupBtn.addEventListener("click", async () => {

    const groupName = document.getElementById("groupName").value.trim();
    const chitAmount = Number(document.getElementById("chitAmount").value);
    const totalMembers = Number(document.getElementById("totalMembers").value);
    const monthlyAmount = Number(document.getElementById("monthlyAmount").value);
    const duration = Number(document.getElementById("duration").value);
    const status = document.getElementById("status").value;

    if (
        !groupName ||
        !chitAmount ||
        !totalMembers ||
        !monthlyAmount ||
        !duration
    ) {
        alert("Please fill all fields");
        return;
    }

    await addDoc(collection(db, "groups"), {
        groupName,
        chitAmount,
        totalMembers,
        monthlyAmount,
        duration,
        status
    });

    alert("Group Added Successfully");

    document.getElementById("groupName").value = "";
    document.getElementById("chitAmount").value = "";
    document.getElementById("totalMembers").value = "";
    document.getElementById("monthlyAmount").value = "";
    document.getElementById("duration").value = "";
    document.getElementById("status").value = "Active";

    loadGroups();

});
