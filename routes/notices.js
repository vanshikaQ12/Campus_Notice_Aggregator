
const express = require("express");
const mongoose = require("mongoose");
const Notice = require("../models/Notice");
const { isAuthenticated, isAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

// CREATE NOTICE — Admin only
router.post("/", isAuthenticated, isAdmin, async (req, res) => {
    try {
        const {
            title,
            description,
            category,
            semester,
            expiryDate,
            isPinned
        } = req.body;

        const notice = await Notice.create({
            title,
            description,
            category,
            semester,
            expiryDate: expiryDate || null,
            isPinned: isPinned === true || isPinned === "true",
            createdBy: req.user._id
        });

        res.status(201).json({
            message: "Notice published successfully!",
            notice
        });

    } catch (error) {
        res.status(400).json({
            message: "Could not create notice.",
            error: error.message
        });
    }
});

// GET ALL NOTICES — Logged-in users


// GET ALL NOTICES — Logged-in users
router.get("/", isAuthenticated, async (req, res) => {
    try {
        const { category, semester, search } = req.query;

        const filter = {
            $and: [
                {
                    $or: [
                        { expiryDate: null },
                        { expiryDate: { $gt: new Date() } }
                    ]
                }
            ]
        };

        if (category) {
            filter.$and.push({ category });
        }

        if (semester) {
            const semesterNumber = Number(semester);

            if (
                !Number.isInteger(semesterNumber) ||
                semesterNumber < 1 ||
                semesterNumber > 12
            ) {
                return res.status(400).json({
                    message: "Invalid semester."
                });
            }

            filter.$and.push({ semester: semesterNumber });
        }

        if (search && search.trim()) {
            const safeSearch = search.trim().replace(
                /[.*+?^${}()|[\]\\]/g,
                "\\$&"
            );

            filter.$and.push({
                $or: [
                    { title: { $regex: safeSearch, $options: "i" } },
                    { description: { $regex: safeSearch, $options: "i" } }
                ]
            });
        }

        const notices = await Notice.find(filter)
            .populate("createdBy", "name email")
            .sort({ isPinned: -1, createdAt: -1 });

        res.json({
            count: notices.length,
            notices
        });

    } catch (error) {
        res.status(500).json({
            message: "Could not fetch notices.",
            error: error.message
        });
    }
});


// GET ONE NOTICE — Logged-in users
router.get("/:id", isAuthenticated, async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                message: "Invalid notice ID."
            });
        }

        const notice = await Notice.findOne({
    _id: req.params.id,
    $or: [
        { expiryDate: null },
        { expiryDate: { $gt: new Date() } }
    ]
}).populate("createdBy", "name email");

        if (!notice) {
            return res.status(404).json({
                message: "Notice not found."
            });
        }

        res.json({ notice });

    } catch (error) {
        res.status(500).json({
            message: "Could not fetch notice."
        });
    }
});

// UPDATE NOTICE — Admin only
router.put("/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                message: "Invalid notice ID."
            });
        }

        const allowedFields = [
            "title",
            "description",
            "category",
            "semester",
            "expiryDate",
            "isPinned"
        ];

        const updates = {};

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        }

        if (updates.expiryDate === "") {
            updates.expiryDate = null;
        }

        if (updates.isPinned !== undefined) {
            updates.isPinned =
                updates.isPinned === true ||
                updates.isPinned === "true";
        }

        const notice = await Notice.findByIdAndUpdate(
            req.params.id,
            updates,
            {
                new: true,
                runValidators: true
            }
        );

        if (!notice) {
            return res.status(404).json({
                message: "Notice not found."
            });
        }

        res.json({
            message: "Notice updated successfully!",
            notice
        });

    } catch (error) {
        res.status(400).json({
            message: "Could not update notice.",
            error: error.message
        });
    }
});

// DELETE NOTICE — Admin only
router.delete("/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                message: "Invalid notice ID."
            });
        }

        const notice = await Notice.findByIdAndDelete(req.params.id);

        if (!notice) {
            return res.status(404).json({
                message: "Notice not found."
            });
        }

        res.json({
            message: "Notice deleted successfully!"
        });

    } catch (error) {
        res.status(500).json({
            message: "Could not delete notice."
        });
    }
});

module.exports = router;
