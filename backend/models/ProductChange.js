const mongoose = require('mongoose');

const ProductChangeSchema = new mongoose.Schema({
  productName: { 
    type: String, 
    required: true 
  },
  type: { 
    type: String, 
    enum: ['add', 'update', 'delete'], 
    required: true 
  },
  oldQuantity: { 
    type: Number, 
    default: 0 
  },
  newQuantity: { 
    type: Number, 
    default: 0 
  },
  netProfit: { 
    type: Number, 
    default: 0 
  },
  details: { 
    type: String 
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  }
}, { 
  timestamps: true 
});

// إنشاء index للبحث السريع
ProductChangeSchema.index({ userId: 1, timestamp: -1 });

module.exports = mongoose.model('ProductChange', ProductChangeSchema); 