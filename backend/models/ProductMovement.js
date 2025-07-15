const mongoose = require('mongoose');

const ProductMovementSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true },
  quantityChanged: { type: Number, required: true }, // الكمية التي نقصت (سالبة للنقص)
  profit: { type: Number, required: true }, // الربح الناتج عن هذه الحركة
  date: { type: Date, default: Date.now },
  remainingQuantity: { type: Number, required: true },
});

module.exports = mongoose.model('ProductMovement', ProductMovementSchema); 