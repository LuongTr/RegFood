const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const FoodDatabase = require('../models/FoodDatabase');
const multer = require('multer');
const path = require('path');

// Configure multer for image upload
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Modified to work with specific route registration in server.js

// Recognize food from image
router.post('/recognize', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    // Here we'll integrate with the Python food recognition service
    const formData = new FormData();
    formData.append('image', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype
    });

    const response = await fetch('http://localhost:5000/predict', {
      method: 'POST',
      body: formData
    });

    const result = await response.json();

    // Try to find nutrition info in our database
    let nutritionInfo = await FoodDatabase.findOne({
      $text: { $search: result.ingredient }
    });

    // Combine ML results with database nutrition info
    const foodInfo = {
      name: result.ingredient,
      confidence: result.confidence,
      nutritionInfo: nutritionInfo ? nutritionInfo.nutritionPer100g : null
    };

    res.json(foodInfo);
  } catch (error) {
    console.error('Food recognition error:', error);
    res.status(500).json({ message: 'Error processing image' });
  }
});

// Search food database
router.get('/search', auth, async (req, res) => {
  try {
    const { query } = req.query;
    const foods = await FoodDatabase.find({
      $text: { $search: query }
    }).limit(10);

    res.json(foods);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get food by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const food = await FoodDatabase.findById(req.params.id);
    if (!food) {
      return res.status(404).json({ message: 'Food not found' });
    }
    res.json(food);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;