//==================================================
// SR Chits ERP
// Member Ledger Migration
// Part 1
//==================================================

import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    addDoc,
    query,
    where,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

//==================================================
// Firestore Collections
//==================================================

const pendingRef =
collection(db, "pendingRegister");

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
        "This will migrate all Pending Register records into Member Ledger.\n\nContinue?"
    )) {
        return;
    }

    startMigration.disabled = true;

    migrationStatus.textContent = "Reading Pending Register...";

    try {

        const pendingSnapshot =
        await getDocs(pendingRef);

        total = pendingSnapshot.size;

        totalRecords.textContent = total;

        migrated = 0;
        skipped = 0;

        migratedRecords.textContent = migrated;
        skippedRecords.textContent = skipped;

        let current = 0;

        for (const docSnap of pendingSnapshot.docs) {

            current++;

            migrationStatus.textContent =
            `Processing ${current} of ${total}`;

            const data = docSnap.data();

            const alreadyExists =
            await checkLedgerExists(data);

            if (alreadyExists) {

                skipped++;

                skippedRecords.textContent = skipped;

                continue;

            }

            await addDoc(ledgerRef, {

                memberId:
                    data.memberId || "",

                aadhaarNumber:
                    data.aadhaarNumber || "",

                memberCode:
                    data.memberCode || "",

                memberName:
                    data.memberName || "",

                groupCode:
                    data.groupCode || "",

                groupName:
                    data.groupName || "",

                transactionType:
                    "INSTALLMENT_DUE",

                transactionDate:
                    data.dueDate || new Date(),

                installmentNo:
                    data.installmentNo || 1,

                debit:
                    Number(data.pendingAmount || 0),

                credit:
                    0,

                adjustedAmount:
                    0,

                paymentMode:
                    "",

                receiptNo:
                    "",

                referenceNo:
                    "",

                narration:
                    "Migrated from Pending Register",

                remarks:
                    "One Time Migration",

                createdAt:
                    serverTimestamp(),

                createdBy:
                    "Migration Tool"

            });

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

async function checkLedgerExists(data) {

    const q = query(
        ledgerRef,
        where(
            "memberCode",
            "==",
            data.memberCode || ""
        ),
        where(
            "installmentNo",
            "==",
            data.installmentNo || 1
        ),
        where(
            "transactionType",
            "==",
            "INSTALLMENT_DUE"
        )
    );

    const snapshot =
    await getDocs(q);

    return !snapshot.empty;

}
