const mongoose = require('mongoose');
const FoodDatabase = require('../models/FoodDatabase');
require('dotenv').config();

const foodData = [
  {
    name: "Oatmeal with Berries",
    category: "Breakfast",
    servingSize: 100,
    servingUnit: "g",
    nutritionPer100g: {
      calories: 307,
      protein: 11,
      carbs: 55,
      fat: 5,
      fiber: 8
    },
    mealType: ["breakfast"],
    dietaryPreferences: ["vegetarian", "dairy-free"],
    description: "Classic oatmeal topped with mixed berries",
    preparationTime: 10
  },
  {
    name: "Greek Yogurt Parfait",
    category: "Breakfast",
    servingSize: 150,
    servingUnit: "g",
    nutritionPer100g: {
      calories: 150,
      protein: 15,
      carbs: 20,
      fat: 3,
      fiber: 3
    },
    mealType: ["breakfast", "snack"],
    dietaryPreferences: ["vegetarian"],
    description: "Greek yogurt layered with granola and fresh fruits",
    preparationTime: 5
  },
  {
    name: "Grilled Chicken Salad",
    category: "Main Course",
    servingSize: 200,
    servingUnit: "g",
    nutritionPer100g: {
      calories: 220,
      protein: 25,
      carbs: 10,
      fat: 12,
      fiber: 4
    },
    mealType: ["lunch", "dinner"],
    dietaryPreferences: ["gluten-free"],
    description: "Grilled chicken breast with mixed greens and light dressing",
    preparationTime: 20
  },
  {
    name: "Salmon with Quinoa",
    category: "Main Course",
    servingSize: 200,
    servingUnit: "g",
    nutritionPer100g: {
      calories: 350,
      protein: 28,
      carbs: 25,
      fat: 18,
      fiber: 4
    },
    mealType: ["lunch", "dinner"],
    dietaryPreferences: ["gluten-free", "dairy-free"],
    description: "Baked salmon fillet served with quinoa and vegetables",
    preparationTime: 25
  },
  {
    name: "Vegetarian Stir-Fry",
    category: "Main Course",
    servingSize: 250,
    servingUnit: "g",
    nutritionPer100g: {
      calories: 200,
      protein: 12,
      carbs: 30,
      fat: 8,
      fiber: 6
    },
    mealType: ["lunch", "dinner"],
    dietaryPreferences: ["vegetarian", "vegan", "gluten-free"],
    description: "Mixed vegetables stir-fried with tofu in light sauce",
    preparationTime: 20
  },
  {
    name: "Protein Smoothie",
    category: "Snacks",
    servingSize: 300,
    servingUnit: "ml",
    nutritionPer100g: {
      calories: 150,
      protein: 20,
      carbs: 15,
      fat: 4,
      fiber: 3
    },
    mealType: ["snack", "breakfast"],
    dietaryPreferences: ["vegetarian", "gluten-free"],
    description: "Protein-rich smoothie with fruits and protein powder",
    preparationTime: 5
  },
  {
    name: "Eggs Benedict",
    category: "Breakfast",
    servingSize: 250,
    servingUnit: "g",
    nutritionPer100g: {
      calories: 280,
      protein: 18,
      carbs: 15,
      fat: 16,
      fiber: 1
    },
    mealType: ["breakfast"],
    dietaryPreferences: ["gluten-free"],
    description: "Poached eggs with hollandaise sauce on English muffins",
    preparationTime: 20
  },
  {
    name: "Turkey and Avocado Wrap",
    category: "Main Course",
    servingSize: 200,
    servingUnit: "g",
    nutritionPer100g: {
      calories: 280,
      protein: 20,
      carbs: 25,
      fat: 14,
      fiber: 5
    },
    mealType: ["lunch"],
    dietaryPreferences: ["dairy-free"],
    description: "Turkey breast with avocado and vegetables in a wrap",
    preparationTime: 10
  },
  {
    name: "Quinoa Bowl",
    category: "Main Course",
    servingSize: 300,
    servingUnit: "g",
    nutritionPer100g: {
      calories: 220,
      protein: 8,
      carbs: 35,
      fat: 7,
      fiber: 5
    },
    mealType: ["lunch", "dinner"],
    dietaryPreferences: ["vegetarian", "vegan", "gluten-free"],
    description: "Quinoa bowl with roasted vegetables and tahini dressing",
    preparationTime: 25
  },
  {
    name: "Trail Mix",
    category: "Snacks",
    servingSize: 50,
    servingUnit: "g",
    nutritionPer100g: {
      calories: 450,
      protein: 15,
      carbs: 45,
      fat: 25,
      fiber: 8
    },
    mealType: ["snack"],
    dietaryPreferences: ["vegetarian", "vegan", "gluten-free"],
    description: "Mix of nuts, dried fruits, and dark chocolate",
    preparationTime: 0
  }
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
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
