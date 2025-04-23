import React, { useState } from 'react';
import "./NutritionTracking.css";
import { FaFire, FaUtensils, FaLeaf, FaTint, FaPlus, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const NutritionTracking = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [activeTab, setActiveTab] = useState('Meals');
  const [waterAmount, setWaterAmount] = useState(1.2);
  const [waterInput, setWaterInput] = useState(250);
  
  const stats = {
    calories: { current: 1486, goal: 2000, icon: <FaFire />, color: "#ff7043" },
    protein: { current: 86, goal: 120, unit: "g", icon: <FaUtensils />, color: "#ec407a" },
    carbs: { current: 164, goal: 250, unit: "g", icon: <FaLeaf />, color: "#66bb6a" },
    water: { current: 1.2, goal: 2.5, unit: "L", icon: <FaTint />, color: "#42a5f5" }
  };

  const meals = [
    {
      type: "Breakfast",
      time: "8:30 AM",
      calories: 470,
      foods: [
        {
          name: "Oatmeal with Berries",
          calories: "320 kcal",
          protein: "12g protein",
          carbs: "58g carbs",
          fat: "6g fat"
        },
        {
          name: "Greek Yogurt",
          calories: "150 kcal",
          protein: "15g protein",
          carbs: "8g carbs",
          fat: "5g fat"
        }
      ]
    }
  ];

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
            <span className="meal-calories">{meal.calories} calories</span>
          </div>
          
          <div className="food-items">
            {meal.foods.map((food, foodIndex) => (
              <div key={foodIndex} className="food-item">
                <div className="food-name">{food.name}</div>
                <div className="food-nutrients">
                  <span className="nutrient calories">{food.calories}</span>
                  <span className="nutrient protein">{food.protein}</span>
                  <span className="nutrient carbs">{food.carbs}</span>
                  <span className="nutrient fat">{food.fat}</span>
                </div>
              </div>
            ))}
            <button className="add-food-to-meal">
              <FaPlus /> Add Food
            </button>
          </div>
        </div>
      ))}
      <button className="add-meal-btn">
        <FaPlus /> Add Meal
      </button>
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
          <h1>Nutrition Tracker</h1>
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