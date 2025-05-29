const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

class AuthController {
  // Login user
  static async login(req, res) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: 'Username and password are required'
        });
      }

      // Find user by username
      const user = await User.findByUsername(username);
      console.log('User found:', user ? 'Yes' : 'No');
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid username or password'
        });
      }

      console.log('User data:', {
        username: user.Username,
        hasPassword: !!user.Password,
        passwordLength: user.Password ? user.Password.length : 0
      });

      // Validate password
      const isValidPassword = await User.validatePassword(password, user.Password);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Invalid username or password'
        });
      }

      // Create session
      req.session.userId = user.UserID;
      req.session.username = user.Username;

      // Generate JWT token (optional)
      const token = jwt.sign(
        { userId: user.UserID, username: user.Username },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        success: true,
        message: 'Login successful',
        user: {
          userId: user.UserID,
          username: user.Username
        },
        token
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Logout user
  static async logout(req, res) {
    try {
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: 'Could not log out'
          });
        }
        res.clearCookie('connect.sid');
        res.json({
          success: true,
          message: 'Logout successful'
        });
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Check authentication status
  static async checkAuth(req, res) {
    try {
      if (req.session && req.session.userId) {
        const user = await User.findByUsername(req.session.username);
        if (user) {
          return res.json({
            success: true,
            isAuthenticated: true,
            user: {
              userId: user.UserID,
              username: user.Username
            }
          });
        }
      }

      res.json({
        success: true,
        isAuthenticated: false,
        user: null
      });
    } catch (error) {
      console.error('Check auth error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Register new user (admin only)
  static async register(req, res) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: 'Username and password are required'
        });
      }

      // Check if user already exists
      const existingUser = await User.findByUsername(username);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'Username already exists'
        });
      }

      // Create new user
      const result = await User.create({ username, password });

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        userId: result.userId
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}

module.exports = AuthController;
