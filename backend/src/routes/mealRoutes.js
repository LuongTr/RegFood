const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Meal = require('../models/Meal');
const { body, validationResult } = require('express-validator');

// Add a new meal
router.post('/', auth, [
  body('type').isIn(['breakfast', 'lunch', 'dinner', 'snack']),
  body('date').isISO8601(),
  body('foods').isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const meal = new Meal({
      ...req.body,
      userId: req.user.id
    });

    await meal.save();
    res.status(201).json(meal);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get meals for a date range
router.get('/', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = {
      userId: req.user.id
    };

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const meals = await Meal.find(query)
      .sort({ date: -1 })
      .populate('foods.foodId');

    res.json(meals);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a meal
router.put('/:mealId', auth, async (req, res) => {
  try {
    const meal = await Meal.findOneAndUpdate(
      { _id: req.params.mealId, userId: req.user.id },
      { $set: req.body },
      { new: true }
    );

    if (!meal) {
      return res.status(404).json({ message: 'Meal not found' });
    }

    res.json(meal);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a meal
router.delete('/:mealId', auth, async (req, res) => {
  try {
    const meal = await Meal.findOneAndDelete({
      _id: req.params.mealId,
      userId: req.user.id
    });

    if (!meal) {
      return res.status(404).json({ message: 'Meal not found' });
    }

    res.json({ message: 'Meal deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get meal summary for dashboard
router.get('/summary', auth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const meals = await Meal.find({
      userId: req.user.id,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    });

    const summary = {
      totalMeals: meals.length,
      totalCalories: meals.reduce((sum, meal) => sum + meal.totalCalories, 0),
      totalProtein: meals.reduce((sum, meal) => sum + meal.totalProtein, 0),
      totalCarbs: meals.reduce((sum, meal) => sum + meal.totalCarbs, 0),
      totalFat: meals.reduce((sum, meal) => sum + meal.totalFat, 0),
      meals: meals
    };

    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;