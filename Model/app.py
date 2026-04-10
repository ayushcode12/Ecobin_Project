from flask import Flask, jsonify, request
from flask_cors import CORS

from inference import load_ecobin_model, predict_from_image_input

app = Flask(__name__)
CORS(app)

model = load_ecobin_model()


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json(silent=True) or {}
    image_data = data.get("image")
    if not image_data:
        return jsonify({"error": "No image provided"}), 400

    try:
        result = predict_from_image_input(model, image_data)
        print("Prediction:", result["display_label"], "confidence:", f'{result["confidence"]:.4f}')
        return jsonify(
            {
                "prediction": result["display_label"],
                "confidence": result["confidence"],
                "probs": result["probabilities"],
                "classIndex": result["class_index"],
                "rawLabel": result["raw_label"],
            }
        )
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


if __name__ == "__main__":
    app.run(port=5000)
