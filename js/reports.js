//==================================================
// SR Chits ERP
// Reports
// Part - 3A
//==================================================

//==================================================
// Page Load
//==================================================

document.addEventListener("DOMContentLoaded", () => {

console.log("Reports Module Loaded Successfully");

});

//==================================================
// View Report
//==================================================

window.openReport = function(page){

window.location.href = page;

};

//==================================================
// PDF (Coming Soon)
//==================================================

window.downloadPDF = function(){

alert("PDF Export - Coming Soon");

};

//==================================================
// Excel (Coming Soon)
//==================================================

window.downloadExcel = function(){

alert("Excel Export - Coming Soon");

};
//==================================================
// SR Chits ERP
// Reports
// Part - 3B
//==================================================

//==================================================
// Report Pages
//==================================================

const reportPages = {

collection: "collection-report.html",

member: "member-statement.html",

prize: "prize-payment-report.html",

cashbook: "cash-book.html",

outstanding: "outstanding-report.html",

advance: "advance-report.html"

};

//==================================================
// Open Report
//==================================================

function openReport(report){

if(reportPages[report]){

window.location.href = reportPages[report];

}else{

alert("Report page not found.");

}

}

//==================================================
// Functions
//==================================================

window.openCollectionReport = () =>
openReport("collection");

window.openMemberStatement = () =>
openReport("member");

window.openPrizePaymentReport = () =>
openReport("prize");

window.openCashBook = () =>
openReport("cashbook");

window.openOutstandingReport = () =>
openReport("outstanding");

window.openAdvanceReport = () =>
openReport("advance");

//==================================================
// Back to Dashboard
//==================================================

window.goDashboard = () => {

window.location.href = "dashboard.html";

};
//==================================================
// SR Chits ERP
// Reports
// Part - 3C
//==================================================

//==================================================
// Search Reports
//==================================================

const reportCards =
document.querySelectorAll(".report-card");

const searchBox =
document.getElementById("reportSearch");

if(searchBox){

searchBox.addEventListener("keyup",()=>{

const value =
searchBox.value.toLowerCase();

reportCards.forEach(card=>{

const text =
card.innerText.toLowerCase();

card.style.display =
text.includes(value)
? "block"
: "none";

});

});

}

//==================================================
// Coming Soon
//==================================================

document
.querySelectorAll(".coming-soon")
.forEach(button=>{

button.addEventListener("click",()=>{

alert("This feature will be available in the next update.");

});

});

//==================================================
// Back Button
//==================================================

function goBack(){

window.location.href="dashboard.html";

}

window.goBack=goBack;

//==================================================
// Refresh
//==================================================

function refreshPage(){

location.reload();

}

window.refreshPage=refreshPage;

//==================================================
// Version
//==================================================

console.log("SR Chits ERP");
console.log("Reports Module");
console.log("Version 1.0 Loaded Successfully");
