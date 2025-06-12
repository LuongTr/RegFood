import React, { useState, useEffect } from 'react';
import "./Dashboard.css";
import { 
  FaUtensils, FaFire, FaWeight, FaTint, 
  FaChartLine, FaArrowUp, FaArrowDown,
  FaAppleAlt, FaCheck, FaRunning, FaBookMedical
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Bar, Doughnut } from 'react-chartjs-2';
import 'chart.js/auto';

const Dashboard = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [userData, setUserData] = useState(null);
  const [todaysMeals, setTodaysMeals] = useState([]);
  const [nutritionStats, setNutritionStats] = useState({
    calories: { current: 0, goal: 2000 },
    protein: { current: 0, goal: 120 },
    carbs: { current: 0, goal: 250 },
    fat: { current: 0, goal: 65 }
  });
  const [recentWeight, setRecentWeight] = useState({ value: 0, trend: 'stable' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch user data, today's meals, and other stats
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch user profile
        const userResponse = await axios.get('http://localhost:5000/api/users/profile', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setUserData(userResponse.data);
        
        // Set weight data - add null checks
        const weightValue = userResponse.data?.weight || 70;
        setRecentWeight({
          value: weightValue,
          trend: 'stable' // You can compare with previous weight to determine trend
        });
        
        // Fetch today's meals - ensure proper error handling and null checks
        try {
          const today = new Date().toISOString().split('T')[0];
          const mealsResponse = await axios.get(
            `http://localhost:5000/api/meals?date=${today}`,
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );
          
          // Process meals data with null checks
          if (mealsResponse?.data?.data) {
            const meals = mealsResponse.data.data;
            setTodaysMeals(meals || []); // Ensure it's always an array
            
            // Calculate nutrition totals
            let totalCalories = 0;
            let totalProtein = 0;
            let totalCarbs = 0;
            let totalFat = 0;
            
            meals.forEach(meal => {
              // Add null checks
              if (meal?.food?.nutritionPer100g) {
                const servingRatio = (meal.servingSize || 100) / 100;
                totalCalories += (meal.food.nutritionPer100g.calories || 0) * servingRatio;
                totalProtein += (meal.food.nutritionPer100g.protein || 0) * servingRatio;
                totalCarbs += (meal.food.nutritionPer100g.carbs || 0) * servingRatio;
                totalFat += (meal.food.nutritionPer100g.fat || 0) * servingRatio;
              }
            });
            
            setNutritionStats({
              calories: { current: Math.round(totalCalories), goal: 2000 },
              protein: { current: Math.round(totalProtein), goal: 120 },
              carbs: { current: Math.round(totalCarbs), goal: 250 },
              fat: { current: Math.round(totalFat), goal: 65 }
            });
          } else {
            // Set default empty values if no data
            setTodaysMeals([]);
          }
        } catch (mealError) {
          console.error('Error fetching meals:', mealError);
          setTodaysMeals([]); // Set empty array on error
        }
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Set default values on error
        setUserData(null);
        setTodaysMeals([]);
      } finally {
        setLoading(false);
      }
    };
    
    if (token) {
      fetchDashboardData();
    }
  }, [token]);

  // Chart data
  const macroData = {
    labels: ['Protein', 'Carbs', 'Fat'],
    datasets: [
      {
        label: 'Macronutrients',
        data: [nutritionStats.protein.current, nutritionStats.carbs.current, nutritionStats.fat.current],
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
        hoverBackgroundColor: ['#FF5371', '#3096DE', '#FFB340'],
        borderWidth: 0,
      }
    ]
  };
  
  const weeklyCaloriesData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Calories',
        data: [1800, 2100, 1950, 2300, 2000, 1900, nutritionStats.calories.current],
        backgroundColor: '#6c63ff',
      }
    ]
  };
  
  // Navigation handlers
  const handleNavigate = (path) => {
    navigate(path);
  };
  
  // Calculate percentage of goal reached
  const calculatePercentage = (current, goal) => {
    return Math.min(Math.round((current / goal) * 100), 100);
  };

  // Helper function to format time
  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Group meals by type
  const getMealsByType = () => {
    const mealGroups = {
      breakfast: [],
      lunch: [],
      dinner: [],
      snack: []
    };
    
    // Add null check before forEach
    if (Array.isArray(todaysMeals)) {
      todaysMeals.forEach(meal => {
        if (meal?.mealType && meal?.food) {
          // Ensure the array exists before pushing
          if (!mealGroups[meal.mealType]) {
            mealGroups[meal.mealType] = [];
          }
          mealGroups[meal.mealType].push(meal);
        }
      });
    }
    
    return mealGroups;
  };
  
  const mealGroups = getMealsByType();

  return (
    <div className="page-container">
      <div className="dashboard-container">
        {loading ? (
          <div className="loading-spinner">Loading dashboard data...</div>
        ) : (
          <>
            {/* Welcome Section */}
            <div className="welcome-section">
              <div className="welcome-text">
                <h1>Welcome back, {userData?.name || 'User'}!</h1>
                <p className="date-today">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
              <div className="quick-actions">
                <button 
                  className="action-button primary"
                  onClick={() => handleNavigate('/nutrition-tracking')}
                >
                  <FaUtensils className="action-icon" />
                  Track Meal
                </button>
                <button 
                  className="action-button secondary"
                  onClick={() => handleNavigate('/diet-recommender')}
                >
                  <FaAppleAlt className="action-icon" />
                  Get Recommendations
                </button>
              </div>
            </div>
            
            {/* Stats Cards */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon calories">
                  <FaFire />
                </div>
                <div className="stat-info">
                  <h3>Today's Calories</h3>
                  <p className="stat-value">{nutritionStats.calories.current}</p>
                  <p className="stat-goal">Goal: {nutritionStats.calories.goal} kcal</p>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{
                        width: `${calculatePercentage(nutritionStats.calories.current, nutritionStats.calories.goal)}%`,
                        backgroundColor: '#FF6384'
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon weight">
                  <FaWeight />
                </div>
                <div className="stat-info">
                  <h3>Current Weight</h3>
                  <div className="weight-display">
                    <p className="stat-value">{recentWeight.value} kg</p>
                    <span className={`weight-trend ${recentWeight.trend}`}>
                      {recentWeight.trend === 'up' && <FaArrowUp />}
                      {recentWeight.trend === 'down' && <FaArrowDown />}
                      {recentWeight.trend === 'stable' && <FaChartLine />}
                    </span>
                  </div>
                  <p className="stat-goal">Last updated: Today</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon water">
                  <FaTint />
                </div>
                <div className="stat-info">
                  <h3>Water Intake</h3>
                  <p className="stat-value">1.2 L</p>
                  <p className="stat-goal">Goal: 2.5 L</p>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{
                        width: '48%',
                        backgroundColor: '#36A2EB'
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Dashboard Grid Layout */}
            <div className="dashboard-grid">
              {/* Today's Meals Section */}
              <div className="dashboard-section todays-meals">
                <div className="section-header">
                  <h2>Today's Meals</h2>
                  <button 
                    className="view-all-button"
                    onClick={() => handleNavigate('/nutrition-tracking')}
                  >
                    View All
                  </button>
                </div>
                
                <div className="meal-timeline">
                  {Object.entries(mealGroups)
                    // Filter out meal types with no meals
                    .filter(([_, meals]) => meals.length > 0)
                    .map(([type, meals]) => (
                      <div key={type} className="meal-group">
                        <div className="meal-type-header">
                          <h3 className="meal-type">{type.charAt(0).toUpperCase() + type.slice(1)}</h3>
                          <span className="meal-calories">
                            {meals.reduce((sum, meal) => {
                              const calories = meal.food?.nutritionPer100g?.calories || 0;
                              const servingRatio = meal.servingSize / 100;
                              return sum + (calories * servingRatio);
                            }, 0).toFixed(0)} kcal
                          </span>
                        </div>
                        
                        <div className="meal-items">
                          {meals.map((meal, index) => (
                            <div key={index} className="meal-item">
                              {meal.food?.image ? (
                                <img 
                                  src={`http://localhost:5000${meal.food.image}`} 
                                  alt={meal.food.name} 
                                  className="meal-image"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = 'https://via.placeholder.com/50';
                                  }}
                                />
                              ) : (
                                <div className="meal-image-placeholder">
                                  <FaUtensils />
                                </div>
                              )}
                              <div className="meal-details">
                                <p className="meal-name">{meal.food?.name}</p>
                                <p className="meal-serving">{meal.servingSize}g</p>
                              </div>
                              <div className="meal-nutrition">
                                <p className="meal-item-calories">
                                  {Math.round((meal.food?.nutritionPer100g?.calories || 0) * meal.servingSize / 100)} kcal
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
      
                  {/* Show "Add Meal" button when no meals are present */}
                  {Object.values(mealGroups).every(meals => meals.length === 0) && (
                    <div className="no-meals">
                      <p>No meals logged yet</p>
                      <button 
                        className="add-meal-button"
                        onClick={() => handleNavigate('/foods')}
                      >
                        Add Food
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Nutrition Insights Section */}
              <div className="dashboard-section nutrition-insights">
                <div className="section-header">
                  <h2>Nutrition Insights</h2>
                </div>
                
                <div className="nutrition-charts">
                  <div className="chart-container">
                    <h3>Macronutrient Breakdown</h3>
                    <div className="donut-chart">
                      <Doughnut 
                        data={macroData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'bottom',
                              align: 'center',
                              labels: {
                                boxWidth: 12,
                                padding: 15
                              }
                            },
                            tooltip: {
                              callbacks: {
                                label: function(context) {
                                  const label = context.label || '';
                                  const value = context.raw || 0;
                                  const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                                  const percentage = Math.round((value / total) * 100);
                                  return `${label}: ${value}g (${percentage}%)`;
                                }
                              }
                            }
                          },
                          cutout: '70%',
                        }}
                      />
                    </div>
                    
                    <div className="macro-stats">
                      <div className="macro-stat protein">
                        <span className="macro-label">Protein</span>
                        <span className="macro-value">{nutritionStats.protein.current}g</span>
                        <div className="macro-progress">
                          <div 
                            className="macro-progress-fill"
                            style={{width: `${calculatePercentage(nutritionStats.protein.current, nutritionStats.protein.goal)}%`}}
                          ></div>
                        </div>
                      </div>
                      <div className="macro-stat carbs">
                        <span className="macro-label">Carbs</span>
                        <span className="macro-value">{nutritionStats.carbs.current}g</span>
                        <div className="macro-progress">
                          <div 
                            className="macro-progress-fill"
                            style={{width: `${calculatePercentage(nutritionStats.carbs.current, nutritionStats.carbs.goal)}%`}}
                          ></div>
                        </div>
                      </div>
                      <div className="macro-stat fat">
                        <span className="macro-label">Fat</span>
                        <span className="macro-value">{nutritionStats.fat.current}g</span>
                        <div className="macro-progress">
                          <div 
                            className="macro-progress-fill"
                            style={{width: `${calculatePercentage(nutritionStats.fat.current, nutritionStats.fat.goal)}%`}}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Weekly Stats Section */}
              <div className="dashboard-section weekly-stats">
                <div className="section-header">
                  <h2>Weekly Calorie Intake</h2>
                </div>
                <div className="bar-chart-container">
                  <Bar 
                    data={weeklyCaloriesData} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true
                        }
                      },
                      plugins: {
                        legend: {
                          display: false
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;