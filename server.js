
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const session = require("express-session");
const {MongoStore} = require("connect-mongo");

const app = express();
const authRoutes = require("./routes/auth");
const noticeRoutes = require("./routes/notices");
const adminSetupRoutes = require("./routes/adminSetup");

// Load environment variables
dotenv.config();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({
            mongoUrl: process.env.MONGODB_URI,
            collectionName: "sessions"
        }),
        cookie: {
            maxAge: 1000 * 60 * 60 * 24,
            httpOnly: true,
            sameSite: "lax"
        }
    })
);
app.use("/api/auth", authRoutes);
app.use("/api/notices", noticeRoutes);
app.use("/api/admin-setup", adminSetupRoutes);

// Serve frontend files
app.use(express.static("public"));

// Test API
app.get("/api/test", (req, res) => {
    res.json({
        message: "Campus Notice Aggregator backend is working!"
    });
});

// Connect MongoDB and start server
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("MongoDB connected successfully!");
        console.log("Database:", mongoose.connection.name);

        const PORT = process.env.PORT || 3000;

        app.listen(PORT, () => {
            console.log(`Campus Notice Aggregator running at http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error("MongoDB connection failed:", error.message);
    });
