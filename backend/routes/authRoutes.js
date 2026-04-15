const express = require('express');
const router = express.Router();
const User = require('../models/User'); // 1. Added this import to fix the "User is not defined" error
const { register, login } = require('../controllers/authController');
const protect = require('../middleware/authMiddleware'); // 2. Imported protection middleware

// Route: /api/auth/register
router.post('/register', register);

// Route: /api/auth/login
router.post('/login', login);

// Route: Get all users (Protected)
// This will now work perfectly with your updated Sidebar.jsx
router.get('/users', async (req, res) => {
    try {
        const users = await User.find().select("-password"); 
        res.json(users);
    } catch (err) {
        console.error("Error fetching users:", err);
        res.status(500).json({ message: "Error fetching users" });
    }
});

module.exports = router;