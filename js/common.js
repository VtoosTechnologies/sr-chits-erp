//==================================================
// SR Chits ERP
// Common Functions
//==================================================

// Current Date

export function getTodayDate(){

const today = new Date();

return today.toISOString().split("T")[0];

}

// Current Date & Time

export function getCurrentDateTime(){

return new Date().toLocaleString("en-IN");

}

// Currency Format

export function formatCurrency(amount){

return "₹ " + Number(amount).toLocaleString("en-IN");

}

// Number Only

export function toNumber(value){

return Number(value) || 0;

}
//==================================================
// Auto Number Generator
//==================================================

export function generateNumber(prefix){

const now = new Date();

const year = now.getFullYear();

const random =
Math.floor(100000 + Math.random() * 900000);

return `${prefix}-${year}-${random}`;

}

//==================================================
// Receipt Numbers
//==================================================

export function generateCollectionReceipt(){

return generateNumber("COL");

}

export function generatePrizeReceipt(){

return generateNumber("PP");

}

export function generateCashInReceipt(){

return generateNumber("CI");

}

export function generateCashOutReceipt(){

return generateNumber("CO");

}

export function generateExpenseVoucher(){

return generateNumber("EXP");

}

export function generateBankVoucher(){

return generateNumber("BNK");

}
//==================================================
// Loading
//==================================================

export function showLoading(){

let loader =
document.getElementById("loadingOverlay");

if(loader){

loader.style.display = "flex";

}

}

export function hideLoading(){

let loader =
document.getElementById("loadingOverlay");

if(loader){

loader.style.display = "none";

}

}

//==================================================
// Toast Message
//==================================================

export function showToast(message,type="success"){

alert(message);

// Future Version
// Beautiful Toast UI replace pannuvom

}

//==================================================
// Confirmation
//==================================================

export function confirmAction(message){

return confirm(message);

}
//==================================================
// Validation
//==================================================

export function isEmpty(value){

return value == null ||
value == undefined ||
value.toString().trim() == "";

}

export function isPositiveNumber(value){

return Number(value) > 0;

}

//==================================================
// Random ID
//==================================================

export function generateId(){

return Date.now().toString();

}
