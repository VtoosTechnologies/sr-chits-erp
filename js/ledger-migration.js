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
    serverTimestamp,
    query,
    where
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

    if (!confirm("Repair all Member Ledger records?")) {
        return;
    }

    startMigration.disabled = true;
    migrationStatus.textContent = "Repairing...";

    try {

        const ledgerSnapshot =
        await getDocs(collection(db, "memberLedger"));

        total = ledgerSnapshot.size;

        totalRecords.textContent = total;

        migrated = 0;
        skipped = 0;

        for (const ledgerDoc of ledgerSnapshot.docs) {

            const ledger = ledgerDoc.data();

            const q = query(
                collection(db, "groupMembers"),
                where("memberCode", "==", ledger.memberCode)
            );

            const groupSnap = await getDocs(q);

            if (groupSnap.empty) {

                skipped++;
                skippedRecords.textContent = skipped;
                continue;

            }

            const groupMember = groupSnap.docs[0].data();

            await updateDoc(
                doc(db, "memberLedger", ledgerDoc.id),
                {
                    memberId: groupMember.referenceNo,
                    referenceNo: groupMember.referenceNo,
                    updatedAt: serverTimestamp(),
                    updatedBy: "Repair Tool"
                }
            );

            migrated++;
            migratedRecords.textContent = migrated;

            migrationStatus.textContent =
                `Processing ${migrated} / ${total}`;

        }

        migrationStatus.textContent =
            "✅ Repair Completed";

        alert(
            `Repair Completed\n\nUpdated : ${migrated}\nSkipped : ${skipped}`
        );

    } catch (error) {

        console.error(error);
        alert(error.message);

    }

    startMigration.disabled = false;

}
