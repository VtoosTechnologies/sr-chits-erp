//==================================================
// SR Chits ERP
// Prize Payment
// Part 1
//==================================================

import { db } from "./firebase.js";

import {
collection,
getDocs,
addDoc,
serverTimestamp,
query,
where
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

//==================================================
// Elements
//==================================================

const chitAmount =
document.getElementById("chitAmount");

const group =
document.getElementById("group");

const auctionMonth =
document.getElementById("auctionMonth");

const winner =
document.getElementById("winner");

const memberName =
document.getElementById("memberName");

const prizeAmount =
document.getElementById("prizeAmount");

const oldPending =
document.getElementById("oldPending");

const adjustmentType =
document.getElementById("adjustmentType");

const adjustAmount =
document.getElementById("adjustAmount");

const prizePayable =
document.getElementById("prizePayable");
const previousPaid =
document.getElementById("previousPaid");
const paidAmount =
document.getElementById("paidAmount");

const balanceAmount =
document.getElementById("balanceAmount");

const paymentMethod =
document.getElementById("paymentMethod");

const paymentStatus =
document.getElementById("paymentStatus");

const remarks =
document.getElementById("remarks");

//==================================================
// Initial Load
//==================================================

loadChitAmounts();

//==================================================
// Load Chit Amounts
//==================================================

async function loadChitAmounts(){

chitAmount.innerHTML =
'<option value="">Select Chit Amount</option>';

const snapshot =
await getDocs(collection(db,"groups"));

const amountList = [];

snapshot.forEach(doc=>{

const data = doc.data();

if(!amountList.includes(Number(data.chitAmount))){

amountList.push(Number(data.chitAmount));

}

});

amountList.sort((a,b)=>a-b);

amountList.forEach(amount=>{

const option =
document.createElement("option");

option.value = amount;

option.textContent =
"₹ " + amount.toLocaleString("en-IN");

chitAmount.appendChild(option);

});

}

//==================================================
// Load Groups
//==================================================

chitAmount.addEventListener("change",loadGroups);

async function loadGroups(){

group.innerHTML =
'<option value="">Select Group</option>';

auctionMonth.innerHTML =
'<option value="">Select Month</option>';

winner.innerHTML =
'<option value="">Select Member</option>';

const snapshot =
await getDocs(collection(db,"groups"));

snapshot.forEach(doc=>{

const data = doc.data();

if(Number(data.chitAmount) === Number(chitAmount.value)){

const option =
document.createElement("option");

option.value = doc.id;

const date = new Date(data.startDate);

const day = String(date.getDate()).padStart(2,"0");

const month = date.toLocaleString("en-US",{
month:"short"
});

const year =
String(date.getFullYear()).slice(-2);

option.textContent =
`${data.groupCode} | ${day}-${month}'${year}`;

group.appendChild(option);

}

});

}
//==================================================
// Load Auction Months
//==================================================

group.addEventListener("change", loadAuctionMonths);

async function loadAuctionMonths(){

auctionMonth.innerHTML =
'<option value="">Select Month</option>';

winner.innerHTML =
'<option value="">Select Member</option>';

const snapshot =
await getDocs(collection(db,"auctions"));

const months = [];

snapshot.forEach(doc=>{

const data = doc.data();

if(data.groupId === group.value){

months.push(Number(data.month));

}

});

months.sort((a,b)=>a-b);

months.forEach(month=>{

const option =
document.createElement("option");

option.value = month;

option.textContent =
"Month " + month;

auctionMonth.appendChild(option);

});

}

//==================================================
// Load Prize Winner
//==================================================

auctionMonth.addEventListener("change", loadWinner);

async function loadWinner(){

    winner.innerHTML =
    '<option value="">Select Member</option>';

    const auctionSnapshot =
    await getDocs(collection(db,"auctions"));

    const memberSnapshot =
    await getDocs(collection(db,"members"));

    auctionSnapshot.forEach(auctionDoc=>{

        const auction = auctionDoc.data();

        if(
            auction.groupId === group.value &&
            Number(auction.month) === Number(auctionMonth.value)
        ){

            memberSnapshot.forEach(memberDoc=>{

                if(memberDoc.id === auction.winnerId){

                    const member = memberDoc.data();

                    const option =
                    document.createElement("option");

                    option.value = auction.winnerId;

                    option.textContent =
                    member.memberName;

                    winner.appendChild(option);

                }

            });

        }

    });

}

//==================================================
// Load Member Details
//==================================================

winner.addEventListener("change", loadMemberDetails);

async function loadMemberDetails(){

    memberName.value = "";
    oldPending.value = "";
    prizeAmount.value = "";
    previousPaid.value = 0;
    paidAmount.value = "";
    balanceAmount.value = "";

    // Load Member Details
    const memberSnapshot =
    await getDocs(collection(db,"members"));

    memberSnapshot.forEach(doc=>{

        if(doc.id === winner.value){

            const data = doc.data();

            memberName.value =
            data.memberName || "";

            oldPending.value =
            data.pendingAmount || 0;

        }

    });

    // Load Auction Prize Amount
    const auctionQuery = query(
        collection(db,"auctions"),
        where("groupId","==",group.value),
        where("winnerId","==",winner.value),
        where("month","==",Number(auctionMonth.value))
    );

    const auctionResult =
    await getDocs(auctionQuery);

    auctionResult.forEach(doc=>{

        const data = doc.data();

        prizeAmount.value =
        Number(data.prizeAmount) || 0;

    });

    // Load Previous Payments
    const paymentQuery = query(
        collection(db,"prizePayments"),
        where("groupId","==",group.value),
        where("memberId","==",winner.value),
        where("auctionMonth","==",Number(auctionMonth.value))
    );

    const paymentResult =
    await getDocs(paymentQuery);

    let totalPaid = 0;

    paymentResult.forEach(doc=>{

        totalPaid +=
        Number(doc.data().paidAmount) || 0;

    });

    previousPaid.value = totalPaid;

    calculatePrize();

}
//==================================================
// Auto Calculation
//==================================================

adjustmentType.addEventListener("change", calculatePrize);

adjustAmount.addEventListener("input", calculatePrize);

paidAmount.addEventListener("input", calculatePrize);

function calculatePrize(){

const prize =
Number(prizeAmount.value) || 0;

const pending =
Number(oldPending.value) || 0;

let adjust = 0;

//--------------------------------------------
// Adjustment
//--------------------------------------------

if(adjustmentType.value === "none"){

adjust = 0;
adjustAmount.value = 0;

}

else if(adjustmentType.value === "full"){

adjust = pending;
adjustAmount.value = pending;

}

else if(adjustmentType.value === "custom"){

adjust =
Number(adjustAmount.value) || 0;

if(adjust > pending){

adjust = pending;
adjustAmount.value = pending;

}

}

//--------------------------------------------
// Prize Payable
//--------------------------------------------

const payable =
prize - adjust;

prizePayable.value = payable;

//--------------------------------------------
// Paid & Balance
//--------------------------------------------
const previous =
Number(previousPaid.value) || 0;

const current =
Number(paidAmount.value) || 0;

const totalPaid =
previous + current;

const balance =
Math.max(0, payable - totalPaid);


balanceAmount.value = balance;

//--------------------------------------------
// Payment Status
//--------------------------------------------

if(balance===0 && totalPaid>0){

paymentStatus.value="Completed";

}

else if(totalPaid>0){

paymentStatus.value="Partially Paid";

}

else{

paymentStatus.value="Pending";

}

//--------------------------------------------
// Summary Cards
//--------------------------------------------

document.getElementById("summaryPrize").textContent =
"₹ " + prize.toLocaleString("en-IN");

document.getElementById("summaryAdjusted").textContent =
"₹ " + adjust.toLocaleString("en-IN");

document.getElementById("summaryPaid").textContent =
"₹ " + totalPaid.toLocaleString("en-IN");

document.getElementById("summaryBalance").textContent =
"₹ " + balance.toLocaleString("en-IN");

}
//==================================================
// Generate Receipt Number
//==================================================

async function generateReceiptNo(){

    const snapshot =
    await getDocs(collection(db,"prizePayments"));

    const count = snapshot.size + 1;

    const year =
    new Date().getFullYear();

    return `SR-PP-${year}-${String(count).padStart(6,"0")}`;

}
//==================================================
// Save
//==================================================

document
.getElementById("saveBtn")
.addEventListener("click",savePrizePayment);

async function savePrizePayment(){

    // Validation
    if(chitAmount.value===""){
        alert("Please select Chit Amount");
        return;
    }

    if(group.value===""){
        alert("Please select Group");
        return;
    }

    if(auctionMonth.value===""){
        alert("Please select Auction Month");
        return;
    }

    if(winner.value===""){
        alert("Please select Prize Winner");
        return;
    }

    if(Number(paidAmount.value)<=0){
        alert("Enter Paid Amount");
        return;
    }

    try{

        const receiptNo =
        await generateReceiptNo();

        await addDoc(
            collection(db,"prizePayments"),
            {

                receiptNo: receiptNo,

                paymentDate:
                new Date().toLocaleDateString("en-GB"),

                groupId: group.value,

                groupCode:
                group.options[group.selectedIndex].text,

                memberId: winner.value,

                memberName:
                memberName.value,

                auctionMonth:
                Number(auctionMonth.value),

                chitAmount:
                Number(chitAmount.value),

                prizeAmount:
                Number(prizeAmount.value),

                oldPending:
                Number(oldPending.value),

                adjustmentType:
                adjustmentType.value,

                adjustmentAmount:
                Number(adjustAmount.value),

                prizePayable:
                Number(prizePayable.value),

                paidAmount:
                Number(paidAmount.value),

                balanceAmount:
                Number(balanceAmount.value),

                paymentMethod:
                paymentMethod.value,

                paymentStatus:
                paymentStatus.value,

                remarks:
                remarks.value,

                createdAt:
                serverTimestamp()

            }
        );

        alert(
            "✅ Prize Payment Saved Successfully!\n\nReceipt No : " + receiptNo
        );

        resetForm();

    }
    catch(error){

        console.error(error);

        alert(
            "Error while saving Prize Payment."
        );

    }

}
//==================================================
// Reset
//==================================================

document
.getElementById("resetBtn")
.addEventListener("click",resetForm);

function resetForm(){

location.reload();

}

//==================================================
// Print
//==================================================

document
.getElementById("printBtn")
.addEventListener("click",printReceipt);

function printReceipt(){

window.print();

}
