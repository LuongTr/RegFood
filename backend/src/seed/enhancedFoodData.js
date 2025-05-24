const mongoose = require('mongoose');
const FoodDatabase = require('../models/FoodDatabase');
require('dotenv').config();

const vietnameseFoodData = [
  {
    name: "Phở Bò",
    category: "Vietnamese",
    servingSize: 500,
    servingUnit: "g",
    nutritionPer100g: {
      calories: 215,
      protein: 15,
      carbs: 25,
      fat: 8,
      fiber: 2
    },
    mealType: ["breakfast", "lunch", "dinner"],
    dietaryPreferences: [],
    description: "Traditional Vietnamese beef noodle soup",
    preparationTime: 30
  },
  {
    name: "Gỏi Cuốn",
    category: "Vietnamese",
    servingSize: 150,
    servingUnit: "g",
    nutritionPer100g: {
      calories: 120,
      protein: 8,
      carbs: 16,
      fat: 3,
      fiber: 2
    },
    mealType: ["lunch", "dinner"],
    dietaryPreferences: ["gluten-free"],
    description: "Vietnamese fresh spring rolls with shrimp",
    preparationTime: 20
  },
  {
    name: "Cơm Tấm",
    category: "Vietnamese",
    servingSize: 400,
    servingUnit: "g",
    nutritionPer100g: {
      calories: 280,
      protein: 20,
      carbs: 35,
      fat: 10,
      fiber: 3
    },
    mealType: ["lunch", "dinner"],
    dietaryPreferences: [],
    description: "Broken rice with grilled pork",
    preparationTime: 25
  }
];

const westernFoodData = [
  {
    name: "Quinoa Bowl",
    category: "Healthy",
    servingSize: 300,
    servingUnit: "g",
    nutritionPer100g: {
      calories: 180,
      protein: 12,
      carbs: 26,
      fat: 6,
      fiber: 4
    },
    mealType: ["lunch", "dinner"],
    dietaryPreferences: ["vegetarian", "gluten-free"],
    description: "Quinoa with roasted vegetables and chickpeas",
    preparationTime: 20
  },
  {
    name: "Avocado Toast",
    category: "Breakfast",
    servingSize: 200,
    servingUnit: "g",
    nutritionPer100g: {
      calories: 220,
      protein: 8,
      carbs: 20,
      fat: 15,
      fiber: 6
    },
    mealType: ["breakfast"],
    dietaryPreferences: ["vegetarian"],
    description: "Whole grain toast with mashed avocado",
    preparationTime: 10
  }
];

const healthySnacks = [
  {
    name: "Mixed Nuts",
    category: "Snacks",
    servingSize: 30,
    servingUnit: "g",
    nutritionPer100g: {
      calories: 580,
      protein: 20,
      carbs: 15,
      fat: 50,
      fiber: 8
    },
    mealType: ["snack"],
    dietaryPreferences: ["vegan", "gluten-free"],
    description: "Assorted nuts mix",
    preparationTime: 0
  },
  {
    name: "Greek Yogurt Parfait",
    category: "Snacks",
    servingSize: 200,
    servingUnit: "g",
    nutritionPer100g: {
      calories: 130,
      protein: 10,
      carbs: 15,
      fat: 4,
      fiber: 2
    },
    mealType: ["snack", "breakfast"],
    dietaryPreferences: ["vegetarian"],
    description: "Greek yogurt with honey and granola",
    preparationTime: 5
  }
];

const vegetarianOptions = [
  {
    name: "Tofu Stir-Fry",
    category: "Vegetarian",
    servingSize: 300,
    servingUnit: "g",
    nutritionPer100g: {
      calories: 160,
      protein: 12,
      carbs: 15,
      fat: 8,
      fiber: 4
    },
    mealType: ["lunch", "dinner"],
    dietaryPreferences: ["vegetarian", "vegan"],
    description: "Stir-fried tofu with mixed vegetables",
    preparationTime: 20
  }
];

// Combine all food data
const allFoodData = [
  ...vietnameseFoodData,
  ...westernFoodData,
  ...healthySnacks,
  ...vegetarianOptions
];

const seedDatabase = async () => {
  try {
    console.log('Connecting to MongoDB...');
    
    // Add these options to handle deprecation warnings and new MongoDB connection requirements
    const mongooseOptions = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      family: 4 // Use IPv4, skip trying IPv6
    };

    await mongoose.connect(process.env.MONGODB_URI, mongooseOptions);
    
    console.log('Connected to MongoDB successfully');
    
    // Clear existing data
    console.log('Clearing existing data...');
    await FoodDatabase.deleteMany({});
    
    // Insert new data
    console.log('Inserting new food data...');
    await FoodDatabase.insertMany(allFoodData);
    
    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Add proper error handling for MongoDB connection
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('connected', () => {
  console.log('MongoDB connected successfully');
});

seedDatabase();
