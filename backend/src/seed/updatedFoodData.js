const mongoose = require('mongoose');
const FoodDatabase = require('../models/FoodDatabase');
require('dotenv').config();

const breakfastOptions = [
    {
        name: "Oatmeal with Fruits",
        category: "Breakfast",
        servingSize: 250,
        servingUnit: "g",
        nutritionPer100g: {
            calories: 150,
            protein: 5,
            carbs: 25,
            fat: 3,
            fiber: 4
        },
        mealType: ["breakfast"],
        dietaryPreferences: ["vegetarian", "vegan"],
        description: "Rolled oats cooked with milk, topped with fresh fruits and honey",
        preparationTime: 10
    },
    {
        name: "Bánh Mì Trứng",
        category: "Vietnamese",
        servingSize: 200,
        servingUnit: "g",
        nutritionPer100g: {
            calories: 250,
            protein: 12,
            carbs: 30,
            fat: 8,
            fiber: 2
        },
        mealType: ["breakfast"],
        dietaryPreferences: ["vegetarian"],
        description: "Vietnamese baguette with scrambled eggs",
        preparationTime: 15
    },
    {
        name: "Yogurt Berry Parfait",
        category: "Breakfast",
        servingSize: 300,
        servingUnit: "g",
        nutritionPer100g: {
            calories: 120,
            protein: 8,
            carbs: 15,
            fat: 4,
            fiber: 3
        },
        mealType: ["breakfast", "snack"],
        dietaryPreferences: ["vegetarian", "gluten-free"],
        description: "Greek yogurt layered with mixed berries and granola",
        preparationTime: 5
    }
];

const lunchOptions = [
    {
        name: "Grilled Chicken Salad",
        category: "Healthy",
        servingSize: 350,
        servingUnit: "g",
        nutritionPer100g: {
            calories: 180,
            protein: 25,
            carbs: 10,
            fat: 8,
            fiber: 4
        },
        mealType: ["lunch"],
        dietaryPreferences: ["gluten-free"],
        description: "Mixed greens with grilled chicken breast and balsamic vinaigrette",
        preparationTime: 20
    },
    {
        name: "Bún Chả",
        category: "Vietnamese",
        servingSize: 400,
        servingUnit: "g",
        nutritionPer100g: {
            calories: 220,
            protein: 18,
            carbs: 25,
            fat: 10,
            fiber: 3
        },
        mealType: ["lunch", "dinner"],
        dietaryPreferences: [],
        description: "Vietnamese grilled pork with rice noodles and herbs",
        preparationTime: 25
    },
    {
        name: "Quinoa Buddha Bowl",
        category: "Vegetarian",
        servingSize: 400,
        servingUnit: "g",
        nutritionPer100g: {
            calories: 190,
            protein: 8,
            carbs: 30,
            fat: 7,
            fiber: 6
        },
        mealType: ["lunch"],
        dietaryPreferences: ["vegetarian", "vegan", "gluten-free"],
        description: "Quinoa bowl with roasted vegetables and tahini dressing",
        preparationTime: 25
    }
];

const dinnerOptions = [
    {
        name: "Cá Kho Tộ",
        category: "Vietnamese",
        servingSize: 300,
        servingUnit: "g",
        nutritionPer100g: {
            calories: 200,
            protein: 22,
            carbs: 8,
            fat: 12,
            fiber: 1
        },
        mealType: ["dinner"],
        dietaryPreferences: ["gluten-free"],
        description: "Vietnamese caramelized fish in clay pot",
        preparationTime: 30
    },
    {
        name: "Grilled Salmon",
        category: "Healthy",
        servingSize: 200,
        servingUnit: "g",
        nutritionPer100g: {
            calories: 208,
            protein: 22,
            carbs: 0,
            fat: 13,
            fiber: 0
        },
        mealType: ["dinner"],
        dietaryPreferences: ["gluten-free"],
        description: "Grilled salmon with lemon and herbs",
        preparationTime: 20
    },
    {
        name: "Canh Rau",
        category: "Vietnamese",
        servingSize: 300,
        servingUnit: "g",
        nutritionPer100g: {
            calories: 45,
            protein: 3,
            carbs: 7,
            fat: 1,
            fiber: 3
        },
        mealType: ["lunch", "dinner"],
        dietaryPreferences: ["vegetarian", "vegan", "gluten-free"],
        description: "Vietnamese vegetable soup",
        preparationTime: 15
    }
];

const snackOptions = [
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
        name: "Fresh Fruit Platter",
        category: "Snacks",
        servingSize: 150,
        servingUnit: "g",
        nutritionPer100g: {
            calories: 70,
            protein: 1,
            carbs: 18,
            fat: 0,
            fiber: 3
        },
        mealType: ["snack"],
        dietaryPreferences: ["vegetarian", "vegan", "gluten-free"],
        description: "Assorted fresh seasonal fruits",
        preparationTime: 5
    },
    {
        name: "Hummus with Carrots",
        category: "Snacks",
        servingSize: 100,
        servingUnit: "g",
        nutritionPer100g: {
            calories: 150,
            protein: 6,
            carbs: 12,
            fat: 9,
            fiber: 4
        },
        mealType: ["snack"],
        dietaryPreferences: ["vegetarian", "vegan", "gluten-free"],
        description: "Homemade hummus with fresh carrot sticks",
        preparationTime: 5
    }
];

const allFoodData = [
    ...breakfastOptions,
    ...lunchOptions,
    ...dinnerOptions,
    ...snackOptions
];

const seedDatabase = async () => {
    try {
        console.log('Connecting to MongoDB...');
        const mongoUri = process.env.MONGODB_URI;
        if (!mongoUri) {
            throw new Error('MONGODB_URI is not defined in environment variables');
        }
        
        await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
            family: 4
        });
        
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
