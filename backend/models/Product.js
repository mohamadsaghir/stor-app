const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 0 },
  profit: { type: Number, default: 0 },
  total: { type: Number, required: true },
  netProfit: { type: Number, default: 0 }, // هنا أضفت netProfit مع قيمة افتراضية 0
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);
