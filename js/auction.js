//==================================================
// SR Chits ERP
// Auction Module
// Part - 3A
//==================================================

import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    query,
    where,
    addDoc,
    orderBy,
    limit,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

//==================================================
// Firestore Collections
//==================================================

const groupsRef = collection(db, "groups");
const membersRef = collection(db, "members");
const auctionsRef = collection(db, "auctions");

//==================================================
// Filter Elements
//==================================================

const chitAmountFilter =
document.getElementById("chitAmountFilter");

const auctionDayFilter =
document.getElementById("auctionDayFilter");

//==================================================
// Group Information
//==================================================

const groupCode =
document.getElementById("groupCode");

const groupName =
document.getElementById("groupName");

const totalMembers =
document.getElementById("totalMembers");

const duration =
document.getElementById("duration");

const currentMonth =
document.getElementById("currentMonth");

const startDate =
document.getElementById("startDate");

const groupStatus =
document.getElementById("groupStatus");

//==================================================
// Auction Elements
//==================================================

const auctionDate =
document.getElementById("auctionDate");

const winner =
document.getElementById("winner");

const winnerAlert =
document.getElementById("winnerAlert");

const chitValue =
document.getElementById("chitValue");

const thallu =
document.getElementById("thallu");

const kasar =
document.getElementById("kasar");

const prizeAmount =
document.getElementById("prizeAmount");

const monthlyAmount =
document.getElementById("monthlyAmount");

const dueDate =
document.getElementById("dueDate");

const remarks =
document.getElementById("remarks");

const saveAuction =
document.getElementById("saveAuction");

//==================================================
// Global Variables
//==================================================

let selectedGroup = null;

let currentAuctionMonth = 0;

//==================================================
// Initial Load
//==================================================

loadChitAmounts();
//==================================================
// Load Chit Amount Filter
//==================================================

async function loadChitAmounts(){

    chitAmountFilter.innerHTML =
    `<option value="">Select Chit Amount</option>`;

    const snapshot =
    await getDocs(groupsRef);

    const amounts = [];

    snapshot.forEach((doc)=>{

        const data = doc.data();

        if(
            !amounts.includes(data.chitAmount)
        ){

            amounts.push(data.chitAmount);

        }

    });

    amounts.sort((a,b)=>a-b);

    amounts.forEach((amount)=>{

        chitAmountFilter.innerHTML += `
        <option value="${amount}">
            ₹ ${Number(amount).toLocaleString("en-IN")}
        </option>`;

    });

}
//==================================================
// Chit Amount Change
//==================================================

chitAmountFilter.addEventListener(
    "change",
    loadAuctionDays
);

auctionDayFilter.addEventListener(
    "change",
    loadSelectedGroup
);

//==================================================
// Load Auction Days
//==================================================

async function loadAuctionDays(){

    auctionDayFilter.innerHTML =
    `<option value="">Select Auction Date</option>`;

    clearGroupDetails();

    if(chitAmountFilter.value=="") return;

    const q = query(
        groupsRef,
        where(
            "chitAmount",
            "==",
            Number(chitAmountFilter.value)
        )
    );

    const snapshot = await getDocs(q);

    const days = [];

    snapshot.forEach((doc)=>{

        const data = doc.data();

        if(!days.includes(data.auctionDay)){

            days.push(data.auctionDay);

        }

    });

    days.sort((a,b)=>a-b);

    days.forEach((day)=>{

        auctionDayFilter.innerHTML += `
        <option value="${day}">
            ${day}
        </option>`;

    });

}

//==================================================
// Load Selected Group
//==================================================

async function loadSelectedGroup(){

    clearGroupDetails();

    if(
        chitAmountFilter.value=="" ||
        auctionDayFilter.value==""
    ) return;

    const q = query(
        groupsRef,
        where(
            "chitAmount",
            "==",
            Number(chitAmountFilter.value)
        ),
        where(
            "auctionDay",
            "==",
            Number(auctionDayFilter.value)
        )
    );

    const snapshot =
    await getDocs(q);

    if(snapshot.empty){

        alert("Group Not Found");

        return;

    }

    snapshot.forEach((doc)=>{

        selectedGroup = {

            id:doc.id,

            ...doc.data()

        };

    });

    showGroupDetails();

    loadCurrentAuctionMonth();

}
//==================================================
// Show Group Details
//==================================================

function showGroupDetails(){

    groupCode.textContent =
    selectedGroup.groupCode;

    groupName.textContent =
    selectedGroup.groupName;

    totalMembers.textContent =
    selectedGroup.totalMembers;

    duration.textContent =
    selectedGroup.duration;

    startDate.textContent =
    selectedGroup.startDate;

    chitValue.value =
    selectedGroup.chitAmount;

    if(selectedGroup.status){

        groupStatus.textContent =
        selectedGroup.status;

    }

}

//==================================================
// Clear Group Details
//==================================================

function clearGroupDetails(){

    selectedGroup = null;

    groupCode.textContent="-";
    groupName.textContent="-";
    totalMembers.textContent="-";
    duration.textContent="-";
    startDate.textContent="-";

    currentMonth.textContent="-";

    chitValue.value="";

    auctionDate.value="";

    winner.innerHTML=
    `<option value="">Select Winner</option>`;

}
//==================================================
// Load Current Auction Month
//==================================================

async function loadCurrentAuctionMonth() {

    if (!selectedGroup) return;

    const q = query(
        auctionsRef,
        where("groupId", "==", selectedGroup.groupCode)
    );

    const snapshot = await getDocs(q);

    let maxMonth = 0;

    snapshot.forEach((doc) => {

        const data = doc.data();

        if ((data.month || 0) > maxMonth) {

            maxMonth = data.month;

        }

    });

    currentAuctionMonth = maxMonth + 1;

    if (currentAuctionMonth > Number(selectedGroup.duration)) {

        alert("All auctions completed for this group.");

        currentMonth.textContent = "Completed";

        auctionDate.value = "";

        dueDate.value = "";

        return;

    }

    currentMonth.textContent = currentAuctionMonth;

    calculateAuctionDate();

    calculateDueDate();

    loadMembers();

}
//==================================================
// Load Members
//==================================================

async function loadMembers() {

    winner.innerHTML =
    `<option value="">Select Winner</option>`;

    winnerAlert.style.display = "none";

    if (!selectedGroup) return;

    const q = query(
        membersRef,
        where("group", "==", selectedGroup.groupCode)
    );

    const snapshot = await getDocs(q);

    snapshot.forEach((doc) => {

        const data = doc.data();

        winner.innerHTML += `
        <option value="${doc.id}">
            ${data.memberCode} - ${data.memberName}
        </option>`;

    });

}
