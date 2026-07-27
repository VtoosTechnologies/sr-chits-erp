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

    migrated = 0;
    skipped = 0;

    migratedRecords.textContent = "0";
    skippedRecords.textContent = "0";

    try {

        const ledgerSnapshot = await getDocs(ledgerRef);

        total = ledgerSnapshot.size;
        totalRecords.textContent = total;

        let current = 0;

        for (const ledgerDoc of ledgerSnapshot.docs) {

            current++;

            migrationStatus.textContent =
                `Processing ${current} / ${total}`;

            const ledger = ledgerDoc.data();

            // Skip invalid records
            if (
                !ledger.memberCode ||
                typeof ledger.memberCode !== "string" ||
                ledger.memberCode.trim() === ""
            ) {

                skipped++;
                skippedRecords.textContent = skipped;
                continue;
            }

            // Find matching group member
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

            // Update only if value is different
            if (
                ledger.memberId !== groupMember.referenceNo ||
                ledger.referenceNo !== groupMember.referenceNo
            ) {

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

            } else {

                skipped++;

            }

            migratedRecords.textContent = migrated;
            skippedRecords.textContent = skipped;
        }

        migrationStatus.textContent = "✅ Repair Completed";

        alert(
            `Repair Completed

Total Records : ${total}

Updated : ${migrated}

Skipped : ${skipped}`
        );

    } catch (error) {

        console.error(error);

        migrationStatus.textContent = "❌ Repair Failed";

        alert(error.message);

    }

    startMigration.disabled = false;
}
