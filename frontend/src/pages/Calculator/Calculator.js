import React, { useState } from "react";
import "./Calculator.css";

const Calculator = () => {
  const [formData, setFormData] = useState({
    gender: 'male',
    age: '',
    height: '',
    weight: '',
    activity: 'sedentary'
  });
  const [calories, setCalories] = useState(null);
  const [showResults, setShowResults] = useState(false);

  // Activity level multipliers
  const activityMultipliers = {
    sedentary: 1.2, // Little or no exercise
    light: 1.375, // Light exercise 1-3 days/week
    moderate: 1.55, // Moderate exercise 3-5 days/week
    active: 1.725, // Hard exercise 6-7 days/week
    'very-active': 1.9 // Very hard exercise & physical job
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const calculateBMR = () => {
    const { gender, age, height, weight } = formData;
    
    // Convert string inputs to numbers
    const numAge = Number(age);
    const numHeight = Number(height);
    const numWeight = Number(weight);

    // Harris-Benedict Formula
    if (gender === 'male') {
      // Men BMR = 88.362 + (13.397 × weight in kg) + (4.799 × height in cm) - (5.677 × age in years)
      return 88.362 + (13.397 * numWeight) + (4.799 * numHeight) - (5.677 * numAge);
    } else {
      // Women BMR = 447.593 + (9.247 × weight in kg) + (3.098 × height in cm) - (4.330 × age in years)
      return 447.593 + (9.247 * numWeight) + (3.098 * numHeight) - (4.330 * numAge);
    }
  };

  const handleCalculate = () => {
    // Validate inputs
    if (!formData.age || !formData.height || !formData.weight) {
      alert('Please fill in all fields');
      return;
    }
    if (formData.age < 10 || formData.age > 150) {
      alert('Age must be between 10 and 150');
      return;
    }
    if (formData.height < 50 || formData.height > 300) {
      alert('Height must be between 50 cm and 300 cm');
      return;
    }
    if (formData.weight < 20 || formData.weight > 500) {  
      alert('Weight must be between 20 kg and 500 kg');
      return;
    }

    // Calculate BMR
    const bmr = calculateBMR();
    
    // Calculate total daily calories based on activity level
    const totalCalories = Math.round(bmr * activityMultipliers[formData.activity]);
    
    setCalories(totalCalories);
    setShowResults(true);
  };

  return (
    <div className="calculator-page">
      {/* Top Section: Form */}
      <div className="form-section">
        <h2>Calorie Calculator</h2>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="gender">Gender</label>
            <select 
              id="gender" 
              value={formData.gender}
              onChange={handleInputChange}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="age">Age</label>
            <input 
              type="number" 
              id="age" 
              placeholder="Enter your age"
              value={formData.age}
              onChange={handleInputChange}
              min="15"
              max="80"
            />
          </div>
          <div className="form-group">
            <label htmlFor="height">Height (cm)</label>
            <input 
              type="number" 
              id="height" 
              placeholder="Enter your height"
              value={formData.height}
              onChange={handleInputChange}
              min="130"
              max="230"
            />
          </div>
          <div className="form-group">
            <label htmlFor="weight">Weight (kg)</label>
            <input 
              type="number" 
              id="weight" 
              placeholder="Enter your weight"
              value={formData.weight}
              onChange={handleInputChange}
              min="40"
              max="160"
            />
          </div>
          <div className="form-group">
            <label htmlFor="activity">Activity Level</label>
            <select 
              id="activity"
              value={formData.activity}
              onChange={handleInputChange}
            >
              <option value="sedentary">Sedentary (little or no exercise)</option>
              <option value="light">Lightly active (light exercise 1-3 days/week)</option>
              <option value="moderate">Moderately active (moderate exercise 3-5 days/week)</option>
              <option value="active">Active (hard exercise 6-7 days/week)</option>
              <option value="very-active">Very active (very hard exercise, physical job)</option>
            </select>
          </div>
        </div>
        <button className="calculate-btn" onClick={handleCalculate}>
          Calculate Daily Calories
        </button>
      </div>

      {/* Bottom Section: Results */}
      {showResults && (
        <div className="results-section">
          <h3>Your Daily Calorie Needs</h3>
          <div className="results-card">
            <p>Maintenance: <strong>{calories} kcal</strong></p>
            <p>Weight loss (0.5kg/week): <strong>{calories - 500} kcal</strong></p>
            <p>Weight gain (0.5kg/week): <strong>{calories + 500} kcal</strong></p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calculator;