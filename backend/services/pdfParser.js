
const fs = require("fs");
const { PDFParse } = require("pdf-parse");

async function parsePDF(filePath) {
    const fileBuffer = fs.readFileSync(filePath);

    const parser = new PDFParse({
        data: new Uint8Array(fileBuffer)
    });

    try {
        const result = await parser.getText();

        if (!result.text.trim()) {
            throw new Error("No readable text found in PDF");
        }

        const lines = result.text.split("\n");
        const transactions = [];

        lines.forEach((line) => {
            line = line.trim();

            if (!line || /opening balance/i.test(line)) {
                return;
            }

            // Identify transaction lines by their date at the beginning
            if (!/^\d{2}-\d{2}-\d{4}\s/.test(line)) {
                return;
            }

            const match = line.match(
                /^(\d{2}-\d{2}-\d{4})\s+(.+?)\s+(\S+)\s+(\S+)\s+(\S+)$/
            );

            if (!match) {
                return;
            }

            const dateParts = match[1].split("-");
            const date = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;

            const description = match[2];

            const debit = match[3] === "-"
                ? 0
                : match[3].replace(/,/g, "");

            const credit = match[4] === "-"
                ? 0
                : match[4].replace(/,/g, "");

            const balance = match[5].replace(/,/g, "");

            transactions.push({
                date,
                description,
                debit,
                credit,
                balance,
                merchant: extractMerchant(description)
            });
        });

        if (transactions.length === 0) {
            throw new Error("No transaction rows found in PDF");
        }

        return transactions;

    } finally {
        await parser.destroy();
    }
}

function extractMerchant(description) {
    const merchants = ["Swiggy", "Amazon", "Uber", "Netflix"];

    return merchants.find((name) =>
        description.toLowerCase().includes(name.toLowerCase())
    ) || null;
}

module.exports = parsePDF;
