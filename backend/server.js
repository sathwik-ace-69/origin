
require("dotenv").config();

const express = require("express");
const transactionRoutes = require("./routes/transactionRoutes");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "Orgin Backend Running"
    });
});

// Transaction APIs
app.use("/api/transactions", transactionRoutes);

// Error handler
app.use((err, req, res, next) => {
    console.error(err.message);

    res.status(400).json({
        error: err.message
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Orgin server running on port ${PORT}`);
});
