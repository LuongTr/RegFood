const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const FoodDatabase = require('../models/FoodDatabase');
const roleAuth = require('../middleware/roleAuth');

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

// Get all foods - accessible by all authenticated users
router.get('/', roleAuth(['user', 'admin']), async (req, res) => {
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

// Add new food - admin only
router.post('/', roleAuth('admin'), upload.single('image'), async (req, res) => {    
    try {
        console.log('Received file:', req.file);
        console.log('Received body:', req.body);
        const foodData = JSON.parse(req.body.foodData);
        console.log('Parsed food data:', foodData);
        let imagePath = null;
        
        if (req.file) {
            // Store only the relative path for uploaded files
            imagePath = `/uploads/${req.file.filename}`;
            console.log('Image path for uploaded file:', imagePath);
        } else if (foodData.imageUrl && isValidUrl(foodData.imageUrl)) {
            // If no file uploaded but a valid URL is provided
            imagePath = foodData.imageUrl;
            console.log('Using provided image URL:', imagePath);
        }// Create nutrition object safely
        const nutrition = {
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
            fiber: 0
        };
        
        // Check if nutritionPer100g exists and populate values
        if (foodData.nutritionPer100g) {
            nutrition.calories = Number(foodData.nutritionPer100g.calories || 0);
            nutrition.protein = Number(foodData.nutritionPer100g.protein || 0);
            nutrition.carbs = Number(foodData.nutritionPer100g.carbs || 0);
            nutrition.fat = Number(foodData.nutritionPer100g.fat || 0);
            nutrition.fiber = Number(foodData.nutritionPer100g.fiber || 0);
        }
        
        const newFood = new FoodDatabase({
            name: foodData.name,
            category: foodData.category || "Main Course",
            servingSize: Number(foodData.servingSize || 100),
            servingUnit: foodData.servingUnit || 'g',
            nutritionPer100g: nutrition,
            mealType: Array.isArray(foodData.mealType) && foodData.mealType.length > 0 
                ? foodData.mealType 
                : ['lunch', 'dinner'],
            dietaryPreferences: Array.isArray(foodData.dietaryPreferences) 
                ? foodData.dietaryPreferences 
                : [],
            description: foodData.description || '',
            preparationTime: Number(foodData.preparationTime || 0),
            // Store the image path/url in one field
            image: imagePath
        });

        await newFood.save();

        res.json({
            success: true,
            data: newFood
        });    } catch (error) {
        console.error('Error adding food:', error);
        
        // More detailed error message
        let errorMessage = 'Error adding food';
        if (error instanceof SyntaxError) {
            errorMessage = 'Invalid JSON data format';
        } else if (error.name === 'ValidationError') {
            errorMessage = Object.values(error.errors).map(e => e.message).join(', ');
        }
        
        res.status(500).json({ 
            success: false, 
            message: errorMessage,
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Update food - admin only
router.put('/:id', roleAuth('admin'), upload.single('image'), async (req, res) => {    
    try {
        console.log('Update food request for ID:', req.params.id);
        console.log('Request params full:', req.params);
        console.log('Request path:', req.path);
        console.log('Request URL:', req.originalUrl);
        console.log('Received file:', req.file);
        console.log('Received body:', req.body);

        const foodData = JSON.parse(req.body.foodData);
        console.log('Parsed food data for update:', foodData);
        
        // First check if food exists
        const existingFood = await FoodDatabase.findById(req.params.id);
        if (!existingFood) {
            return res.status(404).json({
                success: false,
                message: 'Food not found'
            });
        }

        let imagePath = existingFood.image; // Default to current image
        
        // Handle image update if a new one is provided
        if (req.file) {
            // Store only the relative path for uploaded files
            imagePath = `/uploads/${req.file.filename}`;
            console.log('New image path for update:', imagePath);
            
            // Delete old image if it exists and is not a URL
            if (existingFood.image && !existingFood.image.startsWith('http') && existingFood.image.startsWith('/uploads/')) {
                try {
                    const oldImagePath = path.join(__dirname, '../..', existingFood.image);
                    if (fs.existsSync(oldImagePath)) {
                        fs.unlinkSync(oldImagePath);
                        console.log('Deleted old image:', oldImagePath);
                    }
                } catch (err) {
                    console.error('Error deleting old image:', err);
                }
            }
        } else if (foodData.image === '') {
            // If image is explicitly set to empty, remove the image
            imagePath = null;
        }

        // Create nutrition object safely
        const nutrition = {
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
            fiber: 0
        };
        
        // Check if nutritionPer100g exists and populate values
        if (foodData.nutritionPer100g) {
            nutrition.calories = Number(foodData.nutritionPer100g.calories || 0);
            nutrition.protein = Number(foodData.nutritionPer100g.protein || 0);
            nutrition.carbs = Number(foodData.nutritionPer100g.carbs || 0);
            nutrition.fat = Number(foodData.nutritionPer100g.fat || 0);
            nutrition.fiber = Number(foodData.nutritionPer100g.fiber || 0);
        }
        
        // Update the existing food document
        const updatedFood = await FoodDatabase.findByIdAndUpdate(
            req.params.id, 
            {
                name: foodData.name,
                category: foodData.category || "Main Course",
                servingSize: Number(foodData.servingSize || 100),
                servingUnit: foodData.servingUnit || 'g',
                nutritionPer100g: nutrition,
                mealType: Array.isArray(foodData.mealType) && foodData.mealType.length > 0 
                    ? foodData.mealType 
                    : ['lunch', 'dinner'],
                dietaryPreferences: Array.isArray(foodData.dietaryPreferences) 
                    ? foodData.dietaryPreferences 
                    : [],
                description: foodData.description || '',
                preparationTime: Number(foodData.preparationTime || 0),
                // Store the image path/url in one field
                image: imagePath
            },
            { new: true } // Return the updated document
        );

        res.json({
            success: true,
            data: updatedFood
        });

    } catch (error) {
        console.error('Error updating food:', error);
        
        // More detailed error message
        let errorMessage = 'Error updating food';
        if (error instanceof SyntaxError) {
            errorMessage = 'Invalid JSON data format';
        } else if (error.name === 'ValidationError') {
            errorMessage = Object.values(error.errors).map(e => e.message).join(', ');
        } else if (error.name === 'CastError') {
            errorMessage = 'Invalid food ID format';
        }
        
        res.status(500).json({ 
            success: false, 
            message: errorMessage,
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Delete food - admin only
router.delete('/:id', roleAuth('admin'), async (req, res) => {
    try {
        console.log('Delete food request for ID:', req.params.id);
        console.log('Request params full:', req.params);
        console.log('Request path:', req.path);
        console.log('Request URL:', req.originalUrl);
        
        // Find the food first to check if it exists and to get image path
        const food = await FoodDatabase.findById(req.params.id);
        
        if (!food) {
            return res.status(404).json({
                success: false,
                message: 'Food not found'
            });
        }
        
        // Delete the associated image file if it exists and is a local file
        if (food.image && !food.image.startsWith('http') && food.image.startsWith('/uploads/')) {
            try {
                const imagePath = path.join(__dirname, '../..', food.image);
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                    console.log('Deleted image file:', imagePath);
                }
            } catch (err) {
                console.error('Error deleting image file:', err);
                // Continue with deletion even if image deletion fails
            }
        }
        
        // Delete the food document
        await FoodDatabase.findByIdAndDelete(req.params.id);
        
        res.json({
            success: true,
            message: 'Food deleted successfully'
        });
        
    } catch (error) {
        console.error('Error deleting food:', error);
        
        let errorMessage = 'Error deleting food';
        if (error.name === 'CastError') {
            errorMessage = 'Invalid food ID format';
        }
        
        res.status(500).json({
            success: false,
            message: errorMessage,
            error: error.message
        });
    }
});

module.exports = router;
