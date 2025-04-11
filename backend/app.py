from flask import Flask, request, jsonify
from flask_cors import CORS  # Thêm dòng này
import numpy as np
import cv2
from PIL import Image
import tensorflow as tf
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input, decode_predictions
from tensorflow.keras.applications import MobileNetV2
import io

app = Flask(__name__)
CORS(app)  # Thêm dòng này để cho phép CORS

# Load mô hình MobileNetV2
model = MobileNetV2(weights="imagenet")

@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Nhận ảnh từ request
        file = request.files['image']
        img = Image.open(io.BytesIO(file.read()))
        
        # Chuyển ảnh thành numpy array
        img = img.resize((224, 224))
        img_array = np.array(img)
        img_array = np.expand_dims(img_array, axis=0)
        img_array = preprocess_input(img_array)

        # Dự đoán nguyên liệu
        predictions = model.predict(img_array)
        decoded_predictions = decode_predictions(predictions, top=3)[0]

        # Trả về kết quả JSON
        result = [{"ingredient": pred[1], "confidence": float(pred[2])} for pred in decoded_predictions]
        return jsonify(result)
    
    except Exception as e:
        return jsonify({"error": str(e)})

if __name__ == '__main__':
    app.run(debug=True)
