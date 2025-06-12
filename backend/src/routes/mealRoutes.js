// Create this file in your backend server: routes/meals.js

const express = require('express');
const router = express.Router();
const Meal = require('../models/Meal');
const auth = require('../middleware/auth');
const mongoose = require('mongoose');

// Get all meals for a user
router.get('/', auth, async (req, res) => {
  try {
    // Check if date query parameter exists
    if (req.query.date) {
      const date = req.query.date;
      
      // Create date range for the specified day
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      
      const meals = await Meal.find({
        userId: req.user.id,
        date: {
          $gte: startDate,
          $lte: endDate
        }
      }).populate('foodId').sort({ mealType: 1 });
      
      return res.json({
        success: true,
        data: meals
      });
    }

    // If no date parameter, return all meals
    const meals = await Meal.find({ userId: req.user.id })
      .populate('foodId')
      .sort({ date: -1 });
    
    return res.json({
      success: true,
      data: meals
    });
  } catch (err) {
    console.error('Error fetching meals:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
});

// Get meals for a specific date
router.get('/date/:date', auth, async (req, res) => {
  try {
    const { date } = req.params;
    console.log('Fetching meals for date:', date);
    
    // Create date range for the specified day (in UTC to match stored dates)
    const startDate = new Date(date);
    startDate.setUTCHours(0, 0, 0, 0);
    
    const endDate = new Date(date);
    endDate.setUTCHours(23, 59, 59, 999);
    
    console.log('Looking for meals between:', startDate, 'and', endDate);
    console.log('User ID:', req.user.id);
    
    const meals = await Meal.find({
      userId: req.user.id,
      date: {
        $gte: startDate,
        $lte: endDate
      }
    }).populate('foodId').sort({ mealType: 1 });
    
    console.log('Found meals:', meals.length);
    
    return res.json({
      success: true,
      data: meals
    });
  } catch (err) {
    console.error('Error fetching meals by date:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
});

// Add a new meal
router.post('/', auth, async (req, res) => {
  try {
    console.log('Meal add request received:', req.body);
    const { foodId, date, mealType, servingSize, servingUnit, notes } = req.body;
    
    if (!foodId) {
      return res.status(400).json({
        success: false,
        message: 'Food ID is required'
      });
    }

    // Validate ObjectId without throwing exceptions
    if (!mongoose.isValidObjectId(foodId)) {
      return res.status(400).json({
        success: false,
        message: `Invalid food ID format: ${foodId}`
      });
    }
    
    // Create meal with provided data or defaults
    const newMeal = new Meal({
      userId: req.user.id,
      foodId: foodId,
      date: date || new Date(),
      mealType: mealType || 'lunch',
      type: mealType || 'lunch', // Set both for compatibility
      servingSize: servingSize || 100,
      servingUnit: servingUnit || 'g',
      notes: notes || ''
    });
    
    console.log('Attempting to save meal:', newMeal);
    
    // Save the meal
    const savedMeal = await newMeal.save();
    console.log('Meal saved successfully:', savedMeal);
    
    // Populate food information for the response
    const populatedMeal = await Meal.findById(savedMeal._id).populate('foodId');
    
    return res.status(201).json({
      success: true,
      message: 'Meal added successfully',
      data: populatedMeal
    });
  } catch (err) {
    console.error('Error adding meal:', err);
    // Send detailed error information
    return res.status(500).json({
      success: false,
      message: 'Server error while adding meal',
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

// Update a meal
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { foodId, date, mealType, servingSize, servingUnit, notes } = req.body;
    
    // Validate ObjectId
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid meal ID format: ${id}`
      });
    }
    
    // Find the meal to update
    const meal = await Meal.findOne({
      _id: id,
      userId: req.user.id
    });
    
    if (!meal) {
      return res.status(404).json({
        success: false,
        message: 'Meal not found or not authorized'
      });
    }
    
    // Update meal fields
    if (foodId) {
      // Validate foodId format
      if (!mongoose.isValidObjectId(foodId)) {
        return res.status(400).json({
          success: false,
          message: `Invalid food ID format: ${foodId}`
        });
      }
      meal.foodId = foodId;
    }
    if (date) meal.date = date;
    if (mealType) {
      meal.mealType = mealType;
      meal.type = mealType; // Update both fields for compatibility
    }
    if (servingSize) meal.servingSize = servingSize;
    if (servingUnit) meal.servingUnit = servingUnit;
    if (notes !== undefined) meal.notes = notes;
    
    await meal.save();
    const updatedMeal = await Meal.findById(id).populate('foodId');
    
    return res.json({
      success: true,
      message: 'Meal updated successfully',
      data: updatedMeal
    });
  } catch (err) {
    console.error('Error updating meal:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
});

// Delete a meal
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if meal exists and belongs to user
    const meal = await Meal.findOne({
      _id: id,
      userId: req.user.id
    });
    
    if (!meal) {
      return res.status(404).json({
        success: false,
        message: 'Meal not found or not authorized'
      });
    }
    
    await Meal.deleteOne({ _id: id });
    
    return res.json({
      success: true,
      message: 'Meal deleted successfully',
      data: { _id: id }
    });
  } catch (err) {
    console.error('Error deleting meal:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
});

module.exports = router;