// middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'غير مسموح - لا يوجد توكن' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: 'المستخدم غير موجود' });
    if (user.suspended) {
      return res.status(403).json({ message: 'تم إيقاف الحساب مؤقتًا. يرجى التواصل مع الإدارة.' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'توكن غير صالح أو منتهي' });
  }
};

const isAdmin = async (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ message: 'غير مصرح - يجب أن تكون أدمن' });
  }
  next();
};

module.exports = { verifyToken, isAdmin };
