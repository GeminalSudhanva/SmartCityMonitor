<div align="center">

# 🏙️ SmartCity Monitor

### AI-Powered Traffic & Environmental Monitoring Platform

[![Python](https://img.shields.io/badge/Python-3.14-blue?logo=python)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-green?logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev)
[![Three.js](https://img.shields.io/badge/Three.js-r160-black?logo=three.js)](https://threejs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

*Predict traffic congestion with Machine Learning · Monitor real-time air quality · Analyze NASA satellite environmental data — all in one intelligent dashboard.*

</div>

---

## ✨ Features

### 🧠 AI Traffic Prediction
- Trained **scikit-learn ML model** predicts vehicle count at a junction for any hour, weekday, and month
- Returns congestion level: 🟢 **Low** · 🟡 **Medium** · 🔴 **High**
- Live **SVG gauge** and hourly trend chart visualize results instantly
- Confidence score displayed with every prediction

### 💨 Real-Time Air Pollution Monitoring
- Powered by **OpenWeather Air Pollution API**
- Displays live: **AQI**, **PM2.5**, **PM10**, **NO₂**, **CO**, **O₃**, **SO₂**
- Animated AQI ring gauge with color-coded pollutant bars
- Location-configurable — works for any city on Earth

### 🌍 NASA POWER Environmental Data
- Fetches satellite-based meteorological data from **NASA POWER API** (no API key required)
- Parameters: **Temperature**, **Humidity**, **Wind Speed**, **Precipitation**
- 30-day trend charts + data table with daily readings

### 🏙️ Interactive 3D City Simulation
- Live **Three.js** 3D city scene with animated cars and buildings
- Road color updates in real time based on ML prediction:
  - 🟢 Green → Low · 🟡 Amber → Medium · 🔴 Red → High traffic
- Adjust junction, time-of-day, and traffic density via slider controls

### 📊 Reports & Analytics
- Daily traffic volumes across all 4 junctions
- Peak hour vs average traffic comparison
- Weekly PM2.5 / PM10 pollution trends
- Traffic–Pollution–Temperature correlation charts
- One-click **JSON report export**

### ⚙️ Smart Settings & Configuration
- Enter **OpenWeather API key** (saved to browser `localStorage`)
- Set any **city coordinates** — Pollution & Environment pages auto-update on Refresh
- Live **backend connection test** with ML model status check
- Step-by-step backend startup guide built-in

---

## 🖥️ Screenshots

| Landing Page | Dashboard |
|:---:|:---:|
| Hero, features, tech stack, CTAs | Metric cards, charts, live AQI |

| Traffic Prediction | Pollution Monitoring |
|:---:|:---:|
| ML form + SVG gauge + result | AQI ring + pollutant bars |

| 3D Simulation | Reports & Analytics |
|:---:|:---:|
| Three.js city with animated cars | Multi-chart analytics + export |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Python, FastAPI, scikit-learn, joblib, NumPy, pandas |
| **Frontend** | React 18, Vite 7, React Router v6 |
| **3D Visualization** | Three.js, @react-three/fiber |
| **Charts** | Recharts |
| **Animations** | Framer Motion |
| **Icons** | Lucide React |
| **APIs** | OpenWeather Air Pollution API, NASA POWER API |
| **HTTP Client** | Axios, httpx (backend proxy) |

---

## 📁 Project Structure

```
SmartCityMonitor/
├── backend/
│   ├── main.py              # FastAPI app — predict, pollution, environment endpoints
│   └── requirements.txt
│
├── frontend/
│   ├── index.html
│   └── src/
│       ├── App.jsx          # React Router — 8 routes
│       ├── index.css        # Global dark glassmorphism theme
│       ├── services/
│       │   └── api.js       # Axios API client
│       ├── components/
│       │   ├── AppLayout.jsx
│       │   ├── Sidebar.jsx
│       │   ├── MetricCard.jsx
│       │   └── Charts.jsx   # Recharts wrappers (Line, Area, Bar)
│       └── pages/
│           ├── LandingPage.jsx
│           ├── Dashboard.jsx
│           ├── TrafficPrediction.jsx
│           ├── PollutionMonitoring.jsx
│           ├── EnvironmentalData.jsx
│           ├── Simulation.jsx       # Three.js 3D city
│           ├── Reports.jsx
│           └── Settings.jsx
│
├── traffic_model.pkl        # Trained ML model (local only — excluded from git)
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Python 3.9+
- Node.js 18+
- `traffic_model.pkl` in the project root

### 1. Start the Backend

```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```

> ⚠️ The ML model loads at startup — first boot may take 30–60 seconds.
> Visit **http://localhost:8000/docs** for the interactive Swagger API docs.

### 2. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173**

### 3. Configure Your API Key

1. Navigate to the **Settings** page in the app
2. Enter your **OpenWeather API key** (free at [openweathermap.org](https://openweathermap.org/api))
3. Optionally set your city's latitude & longitude
4. Click **Save Settings**

> NASA POWER API requires no API key — it works out of the box.

---

## 🔌 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/predict` | ML traffic prediction |
| `GET` | `/pollution?lat&lon&apikey` | OpenWeather Air Pollution proxy |
| `GET` | `/environment?lat&lon&start&end` | NASA POWER API proxy |
| `GET` | `/mock/pollution` | Mock pollution data (no key needed) |
| `GET` | `/mock/environment` | Mock environmental data |
| `GET` | `/health` | Backend health + model status |
| `GET` | `/docs` | Swagger interactive API docs |

### Prediction Request Example

```json
POST /predict
{
  "junction": 1,
  "hour": 8,
  "day": 5,
  "month": 3,
  "weekday": 3
}
```

```json
{
  "predicted_vehicles": 38,
  "congestion_level": "Medium",
  "confidence": 0.91
}
```

---

## 🗺️ Junction Reference

The ML model was trained on the [Traffic Flow Forecasting](https://www.kaggle.com/datasets/fedesoriano/traffic-flow-forecasting) dataset with 4 junction sensor IDs:

| Junction | Traffic Profile |
|----------|----------------|
| 1 | High-traffic urban intersection |
| 2 | Moderate urban corridor |
| 3 | Lower-traffic zone |
| 4 | Lightest traffic in the dataset |

Congestion thresholds:
- **< 20 vehicles/hr** → 🟢 Low
- **20–50 vehicles/hr** → 🟡 Medium
- **> 50 vehicles/hr** → 🔴 High

---

## 📝 Notes

- `traffic_model.pkl` is excluded from git (608MB — exceeds GitHub's 100MB limit). Store it locally.
- Without an OpenWeather API key, the app uses mock pollution data automatically.
- NASA POWER API calls may take a few seconds due to satellite data processing.

---

## 📄 License

This project is licensed under the **MIT License**.

---

<div align="center">
Built with ❤️ using Python, React & Three.js
</div>
