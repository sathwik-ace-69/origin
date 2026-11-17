
function validateTransactions(transactions) {
    const validTransactions = [];
    const invalidTransactions = [];

    transactions.forEach((transaction, index) => {
        const errors = [];

        if (!transaction.date) {
            errors.push("Date is missing");
        }

        if (!transaction.description || !transaction.description.trim()) {
            errors.push("Description is missing");
        }

        if (typeof transaction.debit !== "number" || transaction.debit < 0) {
            errors.push("Invalid debit amount");
        }

        if (typeof transaction.credit !== "number" || transaction.credit < 0) {
            errors.push("Invalid credit amount");
        }

        if (errors.length === 0) {
            validTransactions.push(transaction);
        } else {
            invalidTransactions.push({
                row: transaction._rowNumber || index + 1,
                errors
            });
        }
    });

    return {
        validTransactions,
        invalidTransactions
    };
}

module.exports = validateTransactions;
