const mongoose = require('mongoose');

const foodDatabaseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  servingSize: {
    type: Number,
    required: true
  },
  servingUnit: {
    type: String,
    required: true
  },
  nutritionPer100g: {
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number,
    fiber: Number
  },
  imageUrl: String
}, {
  timestamps: true
});

// Add text index for search functionality
foodDatabaseSchema.index({ name: 'text', category: 'text' });

module.exports = mongoose.model('FoodDatabase', foodDatabaseSchema);