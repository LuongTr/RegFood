# Food Recognition API with TensorFlow and EfficientNetV2

This module provides a Flask-based API for food recognition using the TensorFlow EfficientNetV2 model pre-trained on the Food101 dataset.

## Features

- Food recognition from images using a pre-trained deep learning model
- Multiple predictions with confidence scores
- Integration with MongoDB for food nutritional data
- API endpoints for model status and manual pre-trained weight downloads

## Prerequisites

- Python 3.8+ 
- TensorFlow 2.x
- Flask
- MongoDB
- Node.js (for the backend server)

## Installation

1. Install Python dependencies:

```bash
python setup_food_recognition.py
```

This script will:
- Install all required Python packages
- Download pre-trained Food101 model weights

2. Verify installation:

```bash
python app.py
```

The server should start on port 5001 and confirm that the model has been loaded successfully.

## API Endpoints

### POST /predict

Upload an image for food recognition:

```bash
curl -X POST -F "image=@path/to/food_image.jpg" http://localhost:5001/predict
```

Response:
```json
{
  "ingredient": "Pizza",
  "confidence": 0.95,
  "alternatives": [
    {
      "name": "Flatbread",
      "confidence": 0.03
    },
    {
      "name": "Focaccia",
      "confidence": 0.01
    }
  ]
}
```

### GET /model-status

Check the status of the loaded model:

```bash
curl http://localhost:5001/model-status
```

### POST /download-pretrained

Force download of pre-trained model weights:

```bash
curl -X POST http://localhost:5001/download-pretrained
```

## Technical Details

### Model Architecture

- Base model: EfficientNetV2-B0
- Pre-trained on: ImageNet + Food101 dataset
- Input shape: 224x224x3 RGB images
- Output: Probability distribution over 101 food classes

### Training Dataset

The model is pre-trained on the Food101 dataset, which contains 101,000 images of 101 food categories, with 1,000 images per category.

### Integration with RegFood Application

The food recognition API integrates with the RegFood application backend, which stores nutritional information about food items in MongoDB.

## Troubleshooting

If you encounter issues with the pre-trained model weights:

1. Check if the `food101_efficientnetv2_weights.h5` file exists in the backend directory
2. Try manually downloading the weights using the `/download-pretrained` endpoint
3. Ensure TensorFlow and TensorFlow Hub are properly installed
4. Check the application logs for specific error messages

## License

This project is licensed under the MIT License - see the LICENSE file for details.
