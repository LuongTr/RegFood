const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to check if user has required role
const roleAuth = (roles = []) => {
  // Convert string to array if only one role is passed
  if (typeof roles === 'string') {
    roles = [roles];
  }

  return async (req, res, next) => {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({ message: 'No authentication token found' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      
      // Find user and check role
      const user = await User.findById(decoded.userId);
      
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      req.user = { 
        id: user._id,
        role: user.role 
      };

      // Check if user role is in the allowed roles
      if (roles.length && !roles.includes(user.role)) {
        return res.status(403).json({ 
          message: 'Access denied: You do not have the required permission' 
        });
      }

      next();
    } catch (error) {
      res.status(401).json({ message: 'Authentication failed' });
    }
  };
};

module.exports = roleAuth;