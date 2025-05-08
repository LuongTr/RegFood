const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Water = require('../models/Water');
const { body, validationResult } = require('express-validator');

// Add water intake
router.post('/', auth, [
  body('amount').isNumeric(),
  body('unit').isIn(['ml', 'L']),
  body('date').optional().isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const waterIntake = new Water({
      ...req.body,
      userId: req.user.id
    });

    await waterIntake.save();
    res.status(201).json(waterIntake);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get water intake for a date range
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

    const waterIntakes = await Water.find(query).sort({ date: -1 });
    res.json(waterIntakes);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get today's total water intake
router.get('/today', auth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const waterIntakes = await Water.find({
      userId: req.user.id,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    });

    const totalIntake = waterIntakes.reduce((sum, intake) => {
      // Convert all measurements to ml for consistency
      const amount = intake.unit === 'L' ? intake.amount * 1000 : intake.amount;
      return sum + amount;
    }, 0);

    res.json({
      totalIntake,
      unit: 'ml',
      intakes: waterIntakes
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete water intake
router.delete('/:id', auth, async (req, res) => {
  try {
    const waterIntake = await Water.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!waterIntake) {
      return res.status(404).json({ message: 'Water intake record not found' });
    }

    res.json({ message: 'Water intake record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;