const mongoose = require('mongoose');

const mealSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  foodId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FoodDatabase',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  mealType: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner', 'snack'],
    required: true,
    default: 'lunch'
  },
  servingSize: {
    type: Number,
    required: true,
    default: 100
  },
  servingUnit: {
    type: String,
    default: 'g'
  },
  notes: {
    type: String
  },
  // For backward compatibility with existing code
  type: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner', 'snack']
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
  }]
}, {
  timestamps: true
});

// Pre-save middleware to ensure type is set based on mealType
mealSchema.pre('save', function(next) {
  // Set type to match mealType for compatibility
  if (this.mealType && !this.type) {
    this.type = this.mealType;
  }
  
  // Calculate totals if foods array exists
  if (Array.isArray(this.foods) && this.foods.length > 0) {
    this.totalCalories = this.foods.reduce((sum, food) => sum + (food.calories || 0), 0);
    this.totalProtein = this.foods.reduce((sum, food) => sum + (food.protein || 0), 0);
    this.totalCarbs = this.foods.reduce((sum, food) => sum + (food.carbs || 0), 0);
    this.totalFat = this.foods.reduce((sum, food) => sum + (food.fat || 0), 0);
  }
  next();
});

module.exports = mongoose.model('Meal', mealSchema);