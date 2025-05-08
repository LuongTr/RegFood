const mongoose = require('mongoose');

const mealSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  type: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner', 'snack'],
    required: true
  },
  foods: [{
    foodId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FoodDatabase'
    },
    name: String,
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number,
    portion: Number,
    unit: String,
    image: String
  }],
  totalCalories: {
    type: Number,
    default: 0
  },
  totalProtein: {
    type: Number,
    default: 0
  },
  totalCarbs: {
    type: Number,
    default: 0
  },
  totalFat: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Calculate totals before saving
mealSchema.pre('save', function(next) {
  this.totalCalories = this.foods.reduce((sum, food) => sum + (food.calories || 0), 0);
  this.totalProtein = this.foods.reduce((sum, food) => sum + (food.protein || 0), 0);
  this.totalCarbs = this.foods.reduce((sum, food) => sum + (food.carbs || 0), 0);
  this.totalFat = this.foods.reduce((sum, food) => sum + (food.fat || 0), 0);
  next();
});

module.exports = mongoose.model('Meal', mealSchema);