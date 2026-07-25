//==================================================
// SR Chits ERP
// Member Login
// Part - 2
//==================================================

import { db } from "./firebase.js";

import {
collection,
query,
where,
getDocs
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

//==================================================
// Elements
//==================================================

const userId =
document.getElementById("memberCode");

const password =
document.getElementById("password");

const loginBtn =
document.getElementById("loginBtn");

//==================================================
// Login Button
//==================================================

loginBtn.addEventListener("click", loginMember);

//==================================================
// Login Function
//==================================================

async function loginMember() {

const enteredUserId =
userId.value.trim().toUpperCase();

const enteredPassword =
password.value.trim();

if (enteredUserId === "" || enteredPassword === "") {

alert("Please enter User ID and Password.");

return;

}

try {

const q = query(
collection(db, "members"),
where("userId", "==", enteredUserId)
);

const snapshot = await getDocs(q);

if (snapshot.empty) {

alert("Invalid User ID.");

return;

}

const docSnap = snapshot.docs[0];

const data = docSnap.data();

//----------------------------------
// Account Status Check
//----------------------------------

if (data.accountStatus !== "Active") {

alert(
"Your account is inactive.\n\nPlease contact your Chit Office."
);

return;

}

//----------------------------------
// Password Check
//----------------------------------

if (data.password !== enteredPassword) {

alert("Incorrect Password.");

return;

}

//----------------------------------
// Save Session
//----------------------------------

sessionStorage.setItem(
"memberId",
docSnap.id
);

sessionStorage.setItem(
"userId",
data.userId
);

sessionStorage.setItem(
"referenceNo",
data.referenceNo
);

sessionStorage.setItem(
"memberCode",
data.memberCode
);

sessionStorage.setItem(
"aadhaarNumber",
data.aadhaarNumber
);

sessionStorage.setItem(
"memberName",
data.memberName
);

//----------------------------------
// First Login Check
//----------------------------------

if (data.passwordChanged === false) {

window.location.href =
"change-password.html";

return;

}

//----------------------------------
// Login Success
//----------------------------------

alert(
"Welcome " + data.memberName
);

window.location.href =
"member-dashboard.html";

}

catch (error) {

console.error(error);

alert(
"Login Failed.\n\n" +
error.message
);

}

}

//==================================================
// Enter Key Login
//==================================================

password.addEventListener(
"keypress",
function (e) {

if (e.key === "Enter") {

loginMember();

}

}
);
