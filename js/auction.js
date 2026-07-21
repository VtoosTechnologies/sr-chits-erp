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
alert("Auction JS New Version");
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
        where("groupId", "==", selectedGroup.id)
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
// Calculate Auction Date
//==================================================

function calculateAuctionDate() {

    if (!selectedGroup) return;

    const start = new Date(selectedGroup.startDate);

    start.setMonth(
        start.getMonth() + (currentAuctionMonth - 1)
    );

    const year = start.getFullYear();

    const monthValue = String(
        start.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        start.getDate()
    ).padStart(2, "0");

    auctionDate.value =
        `${year}-${monthValue}-${day}`;

}
//==================================================
// Calculate Due Date
//==================================================

function calculateDueDate() {

    if (!auctionDate.value) return;

    const due = new Date(auctionDate.value);

    due.setMonth(due.getMonth() + 1);

    const year = due.getFullYear();

    const monthValue = String(
        due.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        due.getDate()
    ).padStart(2, "0");

    dueDate.value =
        `${year}-${monthValue}-${day}`;

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
        where("groupCode", "==", selectedGroup.groupCode)
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
//==================================================
// Winner Change
//==================================================

winner.addEventListener(
    "change",
    checkPreviousWinner
);

async function checkPreviousWinner() {

    winnerAlert.style.display = "none";

    if (winner.value == "") return;

    const q = query(
        auctionsRef,
        where("winnerId", "==", winner.value)
    );

    const snapshot = await getDocs(q);

    if (!snapshot.empty) {

        winnerAlert.className =
        "alert warning";

        winnerAlert.style.display =
        "block";

        winnerAlert.innerHTML =
        "⚠ This member has already won a chit.";

    } else {

        winnerAlert.className =
        "alert success";

        winnerAlert.style.display =
        "block";

        winnerAlert.innerHTML =
        "✅ Eligible for Auction";

    }

}
//==================================================
// Auto Calculation
//==================================================

thallu.addEventListener(
    "input",
    calculateAmounts
);

kasar.addEventListener(
    "input",
    calculateAmounts
);

function calculateAmounts() {

    if (!selectedGroup) return;

    const chit =
    Number(chitValue.value) || 0;

    const discount =
    Number(thallu.value) || 0;

    const expense =
    Number(kasar.value) || 0;

    const members =
    Number(selectedGroup.totalMembers) || 1;

    // Prize Amount

    prizeAmount.value =
    chit - discount - expense;

    // Dividend

    const dividend =
    (discount + expense) / members;

    // Monthly Amount

   const baseMonthly =
Number(selectedGroup.chitAmount) /
Number(selectedGroup.totalMembers);

monthlyAmount.value =
Math.ceil(baseMonthly - dividend); 

}
//==================================================
// Save Auction
//==================================================

saveAuction.addEventListener(
    "click",
    saveAuctionData
);

async function saveAuctionData() {

    try {

        if (!selectedGroup) {
            alert("Please select a group.");
            return;
        }

        if (winner.value == "") {
            alert("Please select winner.");
            winner.focus();
            return;
        }

        if (thallu.value == "") {
            alert("Enter Thallu Amount.");
            thallu.focus();
            return;
        }

        if (kasar.value == "") {
            kasar.value = 0;
        }

        saveAuction.disabled = true;
        saveAuction.textContent = "Saving...";

        //==========================================
        // Duplicate Month Check
        //==========================================

        const monthQuery = query(
            auctionsRef,
            where("groupId", "==", selectedGroup.id),
            where("month", "==", currentAuctionMonth)
        );

        const monthSnapshot =
        await getDocs(monthQuery);

        if (!monthSnapshot.empty) {

            alert(
                "Auction already saved for Month " +
                currentAuctionMonth
            );

            saveAuction.disabled = false;
            saveAuction.textContent = "Save Auction";

            return;

        }

        //==========================================
        // Duplicate Winner Check
        //==========================================

        const winnerQuery = query(
            auctionsRef,
            where("winnerId", "==", winner.value)
        );

        const winnerSnapshot =
        await getDocs(winnerQuery);

        if (!winnerSnapshot.empty) {

            alert(
                "This member has already won."
            );

            saveAuction.disabled = false;
            saveAuction.textContent =
            "Save Auction";

            return;

        }

        //==========================================
        // Save Firestore
        //==========================================

        await addDoc(
            auctionsRef,
            {
                groupId:
                selectedGroup.id,

                groupCode:
                selectedGroup.groupCode,

                groupName:
                selectedGroup.groupName,

                month:
                currentAuctionMonth,

                chitAmount:
                Number(chitValue.value),

                auctionDate:
                auctionDate.value,

                dueDate:
                dueDate.value,

                winnerId:
                winner.value,

                thallu:
                Number(thallu.value),

                kasar:
                Number(kasar.value),

                prizeAmount:
                Number(prizeAmount.value),

                monthlyAmount:
                Number(monthlyAmount.value),

                remarks:
                remarks.value.trim(),

                createdAt:
                serverTimestamp()

            }
        );
                //==========================================
        // Success
        //==========================================

        alert("Auction saved successfully.");

        resetAuctionForm();

        await loadCurrentAuctionMonth();

    }
    catch (error) {

        console.error(error);

        alert(
            "Failed to save auction.\n" +
            error.message
        );

    }
    finally {

        saveAuction.disabled = false;

        saveAuction.textContent =
        "Save Auction";

    }

}

//==================================================
// Reset Auction Form
//==================================================

function resetAuctionForm() {

    winner.value = "";

    winnerAlert.style.display = "none";

    thallu.value = "";

    kasar.value = "";

    prizeAmount.value = "";

    monthlyAmount.value = "";

    remarks.value = "";

}

//==================================================
// Page Refresh after Save
//==================================================

async function refreshAuctionPage() {

    await loadCurrentAuctionMonth();

}

//==================================================
// Optional
// Auto Recalculate
//==================================================

winner.addEventListener(
    "change",
    () => {

        calculateAmounts();

    }
);
