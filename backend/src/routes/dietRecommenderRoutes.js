const express = require('express');
const router = express.Router();
const FoodDatabase = require('../models/FoodDatabase');

// Helper function to distribute calories across meals
const distributeMealCalories = (maintenanceCalories) => {
    return {
        breakfast: Math.round(maintenanceCalories * 0.25), // 25% for breakfast
        lunch: Math.round(maintenanceCalories * 0.35),     // 35% for lunch
        dinner: Math.round(maintenanceCalories * 0.30),    // 30% for dinner
        snacks: Math.round(maintenanceCalories * 0.10)     // 10% for snacks
    };
};

// Helper function to calculate macro distribution
const calculateMacroTargets = (calories) => {
    return {
        protein: Math.round((calories * 0.3) / 4),  // 30% protein
        carbs: Math.round((calories * 0.45) / 4),   // 45% carbs
        fat: Math.round((calories * 0.25) / 9)      // 25% fat
    };
};

// Helper function to get meal type alternatives
const getMealTypeAlternatives = (mealType) => {
    switch (mealType) {
        case 'breakfast':
            return ['breakfast', 'snack'];
        case 'lunch':
            return ['lunch', 'dinner', 'main course'];
        case 'dinner':
            return ['dinner', 'lunch', 'main course'];
        case 'snacks':
            return ['snack', 'breakfast'];
        default:
            return [mealType];
    }
};

// Helper function to find suitable foods
const findSuitableFoods = async (query, mealType, targetCalories) => {
    // Get alternative meal types
    const mealTypes = getMealTypeAlternatives(mealType);

    // Calculate calorie ranges (more flexible)
    const minCalories = targetCalories * 0.3;  // Allow foods with at least 30% of target
    const maxCalories = targetCalories * 2.5;  // Allow foods up to 250% of target

    return await FoodDatabase.find({
        ...query,
        $or: [
            { mealType: { $in: mealTypes } },
            { category: { $in: ['Main Course', mealType] } }
        ],
        'nutritionPer100g.calories': {
            $lte: maxCalories,
            $gte: minCalories
        }
    }).limit(4); // Increased limit for more options
};

/**
 * GET /api/diet-recommender/recommendations
 * Get diet recommendations based on maintenance calories and preferences
 */
router.get('/recommendations', async (req, res) => {
    try {
        const {
            maintenanceCalories,
            dietaryPreferences = [],
            excludedCategories = [],
            mealType = 'all'
        } = req.query;

        if (!maintenanceCalories) {
            return res.status(400).json({ message: 'Maintenance calories are required' });
        }

        // Calculate target calories for each meal
        const mealCalories = distributeMealCalories(parseFloat(maintenanceCalories));
        
        // Calculate macro targets
        const macroTargets = calculateMacroTargets(parseFloat(maintenanceCalories));

        // Build the base query
        let query = {};

        if (dietaryPreferences.length > 0) {
            query.dietaryPreferences = { $in: Array.isArray(dietaryPreferences) ? dietaryPreferences : [dietaryPreferences] };
        }

        if (excludedCategories.length > 0) {
            query.category = { $nin: Array.isArray(excludedCategories) ? excludedCategories : [excludedCategories] };
        }

        // If specific meal type is requested
        if (mealType !== 'all') {
            const recommendations = await findSuitableFoods(query, mealType, mealCalories[mealType]);
            return res.json({
                success: true,
                data: {
                    mealCalories: { [mealType]: mealCalories[mealType] },
                    macroTargets,
                    recommendations: { [mealType]: recommendations }
                }
            });
        }

        // Get food recommendations for each meal type
        const recommendations = {
            breakfast: await findSuitableFoods(query, 'breakfast', mealCalories.breakfast),
            lunch: await findSuitableFoods(query, 'lunch', mealCalories.lunch),
            dinner: await findSuitableFoods(query, 'dinner', mealCalories.dinner),
            snacks: await findSuitableFoods(query, 'snacks', mealCalories.snacks)
        };

        res.json({
            success: true,
            data: {
                mealCalories,
                macroTargets,
                recommendations
            }
        });
    } catch (error) {
        console.error('Error in diet recommendations:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating diet recommendations',
            error: error.message
        });
    }
});

/**
 * GET /api/diet-recommender/alternatives
 * Get alternative food suggestions for a specific meal type
 */
router.get('/alternatives', async (req, res) => {
    try {
        const {
            mealType,
            targetCalories,
            excludedFoods = [],
            dietaryPreferences = []
        } = req.query;

        if (!mealType || !targetCalories) {
            return res.status(400).json({
                message: 'Meal type and target calories are required'
            });
        }

        // Mở rộng phạm vi tìm kiếm cho các món thay thế
        const query = {
            mealType: { $in: [mealType, ...getMealTypeAlternatives(mealType)] },
            'nutritionPer100g.calories': {
                $lte: parseFloat(targetCalories) * 2,
                $gte: parseFloat(targetCalories) * 0.3
            }
        };

        if (excludedFoods.length > 0) {
            query._id = { $nin: excludedFoods };
        }

        if (dietaryPreferences.length > 0) {
            query.dietaryPreferences = { $in: dietaryPreferences };
        }

        const alternatives = await FoodDatabase.find(query).limit(5);

        res.json({
            success: true,
            data: alternatives
        });

    } catch (error) {
        console.error('Alternative suggestions error:', error);
        res.status(500).json({
            success: false,
            message: 'Error getting alternative suggestions',
            error: error.message
        });
    }
});

module.exports = router;
