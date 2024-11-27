const express = require("express");
const app = express();

// Middleware to parse JSON
app.use(express.json());

// Basic Route
app.get("/", (req, res) => {
    res.send("Craft Backend is Running!");
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
