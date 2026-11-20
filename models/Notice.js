const mongoose = require("mongoose");

const noticeSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            required: true
        },

        category: {
            type: String,
            enum: [
                "Academic",
                "Events",
                "Placement",
                "Sports",
                "Administrative",
                "Examinations",
                "Holidays"
            ],
            required: true
        },

        semester: {
            type: Number,
            min: 1,
            max: 12,
            required: true
        },

        expiryDate: {
            type: Date,
            default: null
        },

        isPinned: {
            type: Boolean,
            default: false
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Notice", noticeSchema);