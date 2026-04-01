import keras
import numpy as np
import cv2

# Load model
model = keras.models.load_model("ecobin_model.keras")

# Classes
classes = ["biodegradable", "non-biodegradable", "recyclable"]

# Read image
img = cv2.imread("test.jpg")  # put any image here
img = cv2.resize(img, (224, 224))
img = img / 255.0
img = np.expand_dims(img, axis=0)

# Predict
prediction = model.predict(img)

print("Prediction:", classes[np.argmax(prediction)])