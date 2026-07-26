import { db } from "./firebase.js";

import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    serverTimestamp,
    doc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";
//==================================================
// Elements
//==================================================

const saveMemberBtn = document.getElementById("saveMemberBtn");
const membersList = document.getElementById("membersList");

//==================================================
// Load Members
//==================================================
let editId = null;

async function loadMembers() {

    membersList.innerHTML = "";

    const snapshot = await getDocs(collection(db, "members"));

    snapshot.forEach((memberDoc) => {

        const data = memberDoc.data();

        membersList.innerHTML += `

<div class="member-card">

<p><b>${data.referenceNo || "-"}</b></p>

<h3>${data.memberName}</h3>

<p><b>Mobile :</b> ${data.mobileNumber}</p>

<p><b>Address :</b> ${data.address}</p>

<p><b>Aadhaar :</b> ${data.aadhaarNumber}</p>

<p><b>Status :</b> ${data.status}</p>

<button onclick="editMember('${memberDoc.id}')">
✏️ Edit
</button>

</div>

`;

    });

}


loadMembers();
//==================================================
// Save Member
//==================================================

saveMemberBtn.addEventListener("click", async () => {

    const memberName = document.getElementById("memberName").value.trim();
    const mobileNumber = document.getElementById("mobileNumber").value.trim();
    const address = document.getElementById("address").value.trim();
    const aadhaarNumber = document.getElementById("aadhaarNumber").value.trim();
    const status = document.getElementById("status").value;

    if (
        !memberName ||
        !mobileNumber ||
        !address ||
        !aadhaarNumber
    ) {
        alert("Please fill all fields");
        return;
    }

    try {
        //=========================================
// Update Member
//=========================================

if (editId) {

    await updateDoc(doc(db, "members", editId), {

        memberName,
        mobileNumber,
        address,
        aadhaarNumber,
        status

    });

    alert("Member Updated Successfully");

    editId = null;

    saveMemberBtn.innerText = "Save Member";

    document.getElementById("memberName").value = "";
    document.getElementById("mobileNumber").value = "";
    document.getElementById("address").value = "";
    document.getElementById("aadhaarNumber").value = "";
    document.getElementById("status").value = "Active";

    loadMembers();

    return;

}

        //=========================================
        // Aadhaar Duplicate Check
        //=========================================

        const aadhaarQuery = query(
            collection(db, "members"),
            where("aadhaarNumber", "==", aadhaarNumber)
        );

        const aadhaarSnapshot = await getDocs(aadhaarQuery);

        if (!aadhaarSnapshot.empty) {
            alert("Member already exists with this Aadhaar Number");
            return;
        }

        //=========================================
        // Generate Reference No
        //=========================================

        const memberSnapshot = await getDocs(collection(db, "members"));

        const nextNo = memberSnapshot.size + 1;

        const referenceNo =
            `SR${String(nextNo).padStart(6, "0")}`;

        const password =
            mobileNumber.slice(-4);

        await addDoc(collection(db, "members"), {

            referenceNo,
            userId: referenceNo,

            password,
            passwordChanged: false,
            accountStatus: "Active",

            memberName,
            mobileNumber,
            address,
            aadhaarNumber,

            status,

            createdAt: serverTimestamp()

        });

        alert("Member Added Successfully");

        document.getElementById("memberName").value = "";
        document.getElementById("mobileNumber").value = "";
        document.getElementById("address").value = "";
        document.getElementById("aadhaarNumber").value = "";
        document.getElementById("status").value = "Active";

        loadMembers();

    } catch (error) {

        alert(error.message);

    }

});
//==================================================
// Member Search
//==================================================

const searchMember = document.getElementById("searchMember");

if (searchMember) {

    searchMember.addEventListener("keyup", () => {

        const keyword = searchMember.value.toLowerCase();

        const cards = document.querySelectorAll(".member-card");

        cards.forEach(card => {

            const text = card.innerText.toLowerCase();

            if (text.includes(keyword)) {

                card.style.display = "block";

            } else {

                card.style.display = "none";

            }

        });

    });

}
//==================================================
// Edit Member
//==================================================

window.editMember = async function(id) {

    const snapshot = await getDocs(collection(db, "members"));

    snapshot.forEach((memberDoc) => {

        if (memberDoc.id === id) {

            const data = memberDoc.data();

            document.getElementById("memberName").value = data.memberName;
            document.getElementById("mobileNumber").value = data.mobileNumber;
            document.getElementById("address").value = data.address;
            document.getElementById("aadhaarNumber").value = data.aadhaarNumber;
            document.getElementById("status").value = data.status;

            editId = id;

            saveMemberBtn.innerText = "Update Member";
        }

    });

};
