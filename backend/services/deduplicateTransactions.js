
const crypto = require("crypto");

function generateFingerprint(transaction) {
    const uniqueData = [
        transaction.date,
        transaction.description.trim().toLowerCase(),
        transaction.debit,
        transaction.credit
    ].join("|");

    return crypto
        .createHash("sha256")
        .update(uniqueData)
        .digest("hex");
}

function deduplicateTransactions(transactions) {
    const seen = new Set();

    const uniqueTransactions = [];
    const duplicateTransactions = [];

    transactions.forEach((transaction) => {
        const fingerprint = generateFingerprint(transaction);

        if (seen.has(fingerprint)) {
            duplicateTransactions.push(transaction);
        } else {
            seen.add(fingerprint);

            uniqueTransactions.push({
                ...transaction,
                fingerprint
            });
        }
    });

    return {
        uniqueTransactions,
        duplicateTransactions
    };
}

module.exports = deduplicateTransactions;
