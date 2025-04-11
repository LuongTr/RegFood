import React, { useState } from "react";
import "./FoodRecognition.css";

const UploadImage = () => {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [result, setResult] = useState(null);

  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setImage(file);
    setPreviewUrl(URL.createObjectURL(file));

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch("http://127.0.0.1:5000/predict", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setResult(data[0]); // Assume result is an array with one food item
    } catch (error) {
      console.error("Error:", error);
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
                <p className="food-label">{result.ingredient}</p>
                <p className="confidence">
                  Confidence: {Math.round(result.confidence * 100)}%
                </p>
              </div>
            </div>
  
            <div className="nutrition">
              <div className="nutrition-box">
                <p>Calories</p>
                <h4>{result.calories || "95"}</h4>
              </div>
              <div className="nutrition-box">
                <p>Protein</p>
                <h4>{result.protein || "0.5g"}</h4>
              </div>
              <div className="nutrition-box">
                <p>Carbs</p>
                <h4>{result.carbs || "25g"}</h4>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default UploadImage;

