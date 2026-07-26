//==================================================
// SR Chits ERP
// Member Ledger Migration
// Part 1
//==================================================

import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    doc,
    updateDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

//==================================================
// Firestore Collections
//==================================================

const ledgerRef =
collection(db, "memberLedger");

//==================================================
// Elements
//==================================================

const startMigration =
document.getElementById("startMigration");

const totalRecords =
document.getElementById("totalRecords");

const migratedRecords =
document.getElementById("migratedRecords");

const skippedRecords =
document.getElementById("skippedRecords");

const migrationStatus =
document.getElementById("migrationStatus");

//==================================================
// Variables
//==================================================

let total = 0;

let migrated = 0;

let skipped = 0;

//==================================================
// Start Migration
//==================================================

startMigration.addEventListener(
    "click",
    migrateLedger
);
//==================================================
// Migration Function
//==================================================

async function migrateLedger() {

    if (!confirm(
        "This will repair all Member Ledger records.\n\nContinue?"
    )) {
        return;
    }

    startMigration.disabled = true;

    migrationStatus.textContent = "Reading Member Ledger...";

    try {

       const ledgerSnapshot =
await getDocs(ledgerRef);

total = ledgerSnapshot.size;

        totalRecords.textContent = total;

        migrated = 0;
        skipped = 0;

        migratedRecords.textContent = migrated;
        skippedRecords.textContent = skipped;

        let current = 0;

        for (const docSnap of ledgerSnapshot.docs) {

            current++;

            migrationStatus.textContent =
            `Processing ${current} of ${total}`;

            const data = docSnap.data();

await updateDoc(
    doc(db, "memberLedger", docSnap.id),
    {
      memberId: data.memberCode || data.referenceNo || "",
referenceNo: data.memberCode || data.referenceNo || "",
        updatedAt: serverTimestamp(),
        updatedBy: "Repair Tool"
    }
);

migrated++;
migratedRecords.textContent = migrated;

}
              migrationStatus.textContent =
        "✅ Migration Completed Successfully.";

        alert(
            `Migration Completed!\n\n` +
            `Total : ${total}\n` +
            `Migrated : ${migrated}\n` +
            `Skipped : ${skipped}`
        );

    } catch (error) {

        console.error(error);

        migrationStatus.textContent =
        "❌ Migration Failed.";

        alert(error.message);

    }

    startMigration.disabled = false;

}

//==================================================
// Check Duplicate
//==================================================
