import React from 'react';
import "./Dashboard.css";
import { FaUtensils, FaFire, FaWeight } from 'react-icons/fa';

const Dashboard = () => {
  const recentMeals = [
    {
      id: 1,
      type: "Breakfast",
      name: "Oatmeal with fruits",
      calories: 450,
      time: "8:30 AM",
      image: "https://images.unsplash.com/photo-1517673132405-a56a62b18caf?ixlib=rb-4.0.3"
    },
    {
      id: 2,
      type: "Lunch",
      name: "Salad with chicken",
      calories: 650,
      time: "1:15 PM",
      image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3"
    }
  ];

  return (
    <div className="page-container">
      <div className="dashboard-container">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon meals">
              <FaUtensils />
            </div>
            <div className="stat-info">
              <h3>Today's Meals</h3>
              <p className="stat-value">3</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon calories">
              <FaFire />
            </div>
            <div className="stat-info">
              <h3>Calories</h3>
              <p className="stat-value">1,850</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon weight">
              <FaWeight />
            </div>
            <div className="stat-info">
              <h3>Weight</h3>
              <p className="stat-value">68 kg</p>
            </div>
          </div>
        </div>

        <div className="recent-meals-section">
          <h2>Recent Meals</h2>
          <div className="meals-list">
            {recentMeals.map(meal => (
              <div key={meal.id} className="meal-card">
                <img src={meal.image} alt={meal.name} className="meal-image" />
                <div className="meal-info">
                  <div className="meal-details">
                    <div className="meal-header">
                      <h3>{meal.type}</h3>
                      <p className="meal-name">{meal.name}</p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p className="meal-time">{meal.time}</p>
                    <p className="meal-calories">{meal.calories} kcal</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;