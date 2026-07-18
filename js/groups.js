import { db } from "./firebase.js";

import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

//==================================================
// Elements
//==================================================

const saveGroupBtn = document.getElementById("saveGroupBtn");
const groupsList = document.getElementById("groupsList");

const chitAmount = document.getElementById("chitAmount");
const totalMembers = document.getElementById("totalMembers");
const duration = document.getElementById("duration");
const auctionDay = document.getElementById("auctionDay");
const startDate = document.getElementById("startDate");
const fixedMonthly = document.getElementById("fixedMonthly");
const monthlyAmount = document.getElementById("monthlyAmount");
const status = document.getElementById("status");

let editId = null;

//==================================================
// Fixed Monthly
//==================================================

fixedMonthly.addEventListener("change", () => {

    monthlyAmount.disabled = !fixedMonthly.checked;

    if (!fixedMonthly.checked) {

        monthlyAmount.value = "";

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

<div style="display:flex;gap:10px;margin-top:15px">

<button onclick="editGroup('${groupDoc.id}')">
✏️ Edit
</button>

<button onclick="deleteGroup('${groupDoc.id}')">
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

    const chit = Number(chitAmount.value);
    const members = Number(totalMembers.value);
    const months = Number(duration.value);
    const day = Number(auctionDay.value);
    const start = startDate.value;
    const groupStatus = status.value;

    const isFixed = fixedMonthly.checked;

    let monthly = 0;

    if (isFixed) {

        monthly = Number(monthlyAmount.value);

        if (!monthly || monthly <= 0) {

            alert("Please enter Monthly Amount");
            return;

        }

    }

    if (
        !chit ||
        !members ||
        !months ||
        !day ||
        !start
    ) {

        alert("Please fill all required fields");
        return;

    }

    //=========================================
    // Group Name
    //=========================================

    let groupName = "";

    if (chit >= 100000) {

        groupName = `${chit / 100000} Lakh Monthly Chit`;

    } else {

        groupName = `${chit / 1000}K Monthly Chit`;

    }

    try {

        //=====================================
        // UPDATE
        //=====================================

        if (editId) {

            const oldDoc = await getDoc(doc(db, "groups", editId));

            const oldData = oldDoc.data();

            await updateDoc(doc(db, "groups", editId), {

                groupCode: oldData.groupCode,
                groupName,
                chitAmount: chit,
                totalMembers: members,
                duration: months,
                auctionDay: day,
                startDate: start,
                fixedMonthly: isFixed,
                monthlyAmount: monthly,
                status: groupStatus

            });

            alert("Group Updated Successfully");

            editId = null;

            saveGroupBtn.innerText = "Save Group";

        }

        //=====================================
        // NEW GROUP
        //=====================================

        else {

            const amountCode =
                chit >= 100000
                    ? String(chit / 100000).padStart(2, "0") + "L"
                    : Math.floor(chit / 1000) + "K";

            const dayCode =
                String(day).padStart(2, "0");

            const groupSnapshot =
                await getDocs(collection(db, "groups"));

            const nextNo =
                String(groupSnapshot.size + 1).padStart(2, "0");

            const groupCode =
                `SR-${amountCode}-D${dayCode}-G${nextNo}`;

            await addDoc(collection(db, "groups"), {

                groupCode,
                groupName,
                chitAmount: chit,
                totalMembers: members,
                duration: months,
                auctionDay: day,
                startDate: start,
                fixedMonthly: isFixed,
                monthlyAmount: monthly,
                status: groupStatus,
                createdAt: serverTimestamp()

            });

            alert("Group Added Successfully");

        }
                //=========================================
        // Reset Form
        //=========================================

        chitAmount.value = "";
        totalMembers.value = "";
        duration.value = "";
        auctionDay.value = "";
        startDate.value = "";
        fixedMonthly.checked = false;
        monthlyAmount.value = "";
        monthlyAmount.disabled = true;
        status.value = "Active";

        loadGroups();

    } catch (error) {

        alert(error.message);

    }

});

//==================================================
// Delete Group
//==================================================

window.deleteGroup = async function (id) {

    const ok = confirm("Are you sure you want to delete this group?");

    if (!ok) return;

    try {

        await deleteDoc(doc(db, "groups", id));

        alert("Group Deleted Successfully");

        loadGroups();

    } catch (error) {

        alert(error.message);

    }

};

//==================================================
// Edit Group
//==================================================

window.editGroup = async function (id) {

    try {

        const groupRef = doc(db, "groups", id);

        const snapshot = await getDoc(groupRef);

        if (!snapshot.exists()) {

            alert("Group not found");
            return;

        }

        const data = snapshot.data();

        editId = id;

        chitAmount.value = data.chitAmount;
        totalMembers.value = data.totalMembers;
        duration.value = data.duration;
        auctionDay.value = data.auctionDay;
        startDate.value = data.startDate;

        fixedMonthly.checked = data.fixedMonthly;
        monthlyAmount.disabled = !data.fixedMonthly;
        monthlyAmount.value = data.monthlyAmount || "";

        status.value = data.status;

        saveGroupBtn.innerText = "Update Group";

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    } catch (error) {

        alert(error.message);

    }

};
