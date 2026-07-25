//==================================================
// SR Chits ERP
// Member Dashboard
// Part - 1
//==================================================

//----------------------------------
// Check Login Session
//----------------------------------

const memberId =
sessionStorage.getItem("memberId");

if (!memberId) {

alert("Please login first.");

window.location.href = "member-login.html";

}

//----------------------------------
// Load Session Data
//----------------------------------

const memberName =
sessionStorage.getItem("memberName");

const userId =
sessionStorage.getItem("userId");

document.getElementById("memberName").textContent =
"Welcome " + memberName;

document.getElementById("userId").textContent =
userId;

//----------------------------------
// Logout
//----------------------------------

document
.getElementById("logoutBtn")
.addEventListener("click", logout);

function logout() {

const confirmLogout =
confirm("Are you sure you want to logout?");

if (!confirmLogout) return;

sessionStorage.clear();

window.location.href =
"member-login.html";

}
