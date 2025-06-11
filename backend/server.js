const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure static file serving for uploads
console.log('Uploads directory:', path.join(__dirname, 'uploads'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB Connection with updated options
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('Connected to MongoDB');
})
.catch((error) => {
  console.error('MongoDB connection error:', error);
  process.exit(1);
});


// Routes
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/users', require('./src/routes/userRoutes'));
app.use('/api/meals', require('./src/routes/mealRoutes'));
app.use('/api/water', require('./src/routes/waterRoutes'));
app.use('/api/diet-recommender', require('./src/routes/dietRecommenderRoutes'));
// Thêm route cho quản lý tài khoản (chỉ dành cho admin)
// app.use('/api/users', require('./src/routes/accountsRoutes'));
// Food routes - special handling to avoid conflicts
const foodListRoutes = require('./src/routes/foodListRoutes');

// First register the foodListRoutes for complete CRUD operations
// This handles GET, POST, PUT, DELETE for /api/foods
app.use('/api/foods', foodListRoutes);

// For specific food operations from foodRoutes.js
const foodRecognizeRoutes = require('./src/routes/foodRoutes');
app.use('/api/food', foodRecognizeRoutes);

// Basic error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});