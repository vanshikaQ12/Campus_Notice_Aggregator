
const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const router = express.Router();

// Create the first admin account
router.post("/create-first-admin", async (req, res) => {
    try {
        const { name, email, password, setupKey } = req.body;

        // Verify the private setup key
        if (!process.env.ADMIN_SETUP_KEY ||
            setupKey !== process.env.ADMIN_SETUP_KEY) {
            return res.status(403).json({
                message: "Invalid admin setup key."
            });
        }

        // Prevent creating another admin through this setup route
        const existingAdmin = await User.findOne({ role: "admin" });

        if (existingAdmin) {
            return res.status(403).json({
                message: "An admin account already exists."
            });
        }

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Please provide name, email and password."
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                message: "Password must be at least 8 characters."
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            return res.status(409).json({
                message: "This email is already registered."
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const admin = await User.create({
            name,
            email: normalizedEmail,
            password: hashedPassword,
            role: "admin"
        });

        res.status(201).json({
            message: "First admin account created successfully!",
            admin: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role
            }
        });

    } catch (error) {
        res.status(500).json({
            message: "Admin setup failed."
        });
    }
});

module.exports = router;
