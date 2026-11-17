
const XLSX = require("xlsx");

function parseExcel(filePath) {
    const workbook = XLSX.readFile(filePath);

    const sheetName = workbook.SheetNames[0];

    if (!sheetName) {
        throw new Error("Excel file contains no worksheets");
    }

    const worksheet = workbook.Sheets[sheetName];

    // Read all rows without assuming the first row contains headers
    const rows = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        defval: ""
    });

    if (rows.length < 2) {
        throw new Error("Excel file has no transaction rows");
    }

// Remove empty rows
const nonEmptyRows = rows.filter(row =>
    row.some(value => String(value).trim() !== "")
);

// First non-empty row contains column names
const headers = nonEmptyRows[0].map(header =>
    String(header).trim().toLowerCase()
);

// Remaining rows contain transactions
const records = nonEmptyRows.slice(1);



    function getDate(value) {
        if (typeof value === "number") {
            const parsed = XLSX.SSF.parse_date_code(value);

            if (!parsed) {
                throw new Error("Invalid Excel date");
            }

            return `${parsed.y}-${String(parsed.m).padStart(2, "0")}-${String(parsed.d).padStart(2, "0")}`;
        }

        const parts = String(value).trim().split("-");

        if (parts.length !== 3) {
            throw new Error("Invalid date format: " + value);
        }

        return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }

    function getValue(row, column) {
        const index = headers.indexOf(column.toLowerCase());

        if (index === -1) {
            throw new Error("Missing Excel column: " + column);
        }

        return row[index];
    }

    return records
        .filter(row => row.some(value => value !== ""))
        .map(row => {
            const description = String(
                getValue(row, "Description")
            ).trim();

            return {
                date: getDate(getValue(row, "Date")),
                description,
                debit: getValue(row, "Debit"),
                credit: getValue(row, "Credit"),
                balance: getValue(row, "Balance"),
                merchant: extractMerchant(description)
        };
        });
}

function extractMerchant(description) {
    const merchants = ["Swiggy", "Amazon", "Uber"];

    return merchants.find(name =>
        description.toLowerCase().includes(name.toLowerCase())
    ) || null;
}

module.exports = parseExcel;
