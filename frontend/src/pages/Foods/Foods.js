import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Foods.css';

// Helper function to handle image URLs
const getImageUrl = (image) => {
    if (!image) return null;

    // If it's already a full URL (starts with http or https), return as is
    if (image.startsWith('http')) {
        return image;
    }

    // Create a clean path by removing any double slashes
    const cleanPath = image.startsWith('/') ? image : `/${image}`;
    const fullUrl = `http://localhost:5000${cleanPath}`;
    
    return fullUrl;
};

const Foods = () => {
    const [foods, setFoods] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [newFood, setNewFood] = useState({
        name: '',
        category: 'Snacks', // Default category
        nutrition: {
            calories: '',
            protein: '',
            carbs: '',
            fat: '',
            fiber: '0'
        },
        dietaryPreferences: [], // Array to store dietary preferences
        mealType: [], // Array to store meal types
        servingSize: '100',
        servingUnit: 'g',
        description: '',
        preparationTime: '0',
        image: ''
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

        // Fetch foods when component mounts
        fetchFoods();

        return () => observer.disconnect();
    }, []);    const fetchFoods = async () => {
        try {
            console.log('Start fetching foods...');
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('token');            const response = await axios.get('/api/foods/', {
                baseURL: 'http://localhost:5000',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.data && response.data.success) {
                console.log('Foods data received:', response.data.data);
                if (Array.isArray(response.data.data)) {
                    setFoods(response.data.data);
                } else {
                    throw new Error('Invalid data format received');
                }
            } else {
                throw new Error(response.data?.message || 'Failed to fetch foods');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Error fetching foods');
            console.error('API Error:', err);
        } finally {
            setLoading(false);
        }
    };    const handleAddFood = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            
            const formData = new FormData();
            if (newFood.image) {
                formData.append('image', newFood.image);
            }            // Log what we're sending for debugging
            console.log('Sending food data:', newFood);
            
            formData.append('foodData', JSON.stringify({
                name: newFood.name,
                category: "Main Course", // Since category is commented out in the form, provide a default
                servingSize: parseInt(newFood.servingSize) || 100,
                servingUnit: newFood.servingUnit || "g",
                nutritionPer100g: {
                    calories: parseInt(newFood.nutrition.calories) || 0,
                    protein: parseInt(newFood.nutrition.protein) || 0,
                    carbs: parseInt(newFood.nutrition.carbs) || 0,
                    fat: parseInt(newFood.nutrition.fat) || 0,
                    fiber: parseInt(newFood.nutrition.fiber) || 0
                },
                mealType: newFood.mealType && newFood.mealType.length > 0 ? newFood.mealType : ['lunch'],
                dietaryPreferences: newFood.dietaryPreferences || [],
                description: newFood.description || '',
                preparationTime: parseInt(newFood.preparationTime) || 0
            }));
            
            const response = await axios.post('/api/foods', formData, {
                baseURL: 'http://localhost:5000',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            if (response.data && response.data.success) {
                setFoods([...foods, response.data.data]);
                setShowAddForm(false);
                setNewFood({
                    name: '',
                    category: 'Snacks', // Default category
                    nutrition: {
                        calories: '',
                        protein: '',
                        carbs: '',
                        fat: '',
                        fiber: '0'
                    },
                    dietaryPreferences: [], // Array to store dietary preferences
                    mealType: [], // Array to store meal types
                    servingSize: '100',
                    servingUnit: 'g',
                    description: '',
                    preparationTime: '0',
                    image: ''
                });
            }        } catch (err) {
            console.error('Error in handleAddFood:', err);
            console.error('Error response:', err.response?.data);
            setError(err.response?.data?.message || 'Error adding food');
        } finally {
            setLoading(false);
        }
    };    const handleInputChange = (e, field) => {
        if (field.includes('nutrition.')) {
            const nutritionField = field.split('.')[1];
            setNewFood({
                ...newFood,
                nutrition: {
                    ...newFood.nutrition,
                    [nutritionField]: e.target.value
                }
            });
        } else {
            setNewFood({
                ...newFood,
                [field]: e.target.value
            });
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewFood({
                ...newFood,
                image: file
            });
        }
    };

    const handleCheckboxChange = (e, type, value) => {
        const isChecked = e.target.checked;
        
        if (type === 'dietaryPreferences') {
            if (isChecked) {
                // Add the preference if checked
                setNewFood({
                    ...newFood,
                    dietaryPreferences: [...newFood.dietaryPreferences, value]
                });
            } else {
                // Remove the preference if unchecked
                setNewFood({
                    ...newFood,
                    dietaryPreferences: newFood.dietaryPreferences.filter(pref => pref !== value)
                });
            }
        } else if (type === 'mealType') {
            if (isChecked) {
                // Add the meal type if checked
                setNewFood({
                    ...newFood,
                    mealType: [...newFood.mealType, value]
                });
            } else {
                // Remove the meal type if unchecked
                setNewFood({
                    ...newFood,
                    mealType: newFood.mealType.filter(meal => meal !== value)
                });
            }
        }
    };

    const filteredFoods = foods.filter(food => 
        food.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
            <div className="foods-container">
                <div className="foods-header">
                    <h2>Food Database</h2>
                    <div className="foods-actions">
                        <input
                            type="text"
                            placeholder="Search foods..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                        <button 
                            className="add-food-btn"
                            onClick={() => setShowAddForm(true)}
                        >
                            Add New Food
                        </button>
                    </div>
                </div>

                {showAddForm && (
                    <div className="modal-overlay">
                        <div className="add-food-form">
                            <h3>Add New Food</h3>
                            <form onSubmit={handleAddFood}>
                                <div className="form-group">
                                    <label>Name:</label>
                                    <input
                                        type="text"
                                        value={newFood.name}
                                        onChange={(e) => handleInputChange(e, 'name')}
                                        required
                                    />
                                </div>
                                {/* <div className="form-group">
                                    <label>Category:</label>
                                    <select
                                        value={newFood.category}
                                        onChange={(e) => handleInputChange(e, 'category')}
                                        required
                                    >
                                        <option value="Breakfast">Breakfast</option>
                                        <option value="Main Course">Main Course</option>
                                        <option value="Snacks">Snacks</option>
                                        <option value="Dessert">Dessert</option>
                                        <option value="Beverage">Beverage</option>
                                        <option value="Side Dish">Side Dish</option>
                                    </select>
                                </div> */}
                                <div className="form-group">
                                    <label>Calories:</label>
                                    <input
                                        type="number"
                                        value={newFood.nutrition.calories}
                                        onChange={(e) => handleInputChange(e, 'nutrition.calories')}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Protein (g):</label>
                                    <input
                                        type="number"
                                        value={newFood.nutrition.protein}
                                        onChange={(e) => handleInputChange(e, 'nutrition.protein')}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Carbs (g):</label>
                                    <input
                                        type="number"
                                        value={newFood.nutrition.carbs}
                                        onChange={(e) => handleInputChange(e, 'nutrition.carbs')}
                                        required
                                    />
                                </div>                                
                                <div className="form-group">
                                    <label>Fat (g):</label>
                                    <input
                                        type="number"
                                        value={newFood.nutrition.fat}
                                        onChange={(e) => handleInputChange(e, 'nutrition.fat')}
                                        required
                                    />
                                </div>
                                {/* <div className="form-group">
                                    <label>Fiber (g):</label>
                                    <input
                                        type="number"
                                        value={newFood.nutrition.fiber}
                                        onChange={(e) => handleInputChange(e, 'nutrition.fiber')}
                                    />
                                </div> */}
                                <div className="form-group">
                                    <label>Description:</label>
                                    <input
                                        type="text"
                                        placeholder="Brief description of the food"
                                        value={newFood.description}
                                        onChange={(e) => handleInputChange(e, 'description')}
                                    />
                                </div>
                                {/* <div className="form-group">
                                    <label>Preparation Time (minutes):</label>
                                    <input
                                        type="number"
                                        value={newFood.preparationTime}
                                        onChange={(e) => handleInputChange(e, 'preparationTime')}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Serving Size:</label>
                                    <div className="serving-inputs">
                                        <input
                                            type="number"
                                            value={newFood.servingSize}
                                            onChange={(e) => handleInputChange(e, 'servingSize')}
                                            placeholder="100"
                                            className="serving-size-input"
                                        />
                                        <input
                                            type="text"
                                            value={newFood.servingUnit}
                                            onChange={(e) => handleInputChange(e, 'servingUnit')}
                                            placeholder="g, ml, etc."
                                            className="serving-unit-input"
                                        />
                                    </div>
                                </div> */}
                                <div className="form-group">
                                    <label>Food Image:</label>
                                    <div className="image-upload-container">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleImageChange(e)}
                                            id="food-image"
                                            className="image-input"
                                        />
                                        <label htmlFor="food-image" className="image-upload-label">
                                            {newFood.image ? 'Change Image' : 'Choose Image'}
                                        </label>
                                        {newFood.image && (
                                            <div className="image-preview">
                                                <img src={typeof newFood.image === 'string' ? newFood.image : URL.createObjectURL(newFood.image)} alt="Preview" />
                                            </div>
                                        )}
                                    </div>
                                </div>                                
                                <div className="form-group">
                                    <label>Dietary Preferences:</label>
                                    <div className="checkbox-group">
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={newFood.dietaryPreferences.includes('vegetarian')}
                                                onChange={(e) => handleCheckboxChange(e, 'dietaryPreferences', 'vegetarian')}
                                            />
                                            Vegetarian
                                        </label>
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={newFood.dietaryPreferences.includes('vegan')}
                                                onChange={(e) => handleCheckboxChange(e, 'dietaryPreferences', 'vegan')}
                                            />
                                            Vegan
                                        </label>
                                        <label>
                                            <input
                                                type="checkbox"                                   
                                                checked={newFood.dietaryPreferences.includes('gluten-free')}
                                                onChange={(e) => handleCheckboxChange(e, 'dietaryPreferences', 'gluten-free')}
                                            />
                                            Gluten Free
                                        </label>
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={newFood.dietaryPreferences.includes('dairy-free')}
                                                onChange={(e) => handleCheckboxChange(e, 'dietaryPreferences', 'dairy-free')}
                                            />
                                            Dairy Free
                                        </label>
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={newFood.dietaryPreferences.includes('low-carb')}
                                                onChange={(e) => handleCheckboxChange(e, 'dietaryPreferences', 'low-carb')}
                                            />
                                            Low Carb
                                        </label>
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={newFood.dietaryPreferences.includes('high-protein')}
                                                onChange={(e) => handleCheckboxChange(e, 'dietaryPreferences', 'high-protein')}
                                            />
                                            High Protein
                                        </label>
                                    </div>
                                </div>                                
                                <div className="form-group">
                                    <label>Meal Type:</label>
                                    <div className="checkbox-group">
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={newFood.mealType.includes('breakfast')}
                                                onChange={(e) => handleCheckboxChange(e, 'mealType', 'breakfast')}
                                            />
                                            Breakfast
                                        </label>
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={newFood.mealType.includes('lunch')}
                                                onChange={(e) => handleCheckboxChange(e, 'mealType', 'lunch')}
                                            />
                                            Lunch
                                        </label>
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={newFood.mealType.includes('dinner')}
                                                onChange={(e) => handleCheckboxChange(e, 'mealType', 'dinner')}
                                            />
                                            Dinner
                                        </label>
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={newFood.mealType.includes('snack')}
                                                onChange={(e) => handleCheckboxChange(e, 'mealType', 'snack')}
                                            />
                                            Snack
                                        </label>
                                    </div>
                                </div>
                                <div className="form-actions">
                                    <div className="button-container">
                                        <button type="submit" className="submit-btn">Add Food</button>
                                        <button 
                                            type="button" 
                                            className="cancel-btn"
                                            onClick={() => setShowAddForm(false)}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
                
                {loading && <div className="loading">Loading...</div>}
                
                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}                
                {!loading && !error && (
                    <div className="foods-grid">                        
                    {filteredFoods.map((food) => (
                            <div key={food._id} className="food-card">
                                {food.image ? (
                                    <img 
                                        src={getImageUrl(food.image)}
                                        alt={food.name} 
                                        className="food-image" 
                                        onError={(e) => {
                                            console.log('Image failed to load:', food.image);
                                            e.target.onerror = null;
                                            e.target.src = 'https://via.placeholder.com/200x200?text=No+Image';
                                        }}
                                    />
                                ) : (
                                    <div className="no-image-placeholder">No Image Available</div>
                                )}
                                <h3 className="food-name">{food.name}</h3>
                                <div className="nutrition-info">
                                    <p>
                                        <span className="label">Calories:</span>
                                        <span className="value">{food.nutritionPer100g?.calories || '-'} kcal</span>
                                    </p>
                                    <p>
                                        <span className="label">Protein:</span>
                                        <span className="value">{food.nutritionPer100g?.protein || '-'}g</span>
                                    </p>
                                    <p>
                                        <span className="label">Carbs:</span>
                                        <span className="value">{food.nutritionPer100g?.carbs || '-'}g</span>
                                    </p>                                    <p>
                                        <span className="label">Fat:</span>
                                        <span className="value">{food.nutritionPer100g?.fat || '-'}g</span>
                                    </p>
                                    {/* {food.nutritionPer100g?.fiber > 0 && (
                                    <p>
                                        <span className="label">Fiber:</span>
                                        <span className="value">{food.nutritionPer100g?.fiber || '-'}g</span>
                                    </p>
                                    )} */}
                                </div>
                                
                                {food.dietaryPreferences && food.dietaryPreferences.length > 0 && (
                                    <div className="food-tags dietary-tags">
                                        {food.dietaryPreferences.map((pref, index) => (
                                        <span key={index} className={`tag dietary-tag ${pref.toLowerCase().replace(/\s/g, '-')}`}>
                                            {pref}
                                        </span>
                                        ))}
                                    </div>
                                )}

                                {food.mealType && food.mealType.length > 0 && (
                                    <div className="food-tags meal-tags">
                                        {food.mealType.map((type, index) => {
                                            let icon = '';

                                            switch (type.toLowerCase()) {
                                                case 'breakfast':
                                                icon = '🕖';
                                                break;
                                                case 'lunch':
                                                icon = '🕛';
                                                break;
                                                case 'dinner':
                                                icon = '🕔';
                                                break;
                                                case 'snack':
                                                icon = '🕘';        
                                                break;
                                                default:
                                                icon = '🕒';
                                            }
                                            return (
                                                <span
                                                    key={index}
                                                    className={`tag meal-tag ${type.toLowerCase().replace(/\s/g, '-')}`}
                                                >
                                                    <span className="tag-icon" style={{ marginRight: '6px' }}>{icon}</span>
                                                    {type}
                                                </span>
                                            );
                                        })}
                                    </div>
                                )}

                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Foods;
