import keras

model = keras.models.load_model("ecobin_model.keras")

print("✅ Model loaded successfully!")
model.summary()