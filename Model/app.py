from flask import Flask, request, jsonify
from flask_cors import CORS
import keras
import numpy as np
import cv2
import base64

app = Flask(__name__)
CORS(app)

model = keras.models.load_model("ecobin_model.keras")
classes = ["biodegradable", "non-biodegradable", "recyclable"]

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    if not data or 'image' not in data:
        return jsonify({'error': 'No image provided'}), 400
        
    image_data = data['image']
    try:
        if image_data.startswith("http"):
            import requests
            response = requests.get(image_data)
            img_bytes = response.content
        else:
            if "base64," in image_data:
                image_data = image_data.split("base64,")[1]
            img_bytes = base64.b64decode(image_data)
            
        np_arr = np.frombuffer(img_bytes, np.uint8)
        img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        
        # Save debug image to verify it's not black/corrupt
        cv2.imwrite("debug_received.jpg", img)
        
        # Convert BGR to RGB (most Keras models expect RGB)
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        
        img = cv2.resize(img, (224, 224))
        img = img / 255.0
        img = np.expand_dims(img, axis=0)
        
        prediction = model.predict(img)
        print("Raw probs:", prediction[0])
        class_idx = np.argmax(prediction[0])
        predicted_class = classes[class_idx]
        confidence = float(prediction[0][class_idx])
        
        mapped = "Biodegradable"
        if predicted_class == "non-biodegradable":
            mapped = "Non-Biodegradable"
        elif predicted_class == "recyclable":
            mapped = "Recyclable"
            
        print("Final Mapping:", mapped)
        return jsonify({'prediction': mapped, 'confidence': confidence, 'probs': prediction[0].tolist()})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000)
