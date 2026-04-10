import cv2

from inference import load_ecobin_model, predict_image

model = load_ecobin_model()

cap = cv2.VideoCapture(0)

label = "Detecting..."
confidence = 0

while True:
    ret, frame = cap.read()
    if not ret:
        break

    frame = cv2.resize(frame, (640, 480))
    h, w, _ = frame.shape

    # Center box
    x1, y1 = w // 4, h // 4
    x2, y2 = 3 * w // 4, 3 * h // 4

    cv2.rectangle(frame, (x1, y1), (x2, y2), (255, 0, 0), 2)

    # Crop center
    crop = frame[y1:y2, x1:x2]

    result = predict_image(model, crop)
    label = result["display_label"]
    confidence = result["confidence"]

    # Optional: confidence filter
    if confidence < 0.5:
        label = "Not sure"

    # Display result
    text = f"{label} ({confidence:.2f})"
    cv2.putText(frame, text, (10, 40),
                cv2.FONT_HERSHEY_SIMPLEX, 1,
                (0, 255, 0), 2)

    cv2.putText(frame, "Place object inside box",
                (10, 460),
                cv2.FONT_HERSHEY_SIMPLEX, 0.6,
                (255, 255, 255), 2)

    cv2.imshow("EcoBin AI (Real-Time)", frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
