const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { verifyToken, isAdmin } = require('../middleware/auth');
const User = require('../models/User');
 
// جلب جميع المستخدمين
router.get('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// حذف مستخدم
router.delete('/:userId', verifyToken, isAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    // حذف كل المنتجات المرتبطة بالمستخدم
    await require('../models/Product').deleteMany({ userId });
    // حذف كل الديون المرتبطة بالمستخدم
    await require('../models/Debt').deleteMany({ userId });
    // حذف كل تغييرات المنتجات المرتبطة بالمستخدم
    await require('../models/ProductChange').deleteMany({ userId });
    // حذف المستخدم نفسه
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User and all related data deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user and related data' });
  }
});

// تغيير كلمة مرور المستخدم
router.put('/:userId/password', verifyToken, isAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { password } = req.body;
    
    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.findByIdAndUpdate(
      userId,
      { password: hashedPassword },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating password' });
  }
});

// إيقاف/تفعيل حساب المستخدم
router.put('/:userId/suspend', verifyToken, isAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { suspended } = req.body;
    
    const user = await User.findByIdAndUpdate(
      userId,
      { suspended: suspended },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ 
      message: suspended ? 'User suspended successfully' : 'User activated successfully',
      user 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating user status' });
  }
});

module.exports = router;
