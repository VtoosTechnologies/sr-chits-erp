//==================================================
// SR Chits ERP
// Auction Module
// Part - 1
//==================================================

import { db } from "./firebase.js";

import {
collection,
getDocs,
query,
where,
addDoc,
serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

//==================================================
// Elements
//==================================================

const group = document.getElementById("group");
const winner = document.getElementById("winner");

const month = document.getElementById("month");
const auctionDate = document.getElementById("auctionDate");

const chitValue = document.getElementById("chitValue");
const thallu = document.getElementById("thallu");
const kasar = document.getElementById("kasar");

const prizeAmount = document.getElementById("prizeAmount");
const monthlyAmount = document.getElementById("monthlyAmount");

const dueDate = document.getElementById("dueDate");
const remarks = document.getElementById("remarks");

const saveAuction =
document.getElementById("saveAuction");

//==================================================
// Firestore Collections
//==================================================

const groupsRef =
collection(db,"groups");

const membersRef =
collection(db,"members");

const auctionsRef =
collection(db,"auctions");
//==================================================
// Load Groups
//==================================================

async function loadGroups() {

    group.innerHTML =
    `<option value="">Select Group</option>`;

    const snapshot =
    await getDocs(groupsRef);

    snapshot.forEach((doc) => {

        const data = doc.data();

        group.innerHTML += `
        <option value="${data.groupCode}">
            ${data.groupName}
        </option>`;

    });

}

loadGroups();

//==================================================
// Load Members Based On Group
//==================================================

group.addEventListener("change", loadMembers);

async function loadMembers() {

    winner.innerHTML =
    `<option value="">Select Winner</option>`;

    if(group.value=="") return;

    const q = query(
        membersRef,
        where("group","==",group.value)
    );

    const snapshot =
    await getDocs(q);

    snapshot.forEach((doc)=>{

        const data = doc.data();

        winner.innerHTML += `
        <option value="${doc.id}">
            ${data.memberName}
        </option>`;

    });

}
//==================================================
// Auto Calculation
//==================================================

thallu.addEventListener("input", calculateAmounts);
kasar.addEventListener("input", calculateAmounts);
group.addEventListener("change", loadGroupDetails);

let selectedGroup = null;

//==================================================
// Load Selected Group Details
//==================================================

async function loadGroupDetails() {

    selectedGroup = null;

    chitValue.value = "";
    prizeAmount.value = "";
    monthlyAmount.value = "";

    if(group.value == "") return;

    const snapshot = await getDocs(groupsRef);

    snapshot.forEach((doc) => {

        const data = doc.data();

        if(data.groupCode == group.value){

            selectedGroup = data;

            chitValue.value = data.chitAmount || 0;

            calculateAmounts();
            loadNextMonth();

        }

    });

}

//==================================================
// Calculate Prize & Monthly Amount
//==================================================

function calculateAmounts() {

    if(!selectedGroup) return;

    const chit = Number(chitValue.value) || 0;
    const discount = Number(thallu.value) || 0;
    const expense = Number(kasar.value) || 0;

    // Prize Amount
    const prize = chit - discount - expense;

    prizeAmount.value = prize;

    // Monthly Payable
    const members = Number(selectedGroup.totalMembers) || 1;

    const monthly = Math.ceil((chit - discount) / members);

    monthlyAmount.value = monthly;

}
//==================================================
// Load Next Auction Month
//==================================================

async function loadNextMonth() {

    if (!selectedGroup) return;

    const q = query(
        auctionsRef,
        where("groupCode", "==", selectedGroup.groupCode)
    );

    const snapshot = await getDocs(q);

    const nextMonth = snapshot.size + 1;

    if (nextMonth > selectedGroup.duration) {

        alert("All auctions completed for this group.");

        month.value = "";
        auctionDate.value = "";

        return;
    }

    month.value = nextMonth;
    calculateAuctionDate(nextMonth);

}
//==================================================
// Calculate Auction Date
//==================================================

function calculateAuctionDate(monthNo) {

    if (!selectedGroup) return;

    const start = new Date(selectedGroup.startDate);

    start.setMonth(start.getMonth() + (monthNo - 1));

    const year = start.getFullYear();
    const monthValue = String(start.getMonth() + 1).padStart(2, "0");
    const day = String(start.getDate()).padStart(2, "0");

    auctionDate.value = `${year}-${monthValue}-${day}`;

}
//==================================================
// Save Auction
//==================================================

saveAuction.addEventListener("click", saveAuctionData);

async function saveAuctionData() {

    // Validation

    if(group.value==""){
        alert("Please Select Group");
        return;
    }

    if(month.value==""){
        alert("Please Enter Month");
        return;
    }

    if(winner.value==""){
        alert("Please Select Winner");
        return;
    }

    //==============================================
    // Duplicate Winner Check
    //==============================================

    const duplicateQuery = query(
        auctionsRef,
        where("groupId","==",group.value),
        where("winnerId","==",winner.value)
    );

    const duplicateSnapshot =
    await getDocs(duplicateQuery);

    if(!duplicateSnapshot.empty){

        const proceed = confirm(
            "This member has already won this chit.\n\nDo you want to continue?"
        );

        if(!proceed){
            return;
        }

    }
      //==============================================
    // Save Auction to Firestore
    //==============================================

    const winnerText =
    winner.options[winner.selectedIndex].text;

    await addDoc(auctionsRef, {

        groupId: group.value,
        month: Number(month.value),

        auctionDate: auctionDate.value,

        winnerId: winner.value,
        winnerName: winnerText,

        chitValue: Number(chitValue.value),

        thallu: Number(thallu.value) || 0,
        kasar: Number(kasar.value) || 0,

        prizeAmount: Number(prizeAmount.value),

        monthlyAmount: Number(monthlyAmount.value),

        dueDate: dueDate.value,

        remarks: remarks.value,

        status: "Published",

        createdAt: serverTimestamp()

    });

    alert("Auction Saved Successfully.");

    //==============================================
    // Clear Form
    //==============================================

    month.value = "";
    auctionDate.value = "";
    winner.innerHTML =
    '<option value="">Select Winner</option>';

    chitValue.value = "";
    thallu.value = "";
    kasar.value = "";
    prizeAmount.value = "";
    monthlyAmount.value = "";
    dueDate.value = "";
    remarks.value = "";

    group.value = "";

}
