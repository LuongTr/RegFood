import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./FoodRecognition.css";
import { useAuth } from "../context/AuthContext";

const FoodRecognition = () => {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const handleImageChange = async (event) => {
    try {
      const file = event.target.files[0];
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Please select an image file');
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Image size should be less than 5MB');
      }

      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setLoading(true);
      setError(null);
      setResult(null);

      const formData = new FormData();
      formData.append("image", file);

      // First call the Python server for image recognition
      const recognitionResponse = await fetch("http://localhost:5001/predict", {
        method: "POST",
        body: formData,
      });

      const recognitionData = await recognitionResponse.json();

      if (!recognitionResponse.ok) {
        throw new Error(recognitionData.error || 'Failed to recognize food');
      }

      // Check if token exists
      if (!token) {
        logout();
        navigate('/signin');
        throw new Error('Authentication required. Please sign in.');
      }

      // Then call the Node.js server for nutrition data
      const nutritionResponse = await fetch(`http://localhost:5000/api/food/search?query=${encodeURIComponent(recognitionData.ingredient)}`, {
        method: "GET",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (nutritionResponse.status === 401) {
        logout();
        navigate('/signin');
        throw new Error('Session expired. Please sign in again.');
      }

      if (!nutritionResponse.ok) {
        throw new Error('Failed to fetch nutrition data');
      }

      const nutritionData = await nutritionResponse.json();
      
      setResult({
        name: recognitionData.ingredient,
        confidence: recognitionData.confidence,
        nutritionInfo: nutritionData.length > 0 ? nutritionData[0].nutritionPer100g : null
      });
    } catch (error) {
      console.error("Error:", error);
      setError(error.message || "Failed to process food image. Please try again.");
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="upload-container">
        <h2 className="title">🍽 Food Recognition</h2>
  
        {/* Upload Box */}
        <div className="upload-box">
          <label htmlFor="imageUpload" className="upload-area">
            <div className="cloud-icon">☁️⬆️</div>
            <p>Upload an image of your food</p>
            <p className="upload-hint">Supported formats: JPG, PNG, GIF (max 5MB)</p>
            <div className="choose-button">Choose Image</div>
          </label>
          <input
            type="file"
            id="imageUpload"
            style={{ display: "none" }}
            accept="image/*"
            onChange={handleImageChange}
          />
        </div>

        {/* Loading State */}
        {loading && (
          <div className="loading-state">
            <p>Recognizing food...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="error-state">
            <p>{error}</p>
            <button 
              className="retry-button" 
              onClick={() => {
                setError(null);
                setResult(null);
                document.getElementById('imageUpload').value = '';
              }}
            >
              Try Again
            </button>
          </div>
        )}
  
        {/* Result Section */}
        {result && (
          <div className="result-section">
            <h3>Recognition Results</h3>
            <div className="result-card">
              <img
                src={previewUrl}
                alt="Uploaded"
                className="food-image"
              />
              <div>
                <p className="food-label">{result.name}</p>
                <p className="confidence">
                  Confidence: {Math.round(result.confidence * 100)}%
                </p>
              </div>
            </div>
  
            {result.nutritionInfo ? (
              <div className="nutrition">
                <div className="nutrition-box">
                  <p>Calories</p>
                  <h4>{result.nutritionInfo.calories} kcal</h4>
                  <p className="per-100g">per 100g</p>
                </div>
                <div className="nutrition-box">
                  <p>Protein</p>
                  <h4>{result.nutritionInfo.protein}g</h4>
                  <p className="per-100g">per 100g</p>
                </div>
                <div className="nutrition-box">
                  <p>Carbs</p>
                  <h4>{result.nutritionInfo.carbs}g</h4>
                  <p className="per-100g">per 100g</p>
                </div>
              </div>
            ) : (
              <div className="no-nutrition">
                <p>No nutrition information available for this food</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FoodRecognition;

