const mongoose = require('mongoose');

const goldPriceSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['Au9999', 'Au999', 'Au995', 'Au990', 'Au950', 'Au900']
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  unit: {
    type: String,
    default: '元/克'
  },
  source: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now
  }
});

// 创建复合索引
goldPriceSchema.index({ type: 1, timestamp: -1 });

module.exports = mongoose.model('GoldPrice', goldPriceSchema); 