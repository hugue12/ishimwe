const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { authenticateSession } = require('../middleware/authMiddleware');

// Public routes
router.post('/login', AuthController.login);
router.post('/logout', AuthController.logout);
router.get('/check', AuthController.checkAuth);

// Test route to check if admin user exists
router.get('/test-user', async (req, res) => {
  try {
    const User = require('../models/userModel');
    const user = await User.findByUsername('admin');
    res.json({
      success: true,
      userExists: !!user,
      userData: user ? {
        username: user.Username,
        hasPassword: !!user.Password,
        passwordLength: user.Password ? user.Password.length : 0
      } : null
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Protected routes
router.post('/register', authenticateSession, AuthController.register);

module.exports = router;
