from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from PIL import Image
import io
import logging
import traceback
import sys
import os
import json
from pathlib import Path

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app, supports_credentials=True, resources={r"/*": {"origins": "*"}})

# Initialize variables
model = None
class_mapping = {}
model_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'food_model')
model_file = os.path.join(model_dir, 'food_model.keras')  # Updated model file path with .keras extension
mapping_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'class_mapping.json')

def load_model_and_classes():
    """Load the trained model and class mapping from disk"""
    global model, class_mapping
    
    try:
        # Load the model
        if os.path.exists(model_file):
            logger.info(f"Loading existing model from {model_file}")
            model = tf.keras.models.load_model(model_file)
        else:
            logger.error(f"No trained model found at {model_file}! Please run train_model.py first")
            return False
            
        # Load class mapping
        if os.path.exists(mapping_file):
            logger.info(f"Loading class mapping from {mapping_file}")
            with open(mapping_file, 'r') as f:
                class_mapping = json.load(f)
            logger.info(f"Loaded {len(class_mapping)} class mappings")
        else:
            logger.error("No class mapping found! Please run train_model.py first")
            return False
            
        return True
    except Exception as e:
        logger.error(f"Error loading model and classes: {str(e)}")
        return False

def preprocess_image(image):
    """Preprocess an image for prediction"""
    try:
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Apply basic image enhancements
        from PIL import ImageEnhance
        
        # Enhance contrast
        enhancer = ImageEnhance.Contrast(image)
        image = enhancer.enhance(1.2)
        
        # Enhance brightness
        enhancer = ImageEnhance.Brightness(image)
        image = enhancer.enhance(1.1)
        
        # Resize with high-quality resampling to match the model's expected input size
        image = image.resize((224, 224), Image.Resampling.LANCZOS)
        
        # Convert to numpy array
        img_array = np.array(image)
        
        # Add batch dimension
        img_array = np.expand_dims(img_array, axis=0)
        
        # Normalize pixel values
        img_array = img_array / 255.0
        
        return img_array
    except Exception as e:
        logger.error(f"Error preprocessing image: {str(e)}")
        traceback.print_exc()
        raise

def get_top_predictions(predictions, top_k=3):
    """Get top k predictions with confidence scores"""
    try:
        # Find indices of top predictions
        top_indices = np.argsort(predictions[0])[-top_k:][::-1]
        
        # Convert to class names using mapping
        result = [(class_mapping[str(i)], float(predictions[0][i])) for i in top_indices]
        return result
    except Exception as e:
        logger.error(f"Error getting predictions: {str(e)}")
        traceback.print_exc()
        raise

@app.route('/predict', methods=['POST'])
def predict():
    """Handle prediction requests"""
    try:
        # Check if model is loaded or needs to be loaded
        if model is None:
            model_loaded = load_model_and_classes()
            if not model_loaded:
                return jsonify({
                    "error": f"Model not found at {model_file}. Please run train_model.py first to train the model.",
                    "status": "error"
                }), 500
        
        if 'image' not in request.files:
            return jsonify({"error": "No image file provided"}), 400

        file = request.files['image']
        if not file.filename:
            return jsonify({"error": "No selected file"}), 400

        # Read and preprocess image
        image_bytes = file.read()
        image = Image.open(io.BytesIO(image_bytes))
        processed_image = preprocess_image(image)

        # Make prediction
        predictions = model.predict(processed_image, verbose=0)
        
        # Get top 3 predictions
        top_predictions = get_top_predictions(predictions, top_k=3)
        
        # Format response
        response = {
            "ingredient": top_predictions[0][0].replace('_', ' ').title(),
            "confidence": float(top_predictions[0][1]),
            "alternatives": [
                {
                    "name": pred[0].replace('_', ' ').title(),
                    "confidence": float(pred[1])
                }
                for pred in top_predictions[1:]
            ]
        }

        logger.info(f"Prediction successful: {response}")
        return jsonify(response)

    except Exception as e:
        error_msg = f"Prediction error: {str(e)}"
        logger.error(error_msg)
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route('/model-status', methods=['GET'])
def model_status():
    """Check model status and provide information about training"""
    try:
        status = {
            "model_loaded": model is not None,
            "class_mapping_loaded": len(class_mapping) > 0 if class_mapping else 0,
            "number_of_classes": len(class_mapping) if class_mapping else 0,
            "model_file": str(model_file),
            "mapping_file": str(mapping_file)
        }
        
        # Check if model file exists
        status["model_exists"] = os.path.exists(model_file)
        
        # Add dataset information
        dataset_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'dataset')
        if os.path.exists(dataset_dir):
            class_folders = [f for f in os.listdir(dataset_dir) if os.path.isdir(os.path.join(dataset_dir, f))]
            status["dataset_available"] = True
            status["dataset_classes"] = len(class_folders)
            status["dataset_location"] = dataset_dir
        else:
            status["dataset_available"] = False
        
        return jsonify(status)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Add this new route for testing:

@app.route('/test', methods=['GET'])
def test_endpoint():
    """Simple endpoint to test if the API is accessible"""
    return jsonify({
        "status": "success",
        "message": "Food recognition API is running correctly"
    })

if __name__ == '__main__':
    # Try to load existing model first
    if load_model_and_classes():
        logger.info("Existing model and class mapping loaded successfully")
    else:
        logger.warning("No existing model found. Please run train_model.py first.")
    
    # Start the Flask server - ensure port is 5001
    logger.info("Starting Flask server on port 5001")
    app.run(port=5001, debug=True, host='0.0.0.0')
