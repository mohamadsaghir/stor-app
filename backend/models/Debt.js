// models/Debt.js
const mongoose = require('mongoose');

const debtSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  date: { type: Date, default: Date.now },
  amount: { type: Number, required: true },
  note: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

module.exports = mongoose.model('Debt', debtSchema);
