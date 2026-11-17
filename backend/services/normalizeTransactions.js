
function normalizeDate(value) {
    if (value === null || value === undefined || value === "") {
        throw new Error("Date is missing");
    }

    let year, month, day;

    // Handle YYYY-MM-DD
    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
        [year, month, day] = value.split("-").map(Number);
    }

    // Handle DD-MM-YYYY or DD/MM/YYYY
    else if (typeof value === "string") {
        const parts = value.trim().match(/^(\d{2})[-/](\d{2})[-/](\d{4})$/);

        if (!parts) {
            throw new Error("Invalid date format: " + value);
        }

        day = Number(parts[1]);
        month = Number(parts[2]);
        year = Number(parts[3]);
    }

    else {
        throw new Error("Unsupported date value");
    }

    // Validate actual calendar date
    const date = new Date(Date.UTC(year, month - 1, day));

    if (
        date.getUTCFullYear() !== year ||
        date.getUTCMonth() !== month - 1 ||
        date.getUTCDate() !== day
    ) {
        throw new Error("Invalid calendar date: " + value);
    }

    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function normalizeAmount(value, fieldName, allowNull = false) {
    if (
        value === null ||
        value === undefined ||
        String(value).trim() === ""
    ) {
        return allowNull ? null : 0;
    }

    const amount = Number(
        String(value).replace(/,/g, "").trim()
    );

    if (!Number.isFinite(amount)) {
        throw new Error("Invalid " + fieldName + ": " + value);
    }

    return amount;
}

function normalizeTransactions(transactions) {
    const normalizedTransactions = [];
    const invalidTransactions = [];

    transactions.forEach((transaction, index) => {
        const errors = [];

        let date;
        let debit;
        let credit;
        let balance;

        // Normalize date
        try {
            date = normalizeDate(transaction.date);
        } catch (error) {
            errors.push(error.message);
        }

        // Normalize debit
        try {
            debit = normalizeAmount(transaction.debit, "debit");
        } catch (error) {
            errors.push(error.message);
        }

        // Normalize credit
        try {
            credit = normalizeAmount(transaction.credit, "credit");
        } catch (error) {
            errors.push(error.message);
        }

        // Normalize balance
        try {
            balance = normalizeAmount(
                transaction.balance,
                "balance",
                true
            );
        } catch (error) {
            errors.push(error.message);
        }

        // Normalize description
        const description = String(
            transaction.description || ""
        ).trim();

        if (!description) {
            errors.push("Description is missing");
        }

        // Reject only this row if errors exist
        if (errors.length > 0) {
            invalidTransactions.push({
                row: index + 1,
                errors
            });

            return;
        }

        // Store successfully normalized transaction
        normalizedTransactions.push({
            date,
            description,
            debit,
            credit,
            balance,
            merchant: transaction.merchant
                ? String(transaction.merchant).trim() || null
                : null,
            currency: transaction.currency || "INR",
            _rowNumber: index + 1
        });
    });

    return {
        normalizedTransactions,
        invalidTransactions
    };
}

module.exports = normalizeTransactions;
