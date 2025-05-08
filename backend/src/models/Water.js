const mongoose = require('mongoose');

const waterSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  unit: {
    type: String,
    enum: ['ml', 'L'],
    default: 'ml'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Water', waterSchema);