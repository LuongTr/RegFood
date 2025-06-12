import React, { useState, useEffect } from 'react';
import "./NutritionTracking.css";
import { FaFire, FaUtensils, FaLeaf, FaTint, FaPlus, FaChevronLeft, FaChevronRight, FaTrash } from 'react-icons/fa';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const NutritionTracking = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [activeTab, setActiveTab] = useState('Meals');
  const [waterAmount, setWaterAmount] = useState(1.2);
  const [waterInput, setWaterInput] = useState(250);
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    calories: { current: 0, goal: 2000, icon: <FaFire />, color: "#ff7043" },
    protein: { current: 0, goal: 120, unit: "g", icon: <FaUtensils />, color: "#ec407a" },
    carbs: { current: 0, goal: 250, unit: "g", icon: <FaLeaf />, color: "#66bb6a" },
    water: { current: 1.2, goal: 2.5, unit: "L", icon: <FaTint />, color: "#42a5f5" }
  });
  
  const { token } = useAuth();
  
  // Fetch meals for the selected date
  useEffect(() => {
    const fetchMeals = async () => {
      try {
        setLoading(true);
        const formattedDate = selectedDate.toISOString().split('T')[0];
        
        const response = await axios.get(
          `http://localhost:5000/api/meals?date=${formattedDate}`, 
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        
        // Add validation to ensure data exists
        if (!response.data || !response.data.data || !Array.isArray(response.data.data)) {
          console.error('Invalid meal data format:', response.data);
          setMeals([
            { type: "Breakfast", time: "8:30 AM", foods: [] },
            { type: "Lunch", time: "12:30 PM", foods: [] },
            { type: "Dinner", time: "7:00 PM", foods: [] },
            { type: "Snacks", time: "3:30 PM", foods: [] }
          ]);
          setLoading(false);
          return;
        }
        
        // Group meals by mealType
        const mealsByType = {
          breakfast: [],
          lunch: [],
          dinner: [],
          snacks: []
        };
        
        response.data.data.forEach(meal => {
          if (meal.food) { // Make sure the food object exists
            mealsByType[meal.mealType].push({
              id: meal._id,
              name: meal.food.name,
              servingSize: meal.servingSize,
              servingUnit: meal.servingUnit,
              calories: calculateNutrition(meal.food.nutritionPer100g.calories, meal.servingSize),
              protein: calculateNutrition(meal.food.nutritionPer100g.protein, meal.servingSize),
              carbs: calculateNutrition(meal.food.nutritionPer100g.carbs, meal.servingSize),
              fat: calculateNutrition(meal.food.nutritionPer100g.fat, meal.servingSize),
            });
          }
        });
        
        // Convert to array of meal objects
        const formattedMeals = [
          { type: "Breakfast", time: "8:30 AM", foods: mealsByType.breakfast },
          { type: "Lunch", time: "12:30 PM", foods: mealsByType.lunch },
          { type: "Dinner", time: "7:00 PM", foods: mealsByType.dinner },
          { type: "Snacks", time: "3:30 PM", foods: mealsByType.snacks }
        ];
        
        // Calculate total nutrition
        let totalCalories = 0;
        let totalProtein = 0;
        let totalCarbs = 0;
        
        formattedMeals.forEach(meal => {
          meal.foods.forEach(food => {
            totalCalories += food.calories;
            totalProtein += food.protein;
            totalCarbs += food.carbs;
          });
        });
        
        // Update stats
        setStats(prev => ({
          ...prev,
          calories: { ...prev.calories, current: Math.round(totalCalories) },
          protein: { ...prev.protein, current: Math.round(totalProtein) },
          carbs: { ...prev.carbs, current: Math.round(totalCarbs) }
        }));
        
        setMeals(formattedMeals);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching meals:', error);
        setLoading(false);
        toast.error('Failed to fetch meals');
      }
    };
    
    if (token) {
      fetchMeals();
    }
  }, [selectedDate, token]);
  
  // Helper function to calculate nutrition based on serving size
  const calculateNutrition = (nutritionPer100g, servingSize) => {
    return (nutritionPer100g / 100) * servingSize;
  };
  
  // Function to calculate total calories for a meal
  const calculateMealCalories = (foods) => {
    return foods.reduce((total, food) => total + food.calories, 0);
  };
  
  const handleDeleteFood = async (mealId) => {
    try {
      await axios.delete(
        `http://localhost:5000/api/meals/${mealId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Instead of refetching, update the state directly
      setMeals(prevMeals => 
        prevMeals.map(meal => ({
          ...meal,
          foods: meal.foods.filter(food => food.id !== mealId)
        }))
      );
      
      // Find and subtract the removed food's nutrition from stats
      const removedFood = meals
        .flatMap(meal => meal.foods)
        .find(food => food.id === mealId);
        
      if (removedFood) {
        setStats(prev => ({
          ...prev,
          calories: { 
            ...prev.calories, 
            current: Math.max(0, prev.calories.current - Math.round(removedFood.calories)) 
          },
          protein: { 
            ...prev.protein, 
            current: Math.max(0, prev.protein.current - Math.round(removedFood.protein)) 
          },
          carbs: { 
            ...prev.carbs, 
            current: Math.max(0, prev.carbs.current - Math.round(removedFood.carbs)) 
          }
        }));
      }
      
      toast.success('Food removed from meal plan');
    } catch (error) {
      console.error('Error removing food:', error);
      toast.error('Failed to remove food from meal plan');
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const calculateProgress = (current, goal) => {
    return (current / goal) * 100;
  };

  const handlePrevMonth = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1));
  };

  const generateCalendarDays = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day"></div>);
    }

    // Add the days of the month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(year, month, i);
      days.push(
        <div
          key={i}
          className={`calendar-day ${date.toDateString() === selectedDate.toDateString() ? 'selected' : ''}`}
          onClick={() => {
            setSelectedDate(date);
            setShowCalendar(false);
          }}
        >
          {i}
        </div>
      );
    }

    return days;
  };

  const handleAddWater = () => {
    const newAmount = Math.min(waterAmount + (waterInput / 1000), 2.5);
    setWaterAmount(newAmount);
    
    // Update the water stats
    setStats(prev => ({
      ...prev,
      water: { ...prev.water, current: newAmount }
    }));
  };

  const renderMealsTab = () => (
    <div className="meals-section">
      {meals.map((meal, index) => (
        <div key={index} className="meal-card">
          <div className="meal-header">
            <div>
              <h3 className="meal-title">{meal.type}</h3>
              <span className="meal-time">{meal.time}</span>
            </div>
            <span className="meal-calories">{calculateMealCalories(meal.foods)} calories</span>
          </div>
          
          <div className="food-items">
            {meal.foods.length > 0 ? (
              meal.foods.map((food, foodIndex) => (
                <div key={foodIndex} className="food-item">
                  <div className="food-name">{food.name}</div>
                  <div className="food-nutrients">
                    <span className="nutrient calories">{Math.round(food.calories)} kcal</span>
                    <span className="nutrient protein">{Math.round(food.protein)}g protein</span>
                    <span className="nutrient carbs">{Math.round(food.carbs)}g carbs</span>
                    <span className="nutrient fat">{Math.round(food.fat)}g fat</span>
                    <button 
                      className="delete-food-btn" 
                      onClick={() => handleDeleteFood(food.id)}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-foods">No foods added for {meal.type.toLowerCase()} yet.</div>
            )}
            <button className="add-food-to-meal">
              <FaPlus /> Add Food
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  const renderWaterTab = () => (
    <div className="water-tracking">
      <h2>Water Intake</h2>
      <p>Track your daily water consumption</p>
      
      <div className="water-visual">
        <div className="water-circle">
          <div 
            className="water-fill" 
            style={{ height: `${(waterAmount / 2.5) * 100}%` }}
          />
        </div>
        <span className="water-amount">{waterAmount}L</span>
      </div>

      <div className="water-controls">
        <input
          type="number"
          className="water-input"
          value={waterInput}
          onChange={(e) => setWaterInput(Number(e.target.value))}
          min="0"
          max="1000"
          step="50"
        />
        <span>ml</span>
        <button className="add-water-btn" onClick={handleAddWater}>
          Add Water
        </button>
      </div>
    </div>
  );

  return (
    <div className="page-container">
      <div className="nutrition-container">
        <div className="nutrition-header">
          <h1>Meal Plan</h1>
          <p>Track your daily nutrition intake and monitor your progress</p>
          
          <div className="header-controls">
            <div className="date-picker">
              <button onClick={() => setShowCalendar(!showCalendar)}>
                {formatDate(selectedDate)}
              </button>
              
              {showCalendar && (
                <div className="calendar-popup">
                  <div className="calendar-header">
                    <button onClick={handlePrevMonth}><FaChevronLeft /></button>
                    <span>
                      {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </span>
                    <button onClick={handleNextMonth}><FaChevronRight /></button>
                  </div>
                  <div className="calendar-grid">
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                      <div key={day} className="calendar-day">{day}</div>
                    ))}
                    {generateCalendarDays()}
                  </div>
                </div>
              )}
            </div>
            
            <div className="search-box">
              <input type="text" placeholder="Search foods..." />
            </div>
            
            <button className="add-food-btn">
              <FaPlus /> Add Food
            </button>
          </div>
        </div>

        <div className="nutrition-stats">
          {Object.entries(stats).map(([key, data]) => (
            <div key={key} className="stat-card">
              <div className="stat-title">
                <span className="stat-icon" style={{ color: data.color }}>
                  {data.icon}
                </span>
                <span>{key.charAt(0).toUpperCase() + key.slice(1)}</span>
              </div>
              <div>
                <h2 className="stat-value">
                  {data.current}{data.unit}
                </h2>
                <p className="stat-goal">
                  of {data.goal}{data.unit} daily goal
                </p>
              </div>
              <div className="progress-bar">
                <div 
                  className={`progress-fill ${key}`}
                  style={{ width: `${calculateProgress(data.current, data.goal)}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="content-tabs">
          <button 
            className={`tab-btn ${activeTab === 'Meals' ? 'active' : ''}`}
            onClick={() => setActiveTab('Meals')}
          >
            Meals
          </button>
          <button 
            className={`tab-btn ${activeTab === 'Nutrients' ? 'active' : ''}`}
            onClick={() => setActiveTab('Nutrients')}
          >
            Nutrients
          </button>
          <button 
            className={`tab-btn ${activeTab === 'Water' ? 'active' : ''}`}
            onClick={() => setActiveTab('Water')}
          >
            Water
          </button>
        </div>

        {activeTab === 'Meals' && renderMealsTab()}
        {activeTab === 'Water' && renderWaterTab()}
      </div>
    </div>
  );
};

export default NutritionTracking;