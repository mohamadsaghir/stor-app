require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function createAdmin() {
  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  const username = 'Admin';
  const email = 'admin@admin.com';
  const password = 'Admin';
  let user = await User.findOne({ email });
  if (user) {
    if (!user.isAdmin) {
      user.isAdmin = true;
      await user.save();
      console.log('تمت ترقية المستخدم إلى أدمن:', email);
    } else {
      console.log('المستخدم الأدمن موجود بالفعل:', email);
    }
  } else {
    const hashedPassword = await bcrypt.hash(password, 12);
    user = new User({ username, email, password: hashedPassword, isAdmin: true });
    await user.save();
    console.log('تم إنشاء مستخدم أدمن جديد:', email, 'كلمة المرور: Admin');
  }
  mongoose.disconnect();
}

createAdmin().catch(err => {
  console.error('خطأ في إنشاء الأدمن:', err);
  mongoose.disconnect();
}); 