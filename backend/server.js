require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

const Product = require('./models/Product');
const User = require('./models/User');
const Debt = require('./models/Debt');
const ProductChange = require('./models/ProductChange');
const { verifyToken } = require('./middleware/auth');
const sendEmail = require('./utils/sendEmail');
const crypto = require('crypto');
const productsRouter = require('./routes/products');

console.log('MONGODB_URI:', process.env.MONGODB_URI);
console.log('SENDGRID_API_KEY:', process.env.SENDGRID_API_KEY);

app.use(express.json());
app.use(cors({
  origin: [
    'https://stor-app-three.vercel.app/', // فقط الدومين الجديد على Vercel
 // الدومين الجديد الذي يحتاج السماح
  ],
  credentials: true
}));

// تسجيل مستخدم جديد
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password)
      return res.status(400).json({ message: 'All fields are required' });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, userId: user._id, message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed' });
  }
});

// تسجيل الدخول
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(400).json({ message: 'Invalid credentials' });
    if (user.suspended) {
      return res.status(403).json({ message: 'تم إيقاف الحساب مؤقتًا. يرجى التواصل مع الإدارة.' });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, userId: user._id, message: 'Login successful' });
  } catch (error) {
    res.status(500).json({ message: 'Login failed' });
  }
});

// بيانات المستخدم الحالي
app.get('/api/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get user data' });
  }
});

// إدارة المستخدمين (للأدمن فقط)
const usersRouter = require('./routes/users');
app.use('/api/users', usersRouter);

// إضافة منتج
app.post('/api/products', verifyToken, async (req, res) => {
  try {
    const { name, price, quantity, profit = 0 } = req.body;

    if (!name || price === undefined || quantity === undefined) {
      return res.status(400).json({ message: 'الحقول المطلوبة غير مكتملة' });
    }

    const priceNum = Number(price);
    const quantityNum = Number(quantity);
    const profitNum = Number(profit);

    if (isNaN(priceNum) || isNaN(quantityNum) || isNaN(profitNum)) {
      return res.status(400).json({ message: 'البيانات يجب أن تكون أرقامًا صحيحة' });
    }

    const total = priceNum + profitNum;
    
    // حساب الربح الصافي - منطق جديد
    let netProfit;
    
    // إذا كانت الكمية أكبر من 0، احسب الربح الصافي
    if (quantityNum > 0) {
      netProfit = profitNum * quantityNum;
    } else {
      // إذا كانت الكمية 0 أو أقل، الربح الصافي يبقى كما هو
      netProfit = profitNum;
    }

    const product = new Product({
      name,
      price: priceNum,
      quantity: quantityNum,
      profit: profitNum,
      total,
      netProfit,
      userId: req.user.id,
    });

    await product.save();

    // تسجيل إضافة المنتج في سجل التغييرات
    const productChange = new ProductChange({
      productName: name,
      type: 'add',
      oldQuantity: 0,
      newQuantity: quantityNum,
      netProfit: netProfit,
      details: `تم إضافة منتج جديد: ${name}`,
      userId: req.user.id
    });
    await productChange.save();

    res.json({ product, message: 'تم إضافة المنتج' });
  } catch (error) {
    console.error('Error in POST /api/products:', error);
    res.status(500).json({ message: 'خطأ في إضافة المنتج' });
  }
});

// جلب المنتجات
app.get('/api/products', verifyToken, async (req, res) => {
  try {
    const products = await Product.find({ userId: req.user.id });
    res.json({ products });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get products' });
  }
});

// حذف منتج
app.delete('/api/products/:id', verifyToken, async (req, res) => {
  try {
    const deleted = await Product.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!deleted) return res.status(404).json({ message: 'Product not found' });
    
    // تسجيل حذف المنتج في سجل التغييرات
    const productChange = new ProductChange({
      productName: deleted.name,
      type: 'delete',
      oldQuantity: deleted.quantity || 0,
      newQuantity: 0,
      netProfit: 0,
      details: `تم حذف منتج: ${deleted.name}`,
      userId: req.user.id
    });
    await productChange.save();
    
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product' });
  }
});

// تعديل منتج موجود
app.put('/api/products/:id', verifyToken, async (req, res) => {
  try {
    const { name, price, quantity, profit } = req.body;
    const productId = req.params.id;

    if (!name || price === undefined || quantity === undefined || profit === undefined) {
      return res.status(400).json({ message: 'جميع الحقول مطلوبة' });
    }

    const priceNum = Number(price);
    const quantityNum = Number(quantity);
    const profitNum = Number(profit);

    if (isNaN(priceNum) || isNaN(quantityNum) || isNaN(profitNum)) {
      return res.status(400).json({ message: 'الحقول يجب أن تكون أرقاماً صحيحة' });
    }

    // جلب المنتج الحالي لمعرفة الكمية السابقة
    const currentProduct = await Product.findOne({ _id: productId, userId: req.user.id });
    if (!currentProduct) {
      return res.status(404).json({ message: 'المنتج غير موجود أو غير مصرح بالتعديل' });
    }

    const total = priceNum + profitNum;
    
    // حساب الربح الصافي - منطق جديد
    let netProfit;
    const oldQuantity = currentProduct.quantity || 0;
    const oldNetProfit = currentProduct.netProfit || 0;
    
    if (quantityNum > oldQuantity) {
      // إذا زادت الكمية: احسب الربح الصافي الجديد
      netProfit = profitNum * quantityNum;
    } else if (quantityNum < oldQuantity) {
      // إذا قللت الكمية: الربح الصافي يبقى كما هو
      netProfit = oldNetProfit;
    } else {
      // إذا لم تتغير الكمية: احسب الربح الصافي العادي
      netProfit = profitNum * quantityNum;
    }

    const updatedProduct = await Product.findOneAndUpdate(
      { _id: productId, userId: req.user.id },
      { name, price: priceNum, quantity: quantityNum, profit: profitNum, total, netProfit },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: 'المنتج غير موجود أو غير مصرح بالتعديل' });
    }

    // تسجيل تعديل المنتج في سجل التغييرات
    const productChange = new ProductChange({
      productName: name,
      type: 'update',
      oldQuantity: oldQuantity,
      newQuantity: quantityNum,
      netProfit: netProfit,
      details: `تم تعديل منتج: ${name} - الكمية من ${oldQuantity} إلى ${quantityNum}`,
      userId: req.user.id
    });
    await productChange.save();

    res.json({ product: updatedProduct, message: 'تم تحديث المنتج بنجاح' });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'حدث خطأ أثناء تحديث المنتج' });
  }
});

// ديون - جلب الديون
app.get('/api/debts', verifyToken, async (req, res) => {
  try {
    const debts = await Debt.find({ userId: req.user.id }).sort({ date: -1 });
    res.json({ success: true, debts });
  } catch (error) {
    console.error('Error fetching debts:', error);
    res.status(500).json({ success: false, message: 'فشل في تحميل الديون' });
  }
});

// ديون - إضافة دين جديد
app.post('/api/debts', verifyToken, async (req, res) => {
  try {
    const { name, phone, date, amount, note } = req.body;

    if (!name || !phone || !amount) {
      return res.status(400).json({ success: false, message: 'الحقول الأساسية ناقصة' });
    }

    const debt = new Debt({
      name,
      phone,
      date: date ? new Date(date) : new Date(),
      amount,
      note,
      userId: req.user.id,
    });

    await debt.save();

    res.json({ success: true, debt, message: 'تم إضافة الدين' });
  } catch (error) {
    console.error('Error adding debt:', error);
    res.status(500).json({ success: false, message: 'حدث خطأ أثناء إضافة الدين' });
  }
});

// حذف دين
app.delete('/api/debts/:id', verifyToken, async (req, res) => {
  try {
    const deleted = await Debt.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!deleted) return res.status(404).json({ success: false, message: 'Debt not found' });
    res.json({ success: true, message: 'Debt deleted' });
  } catch (error) {
    console.error('Error deleting debt:', error);
    res.status(500).json({ success: false, message: 'Error deleting debt' });
  }
});

// تعديل دين
app.put('/api/debts/:id', verifyToken, async (req, res) => {
  try {
    const { name, phone, date, amount, note } = req.body;
    const debtId = req.params.id;

    const updatedDebt = await Debt.findOneAndUpdate(
      { _id: debtId, userId: req.user.id },
      { name, phone, date: date ? new Date(date) : new Date(), amount, note },
      { new: true }
    );

    if (!updatedDebt) {
      return res.status(404).json({ success: false, message: 'Debt not found or unauthorized' });
    }

    res.json({ success: true, debt: updatedDebt, message: 'تم تحديث الدين' });
  } catch (error) {
    console.error('Error updating debt:', error);
    res.status(500).json({ success: false, message: 'حدث خطأ أثناء تحديث الدين' });
  }
});

// ⚠️ راوت غير آمن - فقط للتجربة
app.get('/api/all-users', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: 'خطأ في جلب المستخدمين' });
  }
});

// ⚠️ راوتات غير آمنة - فقط للتجربة
app.delete('/api/all-users/:id', async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'المستخدم غير موجود' });
    res.json({ message: 'تم حذف المستخدم' });
  } catch (error) {
    res.status(500).json({ message: 'خطأ في حذف المستخدم' });
  }
});

app.put('/api/all-users/:id/role', async (req, res) => {
  try {
    const { isAdmin } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { isAdmin }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'المستخدم غير موجود' });
    res.json({ user, message: 'تم تحديث الصلاحية' });
  } catch (error) {
    res.status(500).json({ message: 'خطأ في تحديث الصلاحية' });
  }
});

app.put('/api/all-users/:id/password', async (req, res) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'كلمة المرور مطلوبة ويجب أن تكون 6 أحرف على الأقل' });
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { password: hashedPassword },
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ message: 'المستخدم غير موجود' });
    res.json({ user, message: 'تم تغيير كلمة المرور بنجاح' });
  } catch (error) {
    res.status(500).json({ message: 'خطأ في تغيير كلمة المرور' });
  }
});

// إعادة تعيين كلمة المرور - طلب إعادة التعيين
app.post('/api/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'البريد الإلكتروني مطلوب' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'البريد الإلكتروني غير مسجل' });
    }

    // إنشاء توكن لإعادة تعيين كلمة المرور
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // ساعة واحدة

    // حفظ التوكن في قاعدة البيانات
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();

    // إنشاء رابط إعادة التعيين
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    // محتوى البريد الإلكتروني
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; text-align: center;">إعادة تعيين كلمة المرور</h2>
        <p style="color: #666; line-height: 1.6;">
          مرحباً ${user.username}،
        </p>
        <p style="color: #666; line-height: 1.6;">
          لقد تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بك. إذا لم تقم بهذا الطلب، يمكنك تجاهل هذا البريد الإلكتروني.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                    color: white; 
                    padding: 15px 30px; 
                    text-decoration: none; 
                    border-radius: 8px; 
                    display: inline-block;
                    font-weight: bold;">
            إعادة تعيين كلمة المرور
          </a>
        </div>
        <p style="color: #666; line-height: 1.6; font-size: 14px;">
          هذا الرابط صالح لمدة ساعة واحدة فقط.
        </p>
        <p style="color: #666; line-height: 1.6; font-size: 14px;">
          إذا لم يعمل الرابط، يمكنك نسخ ولصق الرابط التالي في المتصفح:
        </p>
        <p style="color: #667eea; font-size: 12px; word-break: break-all;">
          ${resetUrl}
        </p>
      </div>
    `;

    // إرسال البريد الإلكتروني
    await sendEmail(
      user.email,
      'إعادة تعيين كلمة المرور',
      emailContent
    );

    res.json({ message: 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني' });
  } catch (error) {
    console.error('Error in forgot password:', error);
    res.status(500).json({ message: 'حدث خطأ أثناء إرسال طلب إعادة تعيين كلمة المرور' });
  }
});

// التحقق من صحة توكن إعادة تعيين كلمة المرور
app.get('/api/reset-password/verify/:token', async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'رابط إعادة تعيين كلمة المرور غير صالح أو منتهي الصلاحية' });
    }

    res.json({ message: 'التوكن صالح' });
  } catch (error) {
    console.error('Error verifying reset token:', error);
    res.status(500).json({ message: 'حدث خطأ أثناء التحقق من صحة الرابط' });
  }
});

// إعادة تعيين كلمة المرور
app.post('/api/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: 'جميع الحقول مطلوبة' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'رابط إعادة تعيين كلمة المرور غير صالح أو منتهي الصلاحية' });
    }

    // تشفير كلمة المرور الجديدة
    const hashedPassword = await bcrypt.hash(password, 12);

    // تحديث كلمة المرور وحذف التوكن
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'تم إعادة تعيين كلمة المرور بنجاح' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ message: 'حدث خطأ أثناء إعادة تعيين كلمة المرور' });
  }
});

// تغيير كلمة المرور للمستخدم الحالي
app.post('/api/change-password', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: 'جميع الحقول مطلوبة' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'المستخدم غير موجود' });

    // تحقق من كلمة المرور القديمة
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'كلمة المرور الحالية غير صحيحة' });
    }

    // تحديث كلمة المرور
    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    res.json({ message: 'تم تغيير كلمة المرور بنجاح' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'حدث خطأ أثناء تغيير كلمة المرور' });
  }
});

// ربط راوت users.js ليعمل /api/users بدون حماية
app.use('/api/users', require('./routes/users'));

// جلب سجل التغييرات للمنتجات
app.get('/api/product-changes', verifyToken, async (req, res) => {
  try {
    const changes = await ProductChange.find({ userId: req.user.id })
      .sort({ timestamp: -1 })
      .limit(50); // آخر 50 تغيير
    
    res.json({ changes });
  } catch (error) {
    console.error('Error fetching product changes:', error);
    res.status(500).json({ message: 'خطأ في جلب سجل التغييرات' });
  }
});

// حذف تسجيل تغيير
app.delete('/api/product-changes/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const deletedChange = await ProductChange.findOneAndDelete({ _id: id, userId });
    
    if (!deletedChange) {
      return res.status(404).json({ message: 'التسجيل غير موجود أو غير مصرح بحذفه' });
    }

    res.json({ message: 'تم حذف التسجيل بنجاح' });
  } catch (error) {
    console.error('Error deleting product change:', error);
    res.status(500).json({ message: 'خطأ في حذف التسجيل' });
  }
});

// تشغيل السيرفر والاتصال بقاعدة البيانات
const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

app.use('/api/products', productsRouter);
