const authRoutes = require("./routes/auth");
const mongoose = require("mongoose");
const express = require("express");
const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Craft Backend is Running!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

const connectDB = async () => {
    try {
        await mongoose.connect("mongodb+srv://aniruddhupadhyay07:HsXNzCpYyrSR6nTb@cluster0.ty9rp.mongodb.net/craftDatabase?retryWrites=true&w=majority&appName=Cluster0", {
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

app.use("/api/auth", authRoutes);
