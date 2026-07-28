//==================================================
// SR Chits ERP
// Cash Book
// Part 1
//==================================================

import { db } from "./firebase.js";

import {
collection,
getDocs,
query,
orderBy
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

//==================================================
// Elements
//==================================================

const fromDate =
document.getElementById("fromDate");

const toDate =
document.getElementById("toDate");

const loadReport =
document.getElementById("loadReport");

const cashbookTable =
document.getElementById("cashbookTable");

const grandTotal =
document.getElementById("grandTotal");

//==================================================
// Default Date
//==================================================

const today = new Date();

const yyyy = today.getFullYear();

const mm = String(
today.getMonth()+1
).padStart(2,"0");

const dd = String(
today.getDate()
).padStart(2,"0");

const currentDate =
`${yyyy}-${mm}-${dd}`;

fromDate.value = currentDate;

toDate.value = currentDate;

//==================================================
// Initial Load
//==================================================

window.addEventListener(
"DOMContentLoaded",
loadCashBook
);

//==================================================
// Search Button
//==================================================

loadReport.addEventListener(
"click",
loadCashBook
);

//==================================================
// Load Cash Book
//==================================================

async function loadCashBook(){

cashbookTable.innerHTML = `
<tr>
<td colspan="7">
Loading...
</td>
</tr>
`;

grandTotal.textContent = "₹0";

const snapshot =
await getDocs(

query(

collection(db,"collections"),

orderBy("createdAt","desc")

)

);

let total = 0;

let html = "";
  //==================================================
// Filter Records
//==================================================

const from =
new Date(fromDate.value);

from.setHours(0,0,0,0);

const to =
new Date(toDate.value);

to.setHours(23,59,59,999);

snapshot.forEach(doc=>{

const data = doc.data();

let collectionTime = null;

const dateField =
data.collectionDate || data.createdAt;

if(dateField){

    if(dateField.toDate){

        collectionTime =
        dateField.toDate();

    }else{

        collectionTime =
        new Date(dateField);

    }

}else{

    return;

}

//----------------------------------
// Date Filter
//----------------------------------

if(
collectionTime < from ||
collectionTime > to
){

    return;

}

total += Number(
data.receivedAmount || 0
);

html += `

<tr>

<td>

${collectionTime.toLocaleDateString("en-IN")}

</td>

<td>

${data.transactionNo || "-"}

</td>

<td>

${data.memberCode || "-"}

</td>

<td>

${data.memberName || "-"}

</td>

<td>

${data.paymentMode || "-"}

</td>

<td>

₹${Number(
data.receivedAmount || 0
).toLocaleString("en-IN")}

</td>

<td>

<button
class="receipt-btn"
onclick="openReceipt('${data.transactionNo}')">

👁 View

</button>

</td>

</tr>

`;

});
//==================================================
// No Records
//==================================================

if(html===""){

cashbookTable.innerHTML=`

<tr>

<td colspan="7" class="no-record">

No Collection Found

</td>

</tr>

`;

}
else{

cashbookTable.innerHTML=html;

}

grandTotal.textContent=

"₹"+

total.toLocaleString("en-IN");

}

//==================================================
// Open Receipt
//==================================================

window.openReceipt=function(transactionNo){

window.open(

`receipt.html?transactionNo=${transactionNo}`,

"_blank"

);

};
