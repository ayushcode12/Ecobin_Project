from __future__ import annotations

import base64
from pathlib import Path

import cv2
import keras
import numpy as np

MODEL_PATH = Path(__file__).resolve().with_name("ecobin_model.keras")
INPUT_SIZE = (224, 224)
CLASSES = ["biodegradable", "non-biodegradable", "recyclable"]
DISPLAY_LABELS = {
    "biodegradable": "Biodegradable",
    "non-biodegradable": "Non-Biodegradable",
    "recyclable": "Recyclable",
}


def load_ecobin_model():
    return keras.models.load_model(MODEL_PATH)


def image_input_to_bytes(image_data: str) -> bytes:
    cleaned_input = (image_data or "").strip()
    if not cleaned_input:
        raise ValueError("Image payload is empty.")

    if cleaned_input.startswith("blob:"):
        raise ValueError("Browser blob URLs cannot be processed by the backend. Send base64 or an http(s) URL instead.")

    if cleaned_input.startswith(("http://", "https://")):
        import requests

        response = requests.get(cleaned_input, timeout=10)
        response.raise_for_status()
        return response.content

    if "base64," in cleaned_input:
        cleaned_input = cleaned_input.split("base64,", 1)[1]

    try:
        return base64.b64decode(cleaned_input, validate=True)
    except Exception as exc:
        raise ValueError("Image payload is not valid base64 data.") from exc


def decode_image_bytes(image_bytes: bytes) -> np.ndarray:
    np_arr = np.frombuffer(image_bytes, np.uint8)
    image = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    if image is None:
        raise ValueError("Unable to decode the provided image.")
    return image


def preprocess_image(image: np.ndarray) -> np.ndarray:
    if image.ndim != 3 or image.shape[2] != 3:
        raise ValueError("Expected a color image with 3 channels.")

    interpolation = cv2.INTER_AREA if image.shape[0] > INPUT_SIZE[1] or image.shape[1] > INPUT_SIZE[0] else cv2.INTER_LINEAR

    # Keep OpenCV's native BGR channel order so Flask matches the standalone scripts.
    resized = cv2.resize(image, INPUT_SIZE, interpolation=interpolation)
    normalized = resized.astype("float32") / 255.0
    return np.expand_dims(normalized, axis=0)


def predict_image(model, image: np.ndarray) -> dict:
    prediction = model.predict(preprocess_image(image), verbose=0)[0]
    class_index = int(np.argmax(prediction))
    raw_label = CLASSES[class_index]

    return {
        "class_index": class_index,
        "raw_label": raw_label,
        "display_label": DISPLAY_LABELS[raw_label],
        "confidence": float(prediction[class_index]),
        "probabilities": prediction.tolist(),
    }


def predict_from_image_input(model, image_data: str) -> dict:
    image_bytes = image_input_to_bytes(image_data)
    image = decode_image_bytes(image_bytes)
    return predict_image(model, image)
