const express = require('express');
const router = express.Router();
const Meal = require('../models/Meal');
const auth = require('../middleware/auth');
const FoodDatabase = require('../models/FoodDatabase');

/**
 * @route POST /api/meals
 * @desc Add a food to user's meal plan
 * @access Private
 */
router.post('/', auth, async (req, res) => {
  try {
    console.log('Received meal request:', req.body);
    const { foodId, mealType, servingSize, servingUnit, date } = req.body;
    
    // Validate required fields
    if (!foodId || !mealType) {
      return res.status(400).json({ 
        success: false, 
        message: 'Food ID and meal type are required' 
      });
    }
    
    // Check if food exists in database
    const food = await FoodDatabase.findById(foodId);
    if (!food) {
      console.log('Food not found:', foodId);
      return res.status(404).json({ 
        success: false, 
        message: 'Food not found' 
      });
    }
    
    // Default values
    const mealData = {
      user: req.user.id,
      food: foodId,
      mealType,
      servingSize: servingSize || food.servingSize || 100,
      servingUnit: servingUnit || food.servingUnit || 'g',
      date: date || new Date().toISOString().split('T')[0]
    };
    
    console.log('Creating meal with data:', mealData);
    
    // Create meal entry
    const newMeal = new Meal(mealData);
    
    await newMeal.save();
    
    console.log('Meal created:', newMeal);
    
    res.status(201).json({
      success: true,
      message: 'Food added to meal plan',
      data: newMeal
    });
    
  } catch (error) {
    console.error('Error adding food to meal plan:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

/**
 * @route GET /api/meals
 * @desc Get all meals for the user for a specific date
 * @access Private
 */
router.get('/', auth, async (req, res) => {
  try {
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date is required'
      });
    }
    
    // Find meals for the user on the specified date
    const meals = await Meal.find({
      user: req.user.id,
      date
    }).populate('food');
    
    console.log(`Found ${meals.length} meals for date ${date}`);
    
    res.json({
      success: true,
      count: meals.length,
      data: meals
    });
    
  } catch (error) {
    console.error('Error fetching meals:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

/**
 * @route DELETE /api/meals/:id
 * @desc Delete a meal from the meal plan
 * @access Private
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const meal = await Meal.findById(req.params.id);
    
    if (!meal) {
      return res.status(404).json({
        success: false,
        message: 'Meal not found'
      });
    }
    
    // Check if the meal belongs to the user
    if (meal.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this meal'
      });
    }
    
    await meal.deleteOne(); // Using deleteOne() instead of remove() which is deprecated
    
    res.json({
      success: true,
      message: 'Meal removed from meal plan'
    });
    
  } catch (error) {
    console.error('Error deleting meal:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;