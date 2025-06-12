const mongoose = require('mongoose');

const MealSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  food: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FoodDatabase', // Points to your food collection
    required: true
  },
  mealType: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner', 'snacks'],
    required: true
  },
  servingSize: {
    type: Number,
    required: true,
    default: 100
  },
  servingUnit: {
    type: String,
    required: true,
    default: 'g'
  },
  date: {
    type: String, // Store as YYYY-MM-DD
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Meal', MealSchema);