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

  const [goal, setGoal] = useState('maintain');
  const [goalWeight, setGoalWeight] = useState('');
  const [calories, setCalories] = useState(null);
  const [adjustedCalories, setAdjustedCalories] = useState(null);
  const [showResults, setShowResults] = useState(false);

  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    'very-active': 1.9
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
    const numAge = Number(age);
    const numHeight = Number(height);
    const numWeight = Number(weight);

    if (gender === 'male') {
      return 88.362 + (13.397 * numWeight) + (4.799 * numHeight) - (5.677 * numAge);
    } else {
      return 447.593 + (9.247 * numWeight) + (3.098 * numHeight) - (4.330 * numAge);
    }
  };

  const handleCalculate = () => {
    const { age, height, weight, activity } = formData;
    if (!age || !height || !weight) {
      alert('Please fill in all fields');
      return;
    }

    const bmr = calculateBMR();
    const totalCalories = Math.round(bmr * activityMultipliers[activity]);
    setCalories(totalCalories);

    if (goal !== 'maintain' && goalWeight) {
      const kg = parseFloat(goalWeight);
      if (isNaN(kg) || kg <= 0 || kg > 50) {
        alert("Please enter a valid target weight change (1–50 kg)");
        return;
      }

      // More realistic approach: 0.5-1kg per week is healthy
      // For 1kg per week: approximately 1000 kcal deficit/surplus per day
      // For 0.5kg per week: approximately 500 kcal deficit/surplus per day
      
      // Calculate based on 0.5kg per week (safer approach)
      const weeksNeeded = kg / 0.5;
      const dailyCalorieChange = 500; // 500 kcal deficit/surplus for 0.5kg/week
      
      let finalCalories;
      if (goal === 'gain') {
        finalCalories = totalCalories + dailyCalorieChange;
      } else { // goal === 'loss'
        finalCalories = totalCalories - dailyCalorieChange;
        // Ensure we don't go below a safe minimum (1200 for women, 1500 for men)
        const minCalories = formData.gender === 'male' ? 1500 : 1200;
        finalCalories = Math.max(finalCalories, minCalories);
      }

      setAdjustedCalories(Math.round(finalCalories));
    } else {
      setAdjustedCalories(null);
    }

    setShowResults(true);
  };

  return (
    <div className="calculator-page">
      <div className="form-section">
        <h2>Calorie Calculator</h2>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="gender">Gender</label>
            <select id="gender" value={formData.gender} onChange={handleInputChange}>
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
              min="10"
              max="150"
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
              min="50"
              max="300"
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
              min="20"
              max="500"
            />
          </div>
          <div className="form-group">
            <label htmlFor="activity">Activity Level</label>
            <select id="activity" value={formData.activity} onChange={handleInputChange}>
              <option value="sedentary">Sedentary (little or no exercise)</option>
              <option value="light">Lightly active (1–3 days/week)</option>
              <option value="moderate">Moderately active (3–5 days/week)</option>
              <option value="active">Active (6–7 days/week)</option>
              <option value="very-active">Very active (hard daily exercise)</option>
            </select>
          </div>

          {/* Goal selection */}
          <div className="form-group full-width">
            <label>Goal</label>
            <select value={goal} onChange={(e) => setGoal(e.target.value)}>
              <option value="maintain">Maintain weight</option>
              <option value="loss">Lose weight</option>
              <option value="gain">Gain weight</option>
            </select>
          </div>

          {(goal === 'loss' || goal === 'gain') && (
            <div className="form-group full-width">
              <label>How many kg do you want to {goal === 'gain' ? 'gain' : 'lose'}?</label>
              <input
                type="number"
                value={goalWeight}
                onChange={(e) => setGoalWeight(e.target.value)}
                placeholder="e.g., 2"
                min="1"
                max="50"
              />
              <small className="helper-text">
                Recommended: 0.5-1kg per week for healthy weight change
              </small>
            </div>
          )}
        </div>

        <button className="calculate-btn" onClick={handleCalculate}>
          Calculate Daily Calories
        </button>
      </div>

      {showResults && (
        <div className="results-section">
          <h3>Your Daily Calorie Needs</h3>
          <div className="results-card">
            <div className="calorie-block maintenance">
              <h4>Maintenance</h4>
              <p>{calories} kcal/day</p>
            </div>

            {goal === 'loss' && adjustedCalories && (
              <div className="calorie-block loss">
                <h4>To Lose {goalWeight} kg</h4>
                <p>{adjustedCalories} kcal/day</p>
                <small className="time-estimate">
                  Estimated time: {Math.ceil(parseFloat(goalWeight) / 0.5)} weeks
                </small>
              </div>
            )}

            {goal === 'gain' && adjustedCalories && (
              <div className="calorie-block gain">
                <h4>To Gain {goalWeight} kg</h4>
                <p>{adjustedCalories} kcal/day</p>
                <small className="time-estimate">
                  Estimated time: {Math.ceil(parseFloat(goalWeight) / 0.5)} weeks
                </small>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Calculator;