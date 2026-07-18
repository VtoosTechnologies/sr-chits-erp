import { db } from "./firebase.js";

import {
    collection,
    addDoc,
    getDocs,
    serverTimestamp,
    doc,
    deleteDoc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

//==================================================
// Elements
//==================================================

const saveGroupBtn = document.getElementById("saveGroupBtn");
const groupsList = document.getElementById("groupsList");

const fixedMonthly = document.getElementById("fixedMonthly");
const monthlyAmountInput = document.getElementById("monthlyAmount");

let editId = null;

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

    snapshot.forEach((groupDoc) => {

        const data = groupDoc.data();

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

<div style="margin-top:15px;display:flex;gap:10px;">

<button
onclick="editGroup('${groupDoc.id}')">

✏️ Edit

</button>

<button
onclick="deleteGroup('${groupDoc.id}')">

🗑 Delete

</button>

</div>

</div>

`;

    });

}

loadGroups();
//==================================================
// Save / Update Group
//==================================================

saveGroupBtn.addEventListener("click", async () => {

    const chitAmount = Number(document.getElementById("chitAmount").value);
    const totalMembers = Number(document.getElementById("totalMembers").value);
    const duration = Number(document.getElementById("duration").value);
    const auctionDay = Number(document.getElementById("auctionDay").value);
    const startDate = document.getElementById("startDate").value;
    const status = document.getElementById("status").value;

    const isFixedMonthly = document.getElementById("fixedMonthly").checked;

    let monthlyAmount = 0;

    if (isFixedMonthly) {

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

    let groupName = "";

    if (chitAmount >= 100000) {

        groupName = `${chitAmount / 100000} Lakh Monthly Chit`;

    } else {

        groupName = `${chitAmount / 1000}K Monthly Chit`;

    }

    try {

        //========================================
        // UPDATE
        //========================================

        if (editId) {

            const groupCode =
                document.getElementById("groupCode").value;

            await updateDoc(doc(db, "groups", editId), {

                groupCode,
                groupName,
                chitAmount,
                totalMembers,
                duration,
                auctionDay,
                startDate,
                fixedMonthly: isFixedMonthly,
                monthlyAmount,
                status

            });

            alert("Group Updated Successfully");

            editId = null;

            saveGroupBtn.innerText = "Save Group";

        }

        //========================================
        // ADD NEW
        //========================================

        else {

            const amountCode =
                chitAmount >= 100000
                    ? String(chitAmount / 100000).padStart(2, "0") + "L"
                    : Math.floor(chitAmount / 1000) + "K";

            const dayCode =
                String(auctionDay).padStart(2, "0");

            const groupSnapshot =
                await getDocs(collection(db, "groups"));

            const nextGroupNo =
                String(groupSnapshot.size + 1).padStart(2, "0");

            const groupCode =
                `SR-${amountCode}-D${dayCode}-G${nextGroupNo}`;

            await addDoc(collection(db, "groups"), {

                groupCode,
                groupName,
                chitAmount,
                totalMembers,
                duration,
                auctionDay,
                startDate,
                fixedMonthly: isFixedMonthly,
                monthlyAmount,
                status,
                createdAt: serverTimestamp()

            });

            alert("Group Added Successfully");

        }

        //========================================
        // Reset Form
        //========================================

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

    }

    catch (error) {

        alert(error.message);

    }

});

//==================================================
// Delete Group
//==================================================

window.deleteGroup = async function (id) {

    const ok = confirm("Are you sure you want to delete this group?");

    if (!ok) return;

    await deleteDoc(doc(db, "groups", id));

    alert("Group Deleted Successfully");

    loadGroups();

};

//==================================================
// Edit Group
//==================================================

window.editGroup = async function (id) {

    alert("Edit feature will be completed in Part 3.");

};
