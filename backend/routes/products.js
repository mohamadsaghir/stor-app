const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const Product = require('../models/Product');
const ProductChange = require('../models/ProductChange');

// POST /api/products/decrement-quantity
router.post('/decrement-quantity', verifyToken, async (req, res) => {
  try {
    const { products } = req.body; // [{ productId, qty }]
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: 'Products array is required' });
    }
    for (const item of products) {
      const { productId, qty } = item;
      if (!productId || !qty || qty < 1) continue;
      const product = await Product.findById(productId);
      if (!product) continue;
      if (product.quantity < qty) {
        return res.status(400).json({ message: `Insufficient quantity for product: ${product.name}` });
      }
      const oldQuantity = product.quantity;
      product.quantity -= qty;
      if (product.quantity < 0) product.quantity = 0;
      await product.save();
      // سجل التغيير
      await ProductChange.create({
        productName: product.name,
        type: 'update',
        oldQuantity,
        newQuantity: product.quantity,
        netProfit: product.netProfit,
        details: `صرف نقدي: ${qty} من ${product.name}`,
        userId: req.user.id
      });
    }
    res.json({ message: 'Quantities updated successfully' });
  } catch (error) {
    console.error('Error in decrement-quantity:', error);
    res.status(500).json({ message: 'Error updating quantities' });
  }
});

module.exports = router; 