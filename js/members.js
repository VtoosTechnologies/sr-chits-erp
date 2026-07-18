import { db } from "./firebase.js";

import {
collection,
addDoc,
getDocs
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

const saveMemberBtn = document.getElementById("saveMemberBtn");
const membersList = document.getElementById("membersList");
const groupSelect = document.getElementById("group");

// ================================
// Load Groups
// ================================
async function loadGroups() {

    groupSelect.innerHTML = `
        <option value="">Select Group</option>
    `;

    const snapshot = await getDocs(collection(db, "groups"));

    snapshot.forEach((doc) => {

        const data = doc.data();

        groupSelect.innerHTML += `
           <option
    value="${doc.id}"
    data-code="${data.groupCode}">
    ${data.groupCode} - ${data.groupName}
</option> 
        `;

    });

}

// ================================
// Load Members
// ================================
async function loadMembers() {

    membersList.innerHTML = "";

    const snapshot = await getDocs(collection(db, "members"));

    snapshot.forEach((doc) => {

        const data = doc.data();

        membersList.innerHTML += `
            <div class="member-card">

                <p><b>${data.memberCode}</b></p>

                <h3>${data.memberName}</h3>

                <p><b>Mobile :</b> ${data.mobileNumber}</p>

                <p><b>Address :</b> ${data.address}</p>

                <p><b>Aadhaar :</b> ${data.aadhaarNumber}</p>

                <p><b>Group Code :</b> ${data.groupCode}</p>

                <p><b>Status :</b> ${data.status}</p>

            </div>
        `;

    });

}

loadGroups();
loadMembers();

// ================================
// Save Member
// ================================
saveMemberBtn.addEventListener("click", async () => {

    const memberName = document.getElementById("memberName").value.trim();

    const mobileNumber = document.getElementById("mobileNumber").value.trim();

    const address = document.getElementById("address").value.trim();

    const aadhaarNumber = document.getElementById("aadhaarNumber").value.trim();

    const group = document.getElementById("group").value;
    const groupSelect =
document.getElementById("group");

const groupCode =
groupSelect.options[groupSelect.selectedIndex]
.dataset.code;
    const status = document.getElementById("status").value;

    if (
        !memberName ||
        !mobileNumber ||
        !address ||
        !aadhaarNumber ||
        !group
    ) {
        alert("Please fill all fields");
        return;
    }

    try {

        // Generate Member Code
        const memberSnapshot = await getDocs(collection(db, "members"));

        const memberCount = memberSnapshot.size + 1;

        const memberCode =
            `${group}-M${String(memberCount).padStart(3, "0")}`;

        await addDoc(collection(db, "members"), {

            memberCode,

            memberName,

            mobileNumber,

            address,

            aadhaarNumber,

           groupId: group,

    groupCode: groupCode, 

            status

        });

        alert("Member Added Successfully");

        // Clear Form
        document.getElementById("memberName").value = "";
        document.getElementById("mobileNumber").value = "";
        document.getElementById("address").value = "";
        document.getElementById("aadhaarNumber").value = "";
        document.getElementById("group").selectedIndex = 0;
        document.getElementById("status").value = "Active";

        loadMembers();

    }
    catch (error) {

        alert(error.message);

    }

});
