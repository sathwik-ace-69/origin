
const prisma = require("./prisma");

async function saveTransactions(accountId, transactions) {
    let inserted = 0;
    let skipped = 0;

    for (const transaction of transactions) {
        try {
            // Check whether this transaction already exists
            const existing = await prisma.transaction.findFirst({
                where: {
                    accountId: accountId,
                    fingerprint: transaction.fingerprint
                }
            });

            if (existing) {
                skipped++;
                continue;
            }

            // Insert transaction into PostgreSQL
            await prisma.transaction.create({
                data: {
                    accountId: accountId,
                    date: new Date(`${transaction.date}T00:00:00.000Z`),
                    description: transaction.description,
                    merchant: transaction.merchant,
                    debit: String(transaction.debit),
                    credit: String(transaction.credit),
                    balance: transaction.balance === null
                        ? null
                        : String(transaction.balance),
                    currency: transaction.currency || "INR",
                    fingerprint: transaction.fingerprint
                }
            });

            inserted++;

        } catch (error) {
            if (error.code === "P2002") {
                skipped++;
            } else {
                throw error;
            }
        }
    }

    return { inserted, skipped };
}

module.exports = saveTransactions;
