import cv2
import sys
from pathlib import Path

from inference import load_ecobin_model, predict_image

model = load_ecobin_model()


def main():
    image_path = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).resolve().with_name("test.jpg")
    if not image_path.is_absolute():
        image_path = Path.cwd() / image_path

    image = cv2.imread(str(image_path), cv2.IMREAD_COLOR)
    if image is None:
        raise FileNotFoundError(f"Could not load image: {image_path}")

    result = predict_image(model, image)
    print("Prediction:", result["display_label"])
    print("Confidence:", f'{result["confidence"]:.4f}')
    print("Probabilities:", result["probabilities"])


if __name__ == "__main__":
    main()
