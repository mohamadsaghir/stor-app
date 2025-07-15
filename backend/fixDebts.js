require('dotenv').config();
const mongoose = require('mongoose');
const Debt = require('./models/Debt');

async function fixDebts() {
  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log('Connected to MongoDB');

  // ابحث عن الديون التي ليس لديها userId
  const debtsWithoutUser = await Debt.find({ $or: [ { userId: { $exists: false } }, { userId: null } ] });
  console.log(`Found ${debtsWithoutUser.length} debts without userId.`);

  if (debtsWithoutUser.length > 0) {
    // حذف الديون التي ليس لديها userId
    const result = await Debt.deleteMany({ $or: [ { userId: { $exists: false } }, { userId: null } ] });
    console.log(`Deleted ${result.deletedCount} debts without userId.`);
  } else {
    console.log('No debts without userId found.');
  }

  mongoose.disconnect();
}

fixDebts().catch(err => {
  console.error('Error fixing debts:', err);
  mongoose.disconnect();
}); 