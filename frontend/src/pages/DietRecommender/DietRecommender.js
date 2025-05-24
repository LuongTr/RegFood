import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DietRecommender.css';

const DietRecommender = () => {
    const [recommendations, setRecommendations] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [maintenanceCalories, setMaintenanceCalories] = useState('');
    const [preferences, setPreferences] = useState([]);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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
            setError(null);            const response = await axios.get(`/api/diet-recommender/recommendations`, {
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
    };

    const renderMealCard = (food) => (
        <div className="food-card">
            <div className="food-content">
                <div className="food-main">
                    <h4 className="food-name">{food.name}</h4>
                    <div className="macros">
                        <span className="macro protein">P: {food.nutritionPer100g?.protein || 0}g</span>
                        <span className="macro carbs">C: {food.nutritionPer100g?.carbs || 0}g</span>
                        <span className="macro fat">F: {food.nutritionPer100g?.fat || 0}g</span>
                    </div>
                </div>
                <div className="food-details">
                    <span className="calories">{food.nutritionPer100g?.calories || 0} kcal</span>
                    <span className="prep-time">⏱ {food.preparationTime || 30} mins</span>
                </div>
                <p className="description">{food.description}</p>
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
                    <h2 className="plan-title">Daily Meal Plan ({maintenanceCalories} kcal)</h2>
                    <div className="meal-list">
                        <div className="meal-section">
                            <div className="meal-header">
                                <div>
                                    <h3>Breakfast</h3>
                                    <span className="meal-time">7:00 - 8:30</span>
                                </div>
                                <div className="total-calories">Total: {recommendations.mealCalories.breakfast} kcal</div>
                            </div>
                            <div className="food-grid">
                                {recommendations.recommendations.breakfast?.map((food, index) => (
                                    renderMealCard(food)
                                ))}
                            </div>
                        </div>

                        <div className="meal-section">
                            <div className="meal-header">
                                <div>
                                    <h3>Lunch</h3>
                                    <span className="meal-time">12:00 - 13:30</span>
                                </div>
                                <div className="total-calories">Total: {recommendations.mealCalories.lunch} kcal</div>
                            </div>
                            <div className="food-grid">
                                {recommendations.recommendations.lunch?.map((food, index) => (
                                    renderMealCard(food)
                                ))}
                            </div>
                        </div>

                        <div className="meal-section">
                            <div className="meal-header">
                                <div>
                                    <h3>Dinner</h3>
                                    <span className="meal-time">18:30 - 20:00</span>
                                </div>
                                <div className="total-calories">Total: {recommendations.mealCalories.dinner} kcal</div>
                            </div>
                            <div className="food-grid">
                                {recommendations.recommendations.dinner?.map((food, index) => (
                                    renderMealCard(food)
                                ))}
                            </div>
                        </div>

                        <div className="meal-section">
                            <div className="meal-header">
                                <div>
                                    <h3>Snacks</h3>
                                    <span className="meal-time">10:00 or 15:00</span>
                                </div>
                                <div className="total-calories">Total: {recommendations.mealCalories.snacks} kcal</div>
                            </div>
                            <div className="food-grid">
                                {recommendations.recommendations.snacks?.map((food, index) => (
                                    renderMealCard(food)
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
