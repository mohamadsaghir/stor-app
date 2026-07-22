// middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (user && !user.suspended) {
        req.user = user;
        return next();
      }
    } catch (err) {
      // If token is invalid or expired, fall through to auto-login
    }
  }

  // Auto-login fallback: find the first active (non-suspended) user in the database
  try {
    const defaultUser = await User.findOne({ suspended: { $ne: true } });
    if (defaultUser) {
      req.user = defaultUser;
      return next();
    }
  } catch (err) {
    console.error('Auto-login database query failed:', err);
  }

  return res.status(401).json({ message: 'غير مسموح - يرجى تسجيل الدخول' });
};

const isAdmin = async (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ message: 'غير مصرح - يجب أن تكون أدمن' });
  }
  next();
};

module.exports = { verifyToken, isAdmin };
