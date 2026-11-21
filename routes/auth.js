
const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const router = express.Router();

// SIGNUP — STUDENT AND EVALUATION ADMIN
router.post("/signup", async (req, res) => {
    try {
        const { name, email, password, selectedRole } = req.body;

        const normalizedEmail = email?.trim().toLowerCase();
        const userRole = selectedRole || "student";

        if (!name || !normalizedEmail || !password) {
            return res.status(400).json({
                message: "Please fill in all required fields."
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters."
            });
        }

        if (!["student", "admin"].includes(userRole)) {
            return res.status(400).json({
                message: "Please select a valid role."
            });
        }

        // Admin signup is allowed only in evaluation mode.
        if (
            userRole === "admin" &&
            process.env.EVALUATION_MODE !== "true"
        ) {
            return res.status(403).json({
                message: "Admin signup is currently disabled."
            });
        }

        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            return res.status(409).json({
                message: "Email is already registered."
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const newUser = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            role: userRole
        });

        return res.status(201).json({
            message: "Account created successfully!",
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
            }
        });

    } catch (error) {
        console.error("Signup error:", error);

        res.status(500).json({
            message: "Signup failed."
        });
    }
});

// LOGIN — ROLE-BASED
router.post("/login", async (req, res) => {
    try {
        const { email, password, selectedRole } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required."
            });
        }

        if (!["student", "admin"].includes(selectedRole)) {
            return res.status(400).json({
                message: "Please select a valid role."
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const user = await User.findOne({
            email: normalizedEmail
        });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password."
            });
        }

        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid email or password."
            });
        }

        if (user.role !== selectedRole) {
            return res.status(403).json({
                message: "This account does not belong to the selected role."
            });
        }

        req.session.regenerate((error) => {
            if (error) {
                return res.status(500).json({
                    message: "Could not create login session."
                });
            }

            req.session.userId = user._id;
            req.session.userRole = user.role;

            req.session.save((saveError) => {
                if (saveError) {
                    return res.status(500).json({
                        message: "Could not save login session."
                    });
                }

                res.json({
                    message: "Login successful!",
                    user: {
                        id: user._id,
                        name: user.name,
                        email: user.email,
                        role: user.role
                    }
                });
            });
        });

    } catch (error) {
        console.error("Login error:", error);

        res.status(500).json({
            message: "Login failed."
        });
    }
});

// LOGOUT
router.post("/logout", (req, res) => {
    req.session.destroy((error) => {
        if (error) {
            return res.status(500).json({
                message: "Logout failed."
            });
        }

        res.clearCookie("connect.sid");

        res.json({
            message: "Logged out successfully!"
        });
    });
});

// GET CURRENT LOGGED-IN USER
router.get("/me", async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({
                message: "Please log in first."
            });
        }

        const user = await User.findById(req.session.userId)
            .select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found."
            });
        }

        res.json({
            message: "User details fetched successfully!",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Fetch user error:", error);

        res.status(500).json({
            message: "Could not fetch user details."
        });
    }
});

module.exports = router;
