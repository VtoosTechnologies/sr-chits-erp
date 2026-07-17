import { db } from "./firebase.js";

import {
collection,
addDoc,
getDocs
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

const saveMemberBtn = document.getElementById("saveMemberBtn");
const membersList = document.getElementById("membersList");
const groupSelect = document.getElementById("group");

// Load Groups
async function loadGroups(){

    const snapshot = await getDocs(collection(db,"groups"));

    snapshot.forEach((doc)=>{

        const data = doc.data();

        groupSelect.innerHTML += `
        <option value="${data.groupName}">
            ${data.groupName}
        </option>
        `;

    });

}

// Load Members
async function loadMembers(){

    membersList.innerHTML="";

    const snapshot = await getDocs(collection(db,"members"));

    snapshot.forEach((doc)=>{

        const data = doc.data();

        membersList.innerHTML += `
        <div class="member-card">

            <h3>${data.memberName}</h3>

            <p>Mobile : ${data.mobileNumber}</p>

            <p>Address : ${data.address}</p>

            <p>Aadhaar : ${data.aadhaarNumber}</p>

            <p>Group : ${data.group}</p>

            <p>Status : ${data.status}</p>

        </div>
        `;

    });

}

loadGroups();
loadMembers();

// Save Member
saveMemberBtn.addEventListener("click",async()=>{

const memberName=document.getElementById("memberName").value.trim();

const mobileNumber=document.getElementById("mobileNumber").value.trim();

const address=document.getElementById("address").value.trim();

const aadhaarNumber=document.getElementById("aadhaarNumber").value.trim();

const group=document.getElementById("group").value;

const status=document.getElementById("status").value;

if(
!memberName||
!mobileNumber||
!address||
!aadhaarNumber||
!group
){
alert("Please fill all fields");
return;
}

try{

await addDoc(collection(db,"members"),{

memberName,
mobileNumber,
address,
aadhaarNumber,
group,
status

});

alert("Member Added Successfully");

// Clear Form
document.getElementById("memberName").value="";
document.getElementById("mobileNumber").value="";
document.getElementById("address").value="";
document.getElementById("aadhaarNumber").value="";
document.getElementById("group").selectedIndex=0;
document.getElementById("status").value="Active";

loadMembers();

}
catch(error){

alert(error.message);

}

});
