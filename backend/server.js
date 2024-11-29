const mongoose = require("mongoose");
const dotenv = require("dotenv").config();
const express = require("express");

const authRoutes = require("./routes/auth");
const craftRoutes = require("./routes/craft");


const app = express();
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Craft Backend is Running!");
});

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("MongoDB connected!");
    } catch (err) {
        console.error("MongoDB connection failed:", err.message);
        process.exit(1);
    }
};

connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

app.use("/api/auth", authRoutes);
app.use("/api/crafts", craftRoutes);
