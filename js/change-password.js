//==================================================
// SR Chits ERP
// Change Password
// Part - 1
//==================================================

import { db } from "./firebase.js";

import {
doc,
getDoc,
updateDoc
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

//==================================================
// Elements
//==================================================

const currentPassword =
document.getElementById("currentPassword");

const newPassword =
document.getElementById("newPassword");

const confirmPassword =
document.getElementById("confirmPassword");

const updatePasswordBtn =
document.getElementById("updatePasswordBtn");

//==================================================
// Button Click
//==================================================

updatePasswordBtn.addEventListener(
"click",
changePassword
);

//==================================================
// Change Password
//==================================================

async function changePassword(){

const memberId =
sessionStorage.getItem("memberId");

if(!memberId){

alert("Session Expired.\nPlease login again.");

window.location.href =
"member-login.html";

return;

}

const current =
currentPassword.value.trim();

const newPass =
newPassword.value.trim();

const confirm =
confirmPassword.value.trim();

if(
current === "" ||
newPass === "" ||
confirm === ""
){

alert("Please fill all fields.");

return;

}

if(newPass.length < 6){

alert(
"New Password must contain at least 6 characters."
);

return;

}

if(newPass !== confirm){

alert(
"New Password and Confirm Password do not match."
);

return;

}

try{

const memberRef =
doc(db,"members",memberId);

const memberSnap =
await getDoc(memberRef);

if(!memberSnap.exists()){

alert("Member not found.");

return;

}

const member =
memberSnap.data();

if(member.password !== current){

alert("Current Password is incorrect.");

return;

}

await updateDoc(memberRef,{

password:newPass,
passwordChanged:true

});

alert(
"Password changed successfully."
);

window.location.href =
"member-dashboard.html";

}

catch(error){

console.error(error);

alert(
"Error\n\n"+
error.message
);

}

}

//==================================================
// Enter Key Support
//==================================================

confirmPassword.addEventListener(
"keypress",
function(e){

if(e.key==="Enter"){

changePassword();

}

}
);
