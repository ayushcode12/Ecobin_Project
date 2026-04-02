# ♻️ EcoBin: AI-Powered Waste Classification

EcoBin is a full-stack, gamified waste management platform designed to help users intelligently classify their waste and earn leaderboard points while preserving the environment. 

Featuring stunning, glassmorphism-based UI components and a fully internal AI microservice, this architecture makes instant sustainability decisions effortless.

## ✨ Core Features
- **Live AR-Style Camera Scanner**: Natively tap into mobile and webcam video feeds to instantly snapshot and classify waste in real-time, right from your web browser.
- **Deep Learning AI Microservice**: Powered by a custom Python Flask API leveraging TensorFlow/Keras to analyze high-resolution images via OpenCV matrix transformations.
- **Robust Gamification Engine**: Users accumulate "Eco Points" per successful scan, unlocking competitive streaks and live leaderboards to motivate sustainable lifestyles.
- **Secure Fallback Taxonomy**: Built-in textual taxonomy algorithms written in Java intelligently fall back on exact text matching if the neural network is completely offline.

## 🛠️ Technology Stack
- **Frontend**: React.js, Vite, Tailwind CSS, Framer Motion, HTML5 Canvas, HTML5 MediaDevices APIs
- **Backend**: Java Spring Boot, Spring Security (JWT Tokens), Hibernate/JPA, RESTful APIs
- **Database**: PostgreSQL (handling raw Base64 data streaming with boundless TEXT column structures)
- **AI Microservice**: Python, Flask, OpenCV (BGR/RGB inversion), TensorFlow/Keras (`ecobin_model.keras`)

## 🚀 Getting Started

### 1. Launch the Frontend
Navigate into the `EcoBin_Frontend` folder and start the Vite development server:
```bash
npm install
npm run dev
```

### 2. Launch the AI Microservice
To host the internal classification engine, initialize the Python server on Port 5000:
```bash
cd Model
python app.py
```

### 3. Launch the Backend 
Execute the bundled startup sequence for the Spring Boot REST API:
```bash
run_backend.bat
```

---
*Developed by Ayush as a Final Year Project.*
