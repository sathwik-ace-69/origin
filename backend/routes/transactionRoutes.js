
const prisma = require("../services/prisma");
const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const parseCSV = require("../services/csvParser");
const parseExcel = require("../services/excelParser");
const parsePDF = require("../services/pdfParser");

const normalizeTransactions = require("../services/normalizeTransactions");
const validateTransactions = require("../services/validateTransactions");
const deduplicateTransactions = require("../services/deduplicateTransactions");
const saveTransactions = require("../services/saveTransactions");

const router = express.Router();

// Store uploaded files temporarily
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

// Allow CSV, Excel and PDF files
const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024
    },
    fileFilter: (req, file, cb) => {
        const extension = path.extname(file.originalname).toLowerCase();

        if ([".csv", ".xlsx", ".xls", ".pdf"].includes(extension)) {
            cb(null, true);
        } else {
            cb(new Error("Only CSV, Excel, and PDF files are allowed"));
        }
    }
});

// POST: Upload and process bank statement
router.post("/upload", upload.single("statement"), async (req, res) => {
    let filePath;

    try {
        if (!req.file) {
            return res.status(400).json({
                error: "Please upload a CSV, Excel, or PDF file"
            });
        }

        filePath = req.file.path;

        const { accountId } = req.body;

        if (!accountId) {
            return res.status(400).json({
                error: "accountId is required"
            });
        }

        // 1. Select parser based on file extension
        const extension = path.extname(req.file.originalname).toLowerCase();

        let transactions;

        if (extension === ".csv") {
            transactions = parseCSV(filePath);
        } else if (extension === ".pdf") {
            transactions = await parsePDF(filePath);
        } else {
            transactions = parseExcel(filePath);
        }

        // 2. Normalize transactions
        const normalization = normalizeTransactions(transactions);

        // 3. Validate normalized transactions
        const validation = validateTransactions(
            normalization.normalizedTransactions
        );

        // Combine all invalid transactions
        const invalidTransactions = [
            ...normalization.invalidTransactions,
            ...validation.invalidTransactions
        ];

        // Remove internal row number before saving
        const cleanTransactions = validation.validTransactions.map(
            ({ _rowNumber, ...transaction }) => transaction
        );

        // 4. Remove duplicates
        const deduplication = deduplicateTransactions(cleanTransactions);

        // 5. Save transactions to PostgreSQL
        const insertedCount = await saveTransactions(
            accountId,
            deduplication.uniqueTransactions
        );

        // 6. Return import summary
        return res.status(200).json({
            message: "Statement processed successfully",
            fileType: extension,
            summary: {
                totalRows: transactions.length,
                validRows: validation.validTransactions.length,
                invalidRows: invalidTransactions.length,
                duplicatesInFile: deduplication.duplicateTransactions.length,
                newlySaved: insertedCount
            },
            invalidTransactions: invalidTransactions
        });

    } catch (error) {
        console.error("Upload error:", error);

        return res.status(500).json({
            error: error.message || "Failed to process statement"
        });

    } finally {
        if (filePath) {
            fs.unlink(filePath, () => {});
        }
    }
});

// GET: All transactions for an account
router.get("/:accountId", async (req, res) => {
    try {
        const { accountId } = req.params;

        // Check whether account exists
        const account = await prisma.account.findUnique({
            where: {
                id: accountId
            },
            select: {
                id: true,
                bankName: true
            }
        });

        if (!account) {
            return res.status(404).json({
                error: "Account not found"
            });
        }

        // Fetch transactions
        const transactions = await prisma.transaction.findMany({
            where: {
                accountId: accountId
            },
            orderBy: {
                date: "desc"
            },
            select: {
                id: true,
                date: true,
                description: true,
                merchant: true,
                debit: true,
                credit: true,
                balance: true,
                currency: true
            }
        });

        return res.status(200).json({
            message: "Transactions fetched successfully",
            account: account,
            totalTransactions: transactions.length,
            transactions: transactions
        });

    } catch (error) {
        console.error("Fetch transactions error:", error);

        return res.status(500).json({
            error: "Failed to fetch transactions"
        });
    }
});

// GET: Filter transactions for an account
router.get("/:accountId/filter", async (req, res) => {
    try {
        const { accountId } = req.params;

        const {
            startDate,
            endDate,
            merchant,
            type,
            minAmount,
            maxAmount
        } = req.query;

        // Check account
        const account = await prisma.account.findUnique({
            where: { id: accountId },
            select: { id: true, bankName: true }
        });

        if (!account) {
            return res.status(404).json({
                error: "Account not found"
            });
        }

        // Validate transaction type
        if (type && !["debit", "credit"].includes(type)) {
            return res.status(400).json({
                error: "type must be debit or credit"
            });
        }

        // Validate dates
        const isValidDate = (value) =>
            /^\d{4}-\d{2}-\d{2}$/.test(value) &&
            !isNaN(Date.parse(value)) &&
            new Date(value).toISOString().slice(0, 10) === value;

        if (
            (startDate && !isValidDate(startDate)) ||
            (endDate && !isValidDate(endDate))
        ) {
            return res.status(400).json({
                error: "Dates must use YYYY-MM-DD format"
            });
        }

        if (startDate && endDate && startDate > endDate) {
            return res.status(400).json({
                error: "startDate cannot be after endDate"
            });
        }

        // Validate amounts
        const min = minAmount === undefined ? undefined : Number(minAmount);
        const max = maxAmount === undefined ? undefined : Number(maxAmount);

        if (
            (min !== undefined && (!Number.isFinite(min) || min < 0)) ||
            (max !== undefined && (!Number.isFinite(max) || max < 0)) ||
            (min !== undefined && max !== undefined && min > max)
        ) {
            return res.status(400).json({
                error: "Invalid amount range"
            });
        }

        // Build database filters
        const where = { accountId };

        if (startDate || endDate) {
            where.date = {};

            if (startDate) {
                where.date.gte = new Date(startDate + "T00:00:00.000Z");
            }

            if (endDate) {
                where.date.lte = new Date(endDate + "T00:00:00.000Z");
            }
        }

        if (merchant) {
            where.merchant = {
                contains: merchant,
                mode: "insensitive"
            };
        }

        if (type === "debit") {
            where.debit = { gt: 0 };
        } else if (type === "credit") {
            where.credit = { gt: 0 };
        }

        if (min !== undefined || max !== undefined) {
            const amountFilter = {};

            if (min !== undefined) amountFilter.gte = min;
            if (max !== undefined) amountFilter.lte = max;

            if (type === "debit") {
                where.debit = { gt: 0, ...amountFilter };
            } else if (type === "credit") {
                where.credit = { gt: 0, ...amountFilter };
            } else {
                where.OR = [
                    { debit: { gt: 0, ...amountFilter } },
                    { credit: { gt: 0, ...amountFilter } }
                ];
            }
        }

        // Fetch filtered transactions
        const transactions = await prisma.transaction.findMany({
            where,
            orderBy: { date: "desc" }
        });

        return res.status(200).json({
            message: "Filtered transactions fetched successfully",
            totalTransactions: transactions.length,
            filters: {
                startDate,
                endDate,
                merchant,
                type,
                minAmount,
                maxAmount
            },
            transactions
        });

    } catch (error) {
        console.error("Filter error:", error);

        return res.status(500).json({
            error: "Failed to filter transactions"
        });
    }
});

// GET: Transaction summary for an account
router.get("/:accountId/summary", async (req, res) => {
    try {
        const { accountId } = req.params;

        // Check account
        const account = await prisma.account.findUnique({
            where: {
                id: accountId
            },
            select: {
                id: true,
                bankName: true,
                currency: true
            }
        });

        if (!account) {
            return res.status(404).json({
                error: "Account not found"
            });
        }

        // Calculate total debit and credit
        const totals = await prisma.transaction.aggregate({
            where: {
                accountId: accountId
            },
            _sum: {
                debit: true,
                credit: true
            },
            _count: {
                _all: true
            }
        });

        const totalSpent = Number(totals._sum.debit || 0);
        const totalReceived = Number(totals._sum.credit || 0);

        // Find spending by merchant
        const merchantSpending = await prisma.transaction.groupBy({
            by: ["merchant"],
            where: {
                accountId: accountId,
                merchant: {
                    not: null
                },
                debit: {
                    gt: 0
                }
            },
            _sum: {
                debit: true
            },
            orderBy: {
                _sum: {
                    debit: "desc"
                }
            },
            take: 5
        });

        return res.status(200).json({
            message: "Transaction summary generated successfully",

            account: account,

            summary: {
                totalTransactions: totals._count._all,
                totalSpent: totalSpent,
                totalReceived: totalReceived,
                netCashFlow: totalReceived - totalSpent,
                currency: account.currency
            },

            topMerchants: merchantSpending.map((item) => ({
                merchant: item.merchant,
                totalSpent: Number(item._sum.debit || 0)
            }))
        });

    } catch (error) {
        console.error("Summary error:", error);

        return res.status(500).json({
            error: "Failed to generate transaction summary"
        });
    }
});

// CREATE A SINGLE TRANSACTION
router.post("/:accountId", async (req, res) => {
    try {
        const { accountId } = req.params;
        const {
            date,
            description,
            merchant,
            debit = 0,
            credit = 0,
            balance = null,
            currency = "INR"
        } = req.body;

        // 1. Check whether the account exists
        const account = await prisma.account.findUnique({
            where: { id: accountId }
        });

        if (!account) {
            return res.status(404).json({
                message: "Account not found"
            });
        }

        // 2. Validate required fields
        if (!date || !description || !description.trim()) {
            return res.status(400).json({
                message: "Date and description are required"
            });
        }

        // 3. Validate date format and actual date
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return res.status(400).json({
                message: "Date must be in YYYY-MM-DD format"
            });
        }

        const parsedDate = new Date(`${date}T00:00:00.000Z`);

        if (
            Number.isNaN(parsedDate.getTime()) ||
            parsedDate.toISOString().slice(0, 10) !== date
        ) {
            return res.status(400).json({
                message: "Invalid date"
            });
        }

        // 4. Validate transaction amounts
        const debitAmount = Number(debit);
        const creditAmount = Number(credit);
        const balanceAmount =
            balance === null || balance === "" ? null : Number(balance);

        if (
            !Number.isFinite(debitAmount) ||
            !Number.isFinite(creditAmount) ||
            debitAmount < 0 ||
            creditAmount < 0
        ) {
            return res.status(400).json({
                message: "Debit and credit must be valid non-negative numbers"
            });
        }

        if (
            balanceAmount !== null &&
            !Number.isFinite(balanceAmount)
        ) {
            return res.status(400).json({
                message: "Balance must be a valid number"
            });
        }

        // 5. Generate fingerprint for duplicate detection
        const transactionData = {
            date,
            description: description.trim(),
            debit: debitAmount,
            credit: creditAmount
        };

        const { uniqueTransactions } =
            deduplicateTransactions([transactionData]);

        const fingerprint = uniqueTransactions[0].fingerprint;

        // 6. Check whether transaction already exists
        const existing = await prisma.transaction.findFirst({
            where: {
                accountId,
                fingerprint
            }
        });

        if (existing) {
            return res.status(409).json({
                message: "Transaction already exists"
            });
        }

        // 7. Save transaction in PostgreSQL
        const transaction = await prisma.transaction.create({
            data: {
                accountId,
                date: parsedDate,
                description: description.trim(),
                merchant: merchant || null,
                debit: String(debitAmount),
                credit: String(creditAmount),
                balance: balanceAmount === null
                    ? null
                    : String(balanceAmount),
                currency,
                fingerprint
            }
        });

        return res.status(201).json({
            message: "Transaction created successfully",
            transaction
        });

    } catch (error) {
        console.error("Create transaction error:", error);

        return res.status(500).json({
            message: "Failed to create transaction"
        });
    }
});

// UPDATE AN EXISTING TRANSACTION
router.put("/:accountId/:transactionId", async (req, res) => {
    try {
        const { accountId, transactionId } = req.params;

        const {
            date,
            description,
            merchant,
            debit,
            credit,
            balance,
            currency
        } = req.body;

        // 1. Find transaction belonging to this account
        const existing = await prisma.transaction.findFirst({
            where: {
                id: transactionId,
                accountId
            }
        });

        if (!existing) {
            return res.status(404).json({
                message: "Transaction not found"
            });
        }

        // 2. Prepare updated values
        const updatedDate = date !== undefined
            ? date
            : existing.date.toISOString().slice(0, 10);

        const updatedDescription = description !== undefined
            ? description.trim()
            : existing.description;

        const updatedDebit = debit !== undefined
            ? Number(debit)
            : Number(existing.debit);

        const updatedCredit = credit !== undefined
            ? Number(credit)
            : Number(existing.credit);

        const updatedBalance = balance !== undefined
            ? (balance === null || balance === "" ? null : Number(balance))
            : (existing.balance === null ? null : Number(existing.balance));

        // 3. Validate date
        if (
            !/^\d{4}-\d{2}-\d{2}$/.test(updatedDate)
        ) {
            return res.status(400).json({
                message: "Date must be in YYYY-MM-DD format"
            });
        }

        const parsedDate = new Date(`${updatedDate}T00:00:00.000Z`);

        if (
            Number.isNaN(parsedDate.getTime()) ||
            parsedDate.toISOString().slice(0, 10) !== updatedDate
        ) {
            return res.status(400).json({
                message: "Invalid date"
            });
        }

        // 4. Validate description and amounts
        if (!updatedDescription) {
            return res.status(400).json({
                message: "Description cannot be empty"
            });
        }

        if (
            !Number.isFinite(updatedDebit) ||
            !Number.isFinite(updatedCredit) ||
            updatedDebit < 0 ||
            updatedCredit < 0
        ) {
            return res.status(400).json({
                message: "Debit and credit must be valid non-negative numbers"
            });
        }

        if (
            updatedBalance !== null &&
            !Number.isFinite(updatedBalance)
        ) {
            return res.status(400).json({
                message: "Balance must be a valid number"
            });
        }

        // 5. Generate updated fingerprint
        const { uniqueTransactions } = deduplicateTransactions([{
            date: updatedDate,
            description: updatedDescription,
            debit: updatedDebit,
            credit: updatedCredit
        }]);

        const fingerprint = uniqueTransactions[0].fingerprint;

        // 6. Check for duplicate transaction
        const duplicate = await prisma.transaction.findFirst({
            where: {
                accountId,
                fingerprint,
                NOT: {
                    id: transactionId
                }
            }
        });

        if (duplicate) {
            return res.status(409).json({
                message: "Another transaction with these details already exists"
            });
        }

        // 7. Update transaction
        const updatedTransaction = await prisma.transaction.update({
            where: {
                id: transactionId
            },
            data: {
                date: parsedDate,
                description: updatedDescription,
                merchant: merchant !== undefined
                    ? merchant
                    : existing.merchant,
                debit: String(updatedDebit),
                credit: String(updatedCredit),
                balance: updatedBalance === null
                    ? null
                    : String(updatedBalance),
                currency: currency !== undefined
                    ? currency
                    : existing.currency,
                fingerprint
            }
        });

        return res.status(200).json({
            message: "Transaction updated successfully",
            transaction: updatedTransaction
        });

    } catch (error) {
        console.error("Update transaction error:", error);

        return res.status(500).json({
            message: "Failed to update transaction"
        });
    }
});

// DELETE A TRANSACTION
router.delete("/:accountId/:transactionId", async (req, res) => {
    try {
        const { accountId, transactionId } = req.params;

        // 1. Check whether transaction exists in this account
        const existing = await prisma.transaction.findFirst({
            where: {
                id: transactionId,
                accountId
            }
        });

        if (!existing) {
            return res.status(404).json({
                message: "Transaction not found"
            });
        }

        // 2. Delete transaction
        await prisma.transaction.delete({
            where: {
                id: transactionId
            }
        });

        // 3. Send response
        return res.status(200).json({
            message: "Transaction deleted successfully",
            deletedTransactionId: transactionId
        });

    } catch (error) {
        console.error("Delete transaction error:", error);

        return res.status(500).json({
            message: "Failed to delete transaction"
        });
    }
});

// DELETE A TRANSACTION
router.delete("/:accountId/:transactionId", async (req, res) => {
    try {
        const { accountId, transactionId } = req.params;

        // 1. Check whether transaction exists in this account
        const existing = await prisma.transaction.findFirst({
            where: {
                id: transactionId,
                accountId
            }
        });

        if (!existing) {
            return res.status(404).json({
                message: "Transaction not found"
            });
        }

        // 2. Delete transaction
        await prisma.transaction.delete({
            where: {
                id: transactionId
            }
        });

        // 3. Send response
        return res.status(200).json({
            message: "Transaction deleted successfully",
            deletedTransactionId: transactionId
        });

    } catch (error) {
        console.error("Delete transaction error:", error);

        return res.status(500).json({
            message: "Failed to delete transaction"
        });
    }
});

// DELETE A TRANSACTION
router.delete("/:accountId/:transactionId", async (req, res) => {
    try {
        const { accountId, transactionId } = req.params;

        // 1. Check whether transaction exists in this account
        const existing = await prisma.transaction.findFirst({
            where: {
                id: transactionId,
                accountId
            }
        });

        if (!existing) {
            return res.status(404).json({
                message: "Transaction not found"
            });
        }

        // 2. Delete transaction
        await prisma.transaction.delete({
            where: {
                id: transactionId
            }
        });

        // 3. Send response
        return res.status(200).json({
            message: "Transaction deleted successfully",
            deletedTransactionId: transactionId
        });

    } catch (error) {
        console.error("Delete transaction error:", error);

        return res.status(500).json({
            message: "Failed to delete transaction"
        });
    }
});

// DELETE A TRANSACTION
router.delete("/:accountId/:transactionId", async (req, res) => {
    try {
        const { accountId, transactionId } = req.params;

        // 1. Check whether transaction exists in this account
        const existing = await prisma.transaction.findFirst({
            where: {
                id: transactionId,
                accountId
            }
        });

        if (!existing) {
            return res.status(404).json({
                message: "Transaction not found"
            });
        }

        // 2. Delete transaction
        await prisma.transaction.delete({
            where: {
                id: transactionId
            }
        });

        // 3. Send response
        return res.status(200).json({
            message: "Transaction deleted successfully",
            deletedTransactionId: transactionId
        });

    } catch (error) {
        console.error("Delete transaction error:", error);

        return res.status(500).json({
            message: "Failed to delete transaction"
        });
    }
});



module.exports = router;
