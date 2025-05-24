const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const FoodDatabase = require('../models/FoodDatabase');
const fs = require('fs');

// Cấu hình multer cho upload ảnh
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        const uploadDir = path.join(__dirname, '../../uploads/');
        if (!fs.existsSync(uploadDir)){
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function(req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Not an image! Please upload an image.'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// Helper function to check if URL is valid
const isValidUrl = (string) => {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
};

// Get all foods from the foods collection
router.get('/', auth, async (req, res) => {
    try {
        console.log('Fetching foods from database...');
        const foods = await FoodDatabase.find({});
        console.log('Foods found:', foods.length);
        res.json({
            success: true,
            data: foods
        });
    } catch (error) {
        console.error('Error fetching foods:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching foods',
            error: error.message 
        });
    }
});

// Add new food with image upload
router.post('/', auth, upload.single('image'), async (req, res) => {    try {
        console.log('Received file:', req.file);
        const foodData = JSON.parse(req.body.foodData);
        let imagePath = null;
        
        if (req.file) {
            // Store only the relative path for uploaded files
            imagePath = `/uploads/${req.file.filename}`;
            console.log('Image path for uploaded file:', imagePath);
        } else if (foodData.imageUrl && isValidUrl(foodData.imageUrl)) {
            // If no file uploaded but a valid URL is provided
            imagePath = foodData.imageUrl;
            console.log('Using provided image URL:', imagePath);
        }

        const newFood = new FoodDatabase({
            name: foodData.name,
            category: foodData.category || "",
            servingSize: 100,
            servingUnit: 'g',
            nutritionPer100g: {
                calories: Number(foodData.nutrition.calories),
                protein: Number(foodData.nutrition.protein),
                carbs: Number(foodData.nutrition.carbs),
                fat: Number(foodData.nutrition.fat)
            },            // Store the image path/url in one field
            image: imagePath
        });

        await newFood.save();

        res.json({
            success: true,
            data: newFood
        });
    } catch (error) {
        console.error('Error adding food:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error adding food',
            error: error.message 
        });
    }
});

module.exports = router;
