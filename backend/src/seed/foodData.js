const mongoose = require('mongoose');
const FoodDatabase = require('../models/FoodDatabase');
require('dotenv').config();

const foodData = [
  {
    name: "Pizza",
    category: "Fast Food",
    servingSize: 100,
    servingUnit: "g",
    nutritionPer100g: {
      calories: 266,
      protein: 11,
      carbs: 33,
      fat: 10,
      fiber: 2.2
    }
  },
  {
    name: "Hamburger",
    category: "Fast Food",
    servingSize: 100,
    servingUnit: "g",
    nutritionPer100g: {
      calories: 295,
      protein: 17,
      carbs: 24,
      fat: 14,
      fiber: 1.6
    }
  },
  {
    name: "Sushi",
    category: "Japanese",
    servingSize: 100,
    servingUnit: "g",
    nutritionPer100g: {
      calories: 150,
      protein: 5.6,
      carbs: 30,
      fat: 0.7,
      fiber: 0.9
    }
  },
  {
    name: "Caesar Salad",
    category: "Salads",
    servingSize: 100,
    servingUnit: "g",
    nutritionPer100g: {
      calories: 184,
      protein: 8,
      carbs: 8,
      fat: 14,
      fiber: 2.5
    }
  },
  {
    name: "French Fries",
    category: "Side Dishes",
    servingSize: 100,
    servingUnit: "g",
    nutritionPer100g: {
      calories: 312,
      protein: 3.4,
      carbs: 41,
      fat: 15,
      fiber: 3.8
    }
  },
  {
    name: "Ramen",
    category: "Japanese",
    servingSize: 100,
    servingUnit: "g",
    nutritionPer100g: {
      calories: 436,
      protein: 10,
      carbs: 63,
      fat: 17,
      fiber: 2.9
    }
  },
  {
    name: "Ice Cream",
    category: "Desserts",
    servingSize: 100,
    servingUnit: "g",
    nutritionPer100g: {
      calories: 207,
      protein: 3.5,
      carbs: 24,
      fat: 11,
      fiber: 0.7
    }
  },
  {
    name: "Chocolate Cake",
    category: "Desserts",
    servingSize: 100,
    servingUnit: "g",
    nutritionPer100g: {
      calories: 371,
      protein: 5.4,
      carbs: 47,
      fat: 19,
      fiber: 2.3
    }
  },
  {
    name: "Fried Rice",
    category: "Asian",
    servingSize: 100,
    servingUnit: "g",
    nutritionPer100g: {
      calories: 186,
      protein: 5.3,
      carbs: 32,
      fat: 4.5,
      fiber: 1.2
    }
  },
  {
    name: "Greek Salad",
    category: "Salads",
    servingSize: 100,
    servingUnit: "g",
    nutritionPer100g: {
      calories: 130,
      protein: 3.3,
      carbs: 7.8,
      fat: 10.2,
      fiber: 2.4
    }
  }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    // Clear existing data
    await FoodDatabase.deleteMany({});
    
    // Insert new data
    await FoodDatabase.insertMany(foodData);
    
    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();