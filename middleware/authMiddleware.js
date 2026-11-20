const User = require("../models/User");

// Check whether user is logged in
const isAuthenticated = async (req, res, next) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({
                message: "Please log in first."
            });
        }

        const user = await User.findById(req.session.userId)
            .select("-password");

        if (!user) {
            return res.status(401).json({
                message: "User account not found."
            });
        }

        req.user = user;
        next();

    } catch (error) {
        res.status(500).json({
            message: "Authentication error."
        });
    }
};

// Check whether user is an admin
const isAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({
            message: "Access denied. Admins only."
        });
    }

    next();
};

module.exports = {
    isAuthenticated,
    isAdmin
};