const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// Session-based authentication middleware
const authenticateSession = (req, res, next) => {
  console.log('Authentication check - Session exists:', !!req.session);
  console.log('Authentication check - User ID:', req.session?.userId);
  console.log('Authentication check - Request URL:', req.url);
  console.log('Authentication check - Request method:', req.method);

  if (req.session && req.session.userId) {
    console.log('Authentication successful');
    return next();
  } else {
    console.log('Authentication failed - no session or user ID');
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please login.'
    });
  }
};

// JWT-based authentication middleware (optional)
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByUsername(decoded.username);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

// Check if user is already logged in
const checkAuth = (req, res, next) => {
  if (req.session && req.session.userId) {
    req.isAuthenticated = true;
    req.userId = req.session.userId;
    req.username = req.session.username;
  } else {
    req.isAuthenticated = false;
  }
  next();
};

module.exports = {
  authenticateSession,
  authenticateToken,
  checkAuth
};
