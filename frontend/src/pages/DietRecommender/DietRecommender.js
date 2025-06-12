import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './DietRecommender.css';
import { FaClock, FaUtensils, FaPlus } from 'react-icons/fa'


const DietRecommender = () => {
    const { token } = useAuth();
    const [recommendations, setRecommendations] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [maintenanceCalories, setMaintenanceCalories] = useState('');
    const [preferences, setPreferences] = useState([]);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [notification, setNotification] = useState({
        show: false,
        message: '',
        type: '' // 'success', 'error', or 'info'
    });

    useEffect(() => {
        const handleSidebarChange = () => {
            setSidebarCollapsed(document.body.classList.contains('sidebar-collapsed'));
        };

        // Initial check
        handleSidebarChange();

        // Create a MutationObserver to watch for class changes on body
        const observer = new MutationObserver(handleSidebarChange);
        observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

        return () => observer.disconnect();
    }, []);
    
    const dietaryOptions = [
        { value: 'vegetarian', label: 'Vegetarian' },
        { value: 'vegan', label: 'Vegan' },
        { value: 'gluten-free', label: 'Gluten Free' },
        { value: 'dairy-free', label: 'Dairy Free' },
        { value: 'low-carb', label: 'Low Carb' },
        { value: 'high-protein', label: 'High Protein' }
    ];

    const handlePreferenceChange = (value) => {
        if (preferences.includes(value)) {
            setPreferences(preferences.filter(p => p !== value));
        } else {
            setPreferences([...preferences, value]);
        }
    };

    const fetchRecommendations = async () => {
        try {
            setLoading(true);
            setError(null);            
            const response = await axios.get(`/api/diet-recommender/recommendations`, {
                baseURL: 'http://localhost:5000',
                params: {
                    maintenanceCalories,
                    dietaryPreferences: preferences
                }
            });            
            if (response.data && response.data.success) {
                setRecommendations(response.data.data);
            } else {
                throw new Error(response.data?.message || 'Failed to fetch recommendations');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Error fetching recommendations');
            console.error('API Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const addFoodToMealPlan = async (food, mealType) => {
        try {
            // Debug logs
            console.log('Adding food to meal plan:', { food, mealType });
            
            const payload = {
                foodId: food._id,
                mealType: mealType.toLowerCase(), // breakfast, lunch, dinner, snacks
                servingSize: food.servingSize || 100,
                servingUnit: food.servingUnit || 'g',
                date: new Date().toISOString().split('T')[0] // Today's date
            };
            
            console.log('Sending payload:', payload);
            
            const response = await axios.post(
                'http://localhost:5000/api/meals',
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            
            console.log('Server response:', response.data);
            
            toast.success(`Added ${food.name} to your ${mealType}`);
        } catch (error) {
            console.error('Error adding food to meal plan:', error);
            const errorMessage = error.response?.data?.message || 'Failed to add food to meal plan';
            toast.error(errorMessage);
        }
    };

    const showNotification = (message, type) => {
        setNotification({
            show: true,
            message,
            type
        });
        
        // Auto-hide the notification after 3 seconds
        setTimeout(() => {
            setNotification({
                show: false,
                message: '',
                type: ''
            });
        }, 3000);
    };

    const handleAddToMealPlan = async (food) => {
        try {
            // First check if food already exists in meal plan
            const checkResponse = await axios.get('http://localhost:5000/api/meal-plan', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            const existingMeals = checkResponse.data;
            const foodExists = existingMeals.some(meal => meal.foodId === food._id);
            
            if (foodExists) {
                // Show notification if food already exists
                showNotification(`${food.name} is already in your meal plan!`, 'info');
                return;
            }
            
            // Add food to meal plan if not already there
            await axios.post('http://localhost:5000/api/meal-plan', {
                foodId: food._id,
                portionSize: 100,
                mealType: 'lunch' // Default meal type
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            // Success notification
            showNotification(`Added ${food.name} to your meal plan!`, 'success');
            
        } catch (err) {
            console.error('Error adding to meal plan:', err);
            showNotification('Failed to add to meal plan', 'error');
        }
    };

    const getMealTime = (mealType) => {
        switch(mealType) {
            case 'breakfast':
                return '7:00 - 8:30';
            case 'lunch':
                return '12:00 - 13:30';
            case 'dinner':
                return '18:30 - 20:00';
            case 'snacks':
                return '10:00 or 15:00';
            default:
                return '';
        }
    };

    const renderCaloriesDistribution = () => {
        if (!recommendations) return null;
        const { mealCalories } = recommendations;
        const total = Object.values(mealCalories).reduce((sum, cal) => sum + cal, 0);

        return (
            <div className="calories-distribution">
                <h3>Calories Distribution</h3>
                <div className="calories-bars">
                    {Object.entries(mealCalories).map(([meal, calories]) => (
                        <div key={meal} className="calories-bar-container">
                            <div className="meal-label">
                                <span>{meal.charAt(0).toUpperCase() + meal.slice(1)}</span>
                                <span>{Math.round((calories/total) * 100)}%</span>
                            </div>
                            <div className="calories-bar">
                                <div 
                                    className="calories-fill"
                                    style={{width: `${(calories/total) * 100}%`}}
                                >
                                    {calories} kcal
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };    const renderFoodCard = (food, mealType) => (
        <div className="food-card" key={food._id}>
          <div className="food-content">
            <div className="food-header">
              <h3>{food.name}</h3>
              {food.image ? (
                <div className="food-image-thumbnail">
                  <img 
                    src={food.image.startsWith('http') ? food.image : `http://localhost:5000${food.image}`} 
                    alt={food.name} 
                  />
                </div>
              ) : null}
            </div>
            
            <p className="food-description">{food.description}</p>
            
            <div className="macro-info">
              <div className="macro">
                <span className="macro-value">{Math.round(food.nutritionPer100g?.calories || 0)}</span>
                <span className="macro-label">K</span>
              </div>
              <div className="macro">
                <span className="macro-value">{Math.round(food.nutritionPer100g?.protein || 0)}</span>
                <span className="macro-label">P</span> {/* Changed from PROTEIN */}
              </div>
              <div className="macro">
                <span className="macro-value">{Math.round(food.nutritionPer100g?.carbs || 0)}</span>
                <span className="macro-label">C</span> {/* Changed from CARBS */}
              </div>
              <div className="macro">
                <span className="macro-value">{Math.round(food.nutritionPer100g?.fat || 0)}</span>
                <span className="macro-label">F</span> {/* Changed from FAT */}
              </div>
            </div>
            
            <div className="preparation-info">
              <span className="prep-time">
                <FaClock /> {food.preparationTime || '0'} mins
              </span>
              <span className="serving">
                <FaUtensils /> {food.servingSize}{food.servingUnit}
              </span>
            </div>
            
            <button 
              className="add-to-meal-plan-btn"
              onClick={() => addFoodToMealPlan(food, mealType)}
            >
              <FaPlus /> Add to Meal Plan
            </button>
          </div>
        </div>
      );

    return (
        <div className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
            <div className="diet-recommender">
                <h2>Diet Recommendations</h2>
            </div>
            <div className="input-section">
                <div className="calories-input">
                    <label>
                        Maintenance Calories:
                        <input
                            type="number"
                            value={maintenanceCalories}
                            onChange={(e) => setMaintenanceCalories(e.target.value)}
                            placeholder="Enter your maintenance calories"
                        />
                    </label>
                </div>

                <div className="preferences">
                    <h3>Dietary Preferences</h3>
                    <div className="preference-options">
                        {dietaryOptions.map(option => (
                            <label key={option.value} className="preference-checkbox">
                                <input
                                    type="checkbox"
                                    checked={preferences.includes(option.value)}
                                    onChange={() => handlePreferenceChange(option.value)}
                                />
                                {option.label}
                            </label>
                        ))}
                    </div>
                </div>

                <button 
                    onClick={fetchRecommendations}
                    disabled={!maintenanceCalories || loading}
                    className="get-recommendations-btn"
                >
                    {loading ? 'Loading...' : 'Get Recommendations'}
                </button>
            </div>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}            {recommendations && (
                <div className="recommendations-container">
                    <h2 className="plan-title">Daily Meal Plan ({maintenanceCalories} kcal)</h2>                    <div className="meal-list">
                        <div className="meal-section">
                            <div className="meal-header">
                                <div>
                                    <h3>🍳 Breakfast</h3>
                                    <span className="meal-time">7:00 - 8:30</span>
                                </div>
                                <div className="total-calories">🔥 Total: {recommendations.mealCalories.breakfast} kcal</div>
                            </div>
                            <div className="food-grid">
                                {recommendations.recommendations.breakfast?.map((food, index) => (
                                    renderFoodCard(food, 'breakfast')
                                ))}
                            </div>
                        </div>

                        <div className="meal-section">
                            <div className="meal-header">
                                <div>
                                    <h3>🍲 Lunch</h3>
                                    <span className="meal-time">12:00 - 13:30</span>
                                </div>
                                <div className="total-calories">🔥 Total: {recommendations.mealCalories.lunch} kcal</div>
                            </div>
                            <div className="food-grid">
                                {recommendations.recommendations.lunch?.map((food, index) => (
                                    renderFoodCard(food, 'lunch')
                                ))}
                            </div>
                        </div>

                        <div className="meal-section">
                            <div className="meal-header">
                                <div>
                                    <h3>🍽️ Dinner</h3>
                                    <span className="meal-time">18:30 - 20:00</span>
                                </div>
                                <div className="total-calories">🔥 Total: {recommendations.mealCalories.dinner} kcal</div>
                            </div>
                            <div className="food-grid">
                                {recommendations.recommendations.dinner?.map((food, index) => (
                                    renderFoodCard(food, 'dinner')
                                ))}
                            </div>
                        </div>

                        <div className="meal-section">
                            <div className="meal-header">
                                <div>
                                    <h3>🥨 Snacks</h3>
                                    <span className="meal-time">10:00 or 15:00</span>
                                </div>
                                <div className="total-calories">🔥 Total: {recommendations.mealCalories.snacks} kcal</div>
                            </div>
                            <div className="food-grid">
                                {recommendations.recommendations.snacks?.map((food, index) => (
                                    renderFoodCard(food, 'snacks')
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DietRecommender;
