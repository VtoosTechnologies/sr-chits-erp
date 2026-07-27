import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    query,
    where,
    doc,
    updateDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

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

startMigration.addEventListener(
    "click",
    repairLedger
);

async function repairLedger(){

    if(!confirm(
        "Repair all Member Ledger records?"
    )){
        return;
    }

    startMigration.disabled = true;

    const ledgerSnapshot =
    await getDocs(collection(db,"memberLedger"));

    totalRecords.textContent =
    ledgerSnapshot.size;

    let repaired = 0;
    let skipped = 0;

    for(const ledgerDoc of ledgerSnapshot.docs){

        const ledger =
        ledgerDoc.data();

        // Find matching Group Member
        const q = query(
            collection(db,"groupMembers"),
            where(
                "memberCode",
                "==",
                ledger.memberCode
            )
        );

        const groupSnap =
        await getDocs(q);

        if(groupSnap.empty){

            skipped++;

            skippedRecords.textContent =
            skipped;

            continue;

        }

        const groupMember =
        groupSnap.docs[0].data();

        await updateDoc(
            doc(
                db,
                "memberLedger",
                ledgerDoc.id
            ),
            {

                memberId:
                    groupMember.referenceNo,

                referenceNo:
                    groupMember.referenceNo,

                updatedAt:
                    serverTimestamp(),

                updatedBy:
                    "Ledger Repair Tool"

            }
        );

        repaired++;

        migratedRecords.textContent =
        repaired;

        migrationStatus.textContent =
        `Repairing ${repaired}/${ledgerSnapshot.size}`;

    }

    migrationStatus.textContent =
    "✅ Repair Completed";

    alert(
        `Repair Completed\n\n` +
        `Updated : ${repaired}\n` +
        `Skipped : ${skipped}`
    );

    startMigration.disabled = false;

}
