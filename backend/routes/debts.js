const Debt = require('./models/Debt'); // تأكد عندك الموديل

// 🔸 جلب كل الديون للمستخدم الحالي
app.get('/api/debts', authMiddleware, async (req, res) => {
  try {
    const debts = await Debt.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json({ debts });
  } catch (error) {
    res.status(500).json({ message: 'خطأ في جلب الديون' });
  }
});

// 🔸 إضافة دين
app.post('/api/debts', authMiddleware, async (req, res) => {
  try {
    const { name, phone, note, amount, date } = req.body;
    const debt = new Debt({
      name,
      phone,
      note,
      amount,
      date: date || new Date(),
      userId: req.user.id,
    });
    await debt.save();
    res.json({ debt, message: 'تمت إضافة الدين' });
  } catch (error) {
    res.status(500).json({ message: 'خطأ في إضافة الدين' });
  }
});

// 🔸 حذف دين
app.delete('/api/debts/:id', authMiddleware, async (req, res) => {
  try {
    const deleted = await Debt.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!deleted) return res.status(404).json({ message: 'لم يتم العثور على الدين' });
    res.json({ message: 'تم الحذف' });
  } catch (error) {
    res.status(500).json({ message: 'خطأ في الحذف' });
  }
});

// 🔸 تعديل دين
app.put('/api/debts/:id', authMiddleware, async (req, res) => {
  try {
    const { name, phone, note, amount, date } = req.body;
    const updated = await Debt.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { name, phone, note, amount, date },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'لم يتم العثور على الدين' });
    res.json({ debt: updated, message: 'تم التعديل' });
  } catch (error) {
    res.status(500).json({ message: 'خطأ في التعديل' });
  }
});
