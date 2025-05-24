const mongoose = require('mongoose');

const foodDatabaseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },  category: {
    type: String,
    required: false,
    trim: true,
    default: ''
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
  mealType: {
    type: [String],
    enum: ['breakfast', 'lunch', 'dinner', 'snack'],
    default: ['lunch', 'dinner']
  },
  dietaryPreferences: {
    type: [String],
    enum: ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'low-carb', 'high-protein'],
    default: []
  },
  calorieRange: {
    min: {
      type: Number,
      default: 0
    },
    max: {
      type: Number,
      default: 1000
    }  },  image: String,
  description: String,
  preparationTime: {
    type: Number,
    default: 30 // in minutes
  }
}, {
  timestamps: true,
  collection: 'foods' // Chỉ định rõ collection name là "foods"
});

// Add text index for search functionality
foodDatabaseSchema.index({ name: 'text', category: 'text' });

module.exports = mongoose.model('FoodDatabase', foodDatabaseSchema);