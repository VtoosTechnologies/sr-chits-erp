//==================================================
// SR Chits ERP
// Dashboard
//==================================================

import { auth, db } from "../firebase.js";

import {
signOut,
onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

import {
collection,
getDocs
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

//==================================================
// Elements
//==================================================

const totalMembers =
document.getElementById("totalMembers");

const totalGroups =
document.getElementById("totalGroups");

const todayCollection =
document.getElementById("todayCollection");

const totalStaff =
document.getElementById("totalStaff");

const logoutBtn =
document.getElementById("logoutBtn");

//==================================================
// Check Login
//==================================================

onAuthStateChanged(auth, async(user)=>{

if(!user){

window.location.href="login.html";

return;

}

console.log("Logged in as:",user.email);

await loadDashboard();

});

//==================================================
// Dashboard Load
//==================================================

async function loadDashboard(){

try{

// Members

const memberSnapshot =
await getDocs(collection(db,"members"));

totalMembers.textContent =
memberSnapshot.size;

// Groups

const groupSnapshot =
await getDocs(collection(db,"groups"));

totalGroups.textContent =
groupSnapshot.size;

// Collections

let total = 0;

const collectionSnapshot =
await getDocs(collection(db,"collections"));

collectionSnapshot.forEach(doc=>{

total +=
Number(doc.data().totalAmount || 0);

});

todayCollection.textContent =
"₹" + total.toLocaleString("en-IN");

// Staff (Temporary)

totalStaff.textContent="1";

}
catch(error){

console.error(error);

}

}

//==================================================
// Logout
//==================================================

logoutBtn.addEventListener("click",async()=>{

try{

await signOut(auth);

alert("Logout Successful");

window.location.href="login.html";

}
catch(error){

alert(error.message);

}

});
