import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./FoodRecognition.css";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { toast } from "react-toastify";
import { FaCamera, FaUtensils } from "react-icons/fa";

const FoodRecognition = () => {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modelStatus, setModelStatus] = useState(null);
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  // Check model status on component mount
  useEffect(() => {
    const checkModelStatus = async () => {
      try {
        const response = await fetch("http://localhost:5001/model-status");
        const data = await response.json();
        setModelStatus(data);
        
        if (!data.model_loaded) {
          toast.info("The food recognition model is still initializing. First recognition might take longer.");
        }
      } catch (error) {
        console.error("Failed to check model status:", error);
      }
    };
    
    checkModelStatus();
  }, []);

  // Test backend connection
  const testBackendConnection = async () => {
    try {
      const response = await fetch("http://localhost:5001/test");
      const data = await response.json();
      console.log("Backend connection test:", data);
      return true;
    } catch (error) {
      console.error("Backend connection test failed:", error);
      return false;
    }
  };

  // Check backend and model status on component mount
  useEffect(() => {
    const checkConnections = async () => {
      try {
        const backendAvailable = await testBackendConnection();
        
        if (!backendAvailable) {
          toast.error("Could not connect to food recognition service. Please make sure the server is running.");
        } else {
          // If backend is available, check model status
          const response = await fetch("http://localhost:5001/model-status");
          const data = await response.json();
          setModelStatus(data);
          
          if (!data.model_loaded) {
            toast.info("The food recognition model is still initializing. First recognition might take longer.");
          }
        }
      } catch (error) {
        console.error("Error checking connections:", error);
      }
    };
    
    checkConnections();
  }, []);

  const handleImageChange = (event) => {
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
      setError(null);
      setResult(null);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleRecognize = async () => {
    if (!image) {
      setError("Please select an image first");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append("image", image);

      // Make sure this URL matches your backend server
      const recognitionResponse = await fetch("http://localhost:5001/predict", {
        method: "POST",
        body: formData,
      });

      // Check for status code issues
      if (!recognitionResponse.ok) {
        const errorText = await recognitionResponse.text();
        console.error("Server error response:", errorText);
        throw new Error(`Server returned ${recognitionResponse.status}: ${errorText || "Unknown error"}`);
      }

      const recognitionData = await recognitionResponse.json();
      console.log("Recognition result:", recognitionData);

      // Check if token exists
      if (!token) {
        logout();
        navigate("/signin");
        throw new Error("Authentication required. Please sign in.");
      }

      // Try to get nutrition data with multiple fallback options
      let nutritionInfo = null;
      let nutritionSuccess = false;
      const foodName = recognitionData.ingredient.toLowerCase();
      
      // Try option 1: search endpoint with query param
      try {
        console.log("Trying to fetch nutrition data from search endpoint...");
        const response1 = await axios.get(
          `http://localhost:5000/api/foods/search?query=${encodeURIComponent(foodName)}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (response1.data && response1.data.length > 0) {
          nutritionInfo = response1.data[0].nutritionPer100g;
          nutritionSuccess = true;
          console.log("Found nutrition data via search endpoint");
        }
      } catch (err1) {
        console.log("Search endpoint failed:", err1.message);
      }
      
      // Try option 2: foods endpoint with name param
      if (!nutritionSuccess) {
        try {
          console.log("Trying to fetch nutrition data from foods endpoint with name param...");
          const response2 = await axios.get(
            `http://localhost:5000/api/foods?name=${encodeURIComponent(foodName)}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (response2.data && response2.data.length > 0) {
            nutritionInfo = response2.data[0].nutritionPer100g;
            nutritionSuccess = true;
            console.log("Found nutrition data via foods endpoint");
          }
        } catch (err2) {
          console.log("Foods endpoint with name param failed:", err2.message);
        }
      }
      
      // Try option 3: direct food name endpoint
      if (!nutritionSuccess) {
        try {
          console.log("Trying to fetch nutrition data from direct food endpoint...");
          const response3 = await axios.get(
            `http://localhost:5000/api/foods/${encodeURIComponent(foodName.replace(/\s+/g, '-'))}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (response3.data && response3.data.nutritionPer100g) {
            nutritionInfo = response3.data.nutritionPer100g;
            nutritionSuccess = true;
            console.log("Found nutrition data via direct food endpoint");
          }
        } catch (err3) {
          console.log("Direct food endpoint failed:", err3.message);
        }
      }
      
      // Try option 4: Get all foods and filter client-side
      if (!nutritionSuccess) {
        try {
          console.log("Trying to fetch all foods and filter client-side...");
          const response4 = await axios.get(
            `http://localhost:5000/api/foods`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          
          if (response4.data && Array.isArray(response4.data)) {
            // Try to find a case-insensitive partial match
            const match = response4.data.find(food => 
              food.name.toLowerCase().includes(foodName) || 
              foodName.includes(food.name.toLowerCase())
            );
            
            if (match && match.nutritionPer100g) {
              nutritionInfo = match.nutritionPer100g;
              nutritionSuccess = true;
              console.log("Found nutrition data via client-side filtering");
            }
          }
        } catch (err4) {
          console.log("Client-side filtering failed:", err4.message);
        }
      }

      // Process recognition result and add nutrition data if available
      setResult({
        name: recognitionData.ingredient,
        confidence: recognitionData.confidence,
        alternatives: recognitionData.alternatives || [],
        nutritionInfo: nutritionInfo
      });
      
      // Show toast for successful recognition
      toast.success(`Recognized as: ${recognitionData.ingredient}`);
      
      // Show warning if nutrition data wasn't found
      if (!nutritionSuccess) {
        toast.warning("Nutrition data not available for this food");
      }
      
    } catch (error) {
      console.error("Error:", error);
      setError(error.message || "Failed to process food image");
      toast.error("Recognition failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadNewImage = () => {
    setImage(null);
    setPreviewUrl(null);
    setResult(null);
    
    // Use optional chaining to prevent errors if element doesn't exist
    const fileInput = document.getElementById("imageUpload");
    if (fileInput) {
      fileInput.value = "";
    }
  };

  return (
    <div className="page-container">
      <div className="fr-content-wrapper">
        <div className="fr-header">
          <h1><FaUtensils className="header-icon" /> Food Recognition</h1>
        </div>

        {!result ? (
          <div className="fr-upload-section">
            <div className="fr-upload-area" onClick={() => document.getElementById("imageUpload").click()}>
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Food preview"
                  className="fr-preview-image"
                />
              ) : (
                <div className="fr-upload-placeholder">
                  <FaCamera className="fr-upload-icon" />
                  <p>Upload an image of your food</p>
                  <span>Click to browse or drop an image here</span>
                </div>
              )}
            </div>
            <input
              type="file"
              id="imageUpload"
              style={{ display: "none" }}
              accept="image/*"
              onChange={handleImageChange}
            />

            {previewUrl && !loading && !result && (
              <button
                className="fr-button fr-analyze-button"
                onClick={handleRecognize}
                disabled={loading}
              >
                {loading ? "Analyzing..." : "Analyze Food"}
              </button>
            )}

            {loading && (
              <div className="fr-loading">
                <div className="fr-spinner"></div>
                <p>Analyzing your food image...</p>
              </div>
            )}

            {error && (
              <div className="fr-error-message">
                <p>{error}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="fr-results-section">
            <h2 className="fr-section-title">Recognition Results</h2>
            
            <div className="fr-result-container">
              <div className="fr-result-image">
                <img src={previewUrl} alt={result.name} />
              </div>
              
              <div className="fr-result-details">
                <h3 className="fr-food-name">{result.name}</h3>
                <p className="fr-confidence">Confidence: {Math.round(result.confidence * 100)}%</p>
                
                {result.alternatives && result.alternatives.length > 0 && (
                  <div className="fr-alternatives">
                    <p className="fr-alt-heading">Could also be:</p>
                    <ul className="fr-alt-list">
                      {result.alternatives.map((alt, idx) => (
                        <li key={idx}>
                          {alt.name} ({Math.round(alt.confidence * 100)}%)
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            
            {result.nutritionInfo ? (
              <div className="fr-nutrition-info">
                <h3 className="fr-section-title">Nutrition Information</h3>
                <div className="fr-nutrition-grid">
                  <div className="fr-nutrition-item">
                    <span className="fr-nutrition-label">Calories</span>
                    <span className="fr-nutrition-value">{result.nutritionInfo.calories} kcal</span>
                  </div>
                  <div className="fr-nutrition-item">
                    <span className="fr-nutrition-label">Protein</span>
                    <span className="fr-nutrition-value">{result.nutritionInfo.protein}g</span>
                  </div>
                  <div className="fr-nutrition-item">
                    <span className="fr-nutrition-label">Carbs</span>
                    <span className="fr-nutrition-value">{result.nutritionInfo.carbs}g</span>
                  </div>
                  <div className="fr-nutrition-item">
                    <span className="fr-nutrition-label">Fat</span>
                    <span className="fr-nutrition-value">{result.nutritionInfo.fat}g</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="fr-no-nutrition">
                <p>No nutrition information available for this food</p>
              </div>
            )}
            
            <div className="fr-actions">
              <button className="fr-button fr-upload-new" onClick={handleUploadNewImage}>
                Upload New Image
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FoodRecognition;

