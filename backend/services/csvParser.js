
const fs = require("fs");
const { parse } = require("csv-parse/sync");

function parseCSV(filePath) {
    const fileContent = fs.readFileSync(filePath, "utf-8");

    const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        bom: true
    });

    const transactions = records.map((row) => {
        const parts = row.Date.split("-");

        const date = `${parts[2]}-${parts[1]}-${parts[0]}`;

        const description = row.Description;

        return {
            date,
            description,
            debit: row.Debit,
            credit: row.Credit,
            balance: row.Balance,
            merchant: extractMerchant(description)
        };
    });

    return transactions;
}

function extractMerchant(description) {
    const merchants = [
        "Swiggy",
        "Amazon",
        "Uber"
    ];

    return merchants.find((name) =>
        description.toLowerCase().includes(name.toLowerCase())
    ) || null;
}

module.exports = parseCSV;
