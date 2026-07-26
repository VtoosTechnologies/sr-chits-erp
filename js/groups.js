import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    writeBatch,
    serverTimestamp,
  query,
    where
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

//==================================================
// Member Selection
//==================================================

const memberSearch = document.getElementById("memberSearch");
const searchResults = document.getElementById("searchResults");
const selectedMembersDiv = document.getElementById("selectedMembers");
const selectedCount = document.getElementById("selectedCount");

let selectedMembers = [];
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
// Render Selected Members
//==================================================

function renderSelectedMembers() {

    selectedMembersDiv.innerHTML = "";

    selectedCount.textContent = selectedMembers.length;

    selectedMembers.forEach((member, index) => {

        const card = document.createElement("div");

        card.className = "member-card";

        card.innerHTML = `
            <h3>${member.memberName}</h3>
            <p><b>Customer ID :</b> ${member.referenceNo}</p>

            <button class="removeBtn" data-index="${index}">
                ❌ Remove
            </button>
        `;

        selectedMembersDiv.appendChild(card);

    });

    document.querySelectorAll(".removeBtn").forEach(btn => {

        btn.addEventListener("click", () => {

            selectedMembers.splice(Number(btn.dataset.index), 1);

            renderSelectedMembers();

            searchMembers(memberSearch.value);

        });

    });

}

//==================================================
// Search Members
//==================================================

async function searchMembers(keyword = "") {

    searchResults.innerHTML = "";

    const snapshot = await getDocs(collection(db, "members"));

    snapshot.forEach((memberDoc) => {

        const data = memberDoc.data();

        const text = (
            (data.memberName || "") +
            (data.mobileNumber || "") +
            (data.aadhaarNumber || "") +
            (data.referenceNo || "")
        ).toLowerCase();

        if (!text.includes(keyword.toLowerCase())) return;

        if (selectedMembers.some(m => m.id === memberDoc.id)) return;

        const card = document.createElement("div");

        card.className = "member-card";

        card.innerHTML = `
            <h3>${data.memberName}</h3>
            <p><b>Customer ID :</b> ${data.referenceNo}</p>

            <button class="addBtn">
                ➕ Add
            </button>
        `;

        card.querySelector(".addBtn").addEventListener("click", () => {

            selectedMembers.push({
                id: memberDoc.id,
                ...data
            });

            renderSelectedMembers();

            searchMembers(memberSearch.value);

        });

        searchResults.appendChild(card);

    });

}

//==================================================
// Live Search
//==================================================

memberSearch.addEventListener("input", () => {

    searchMembers(memberSearch.value);

});

// First Load
searchMembers();
//==================================================
// Save Group
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

    if (!chit || !members || !months || !day || !start) {
        alert("Please fill all required fields");
        return;
    }

    if (selectedMembers.length !== members) {
        alert(`Please select exactly ${members} members.`);
        return;
    }

    let groupName;

    if (chit >= 100000) {
        groupName = `${chit / 100000} Lakh Monthly Chit`;
    } else {
        groupName = `${chit / 1000}K Monthly Chit`;
    }

    const amountCode =
        chit >= 100000
            ? String(chit / 100000).padStart(2, "0") + "L"
            : Math.floor(chit / 1000) + "K";

    const dayCode = String(day).padStart(2, "0");

    const groupSnapshot = await getDocs(collection(db, "groups"));

    const nextNo = String(groupSnapshot.size + 1).padStart(2, "0");

    const groupCode = `SR-${amountCode}-D${dayCode}-G${nextNo}`;

    // Create Group

    const groupRef = await addDoc(collection(db, "groups"), {

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

    // Create Group Members

    const batch = writeBatch(db);

    selectedMembers.forEach((member, index) => {

        const groupMemberRef =
            doc(collection(db, "groupMembers"));

       batch.set(groupMemberRef, {

    groupId: groupRef.id,

    groupCode: groupCode,

    memberId: member.id,

    referenceNo: member.referenceNo,

    aadhaarNumber: member.aadhaarNumber,

    mobileNumber: member.mobileNumber,

    address: member.address,

    memberName: member.memberName,

    memberNumber: index + 1,

    memberCode:
    `${groupCode}-M${String(index + 1).padStart(3,"0")}`,

    joinedDate: serverTimestamp()

}); 

    });

    await batch.commit();

    alert("Group Created Successfully");

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
// Delete Group
//==================================================

window.deleteGroup = async function (groupId) {

    const ok = confirm("Are you sure you want to delete this group?");

    if (!ok) return;

    try {

        // Delete groupMembers
        const q = query(
            collection(db, "groupMembers"),
            where("groupId", "==", groupId)
        );

        const snapshot = await getDocs(q);

        const batch = writeBatch(db);

        snapshot.forEach((item) => {

            batch.delete(item.ref);

        });

        // Delete Group
        batch.delete(doc(db, "groups", groupId));

        await batch.commit();

        alert("Group Deleted Successfully");

        loadGroups();

    } catch (error) {

        alert(error.message);

    }

};
