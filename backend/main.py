import os
import pickle
import numpy as np
import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

app = FastAPI(title="Smart City Traffic & Environment API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Load ML Model ─────────────────────────────────────────────────────────────
MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "traffic_model.pkl")
model = None
model_load_error = None

def load_model():
    global model, model_load_error
    if model is not None:
        return model
    print("Loading traffic model (this may take a moment)...")
    # Try joblib first (more robust across sklearn versions)
    try:
        import joblib
        model = joblib.load(MODEL_PATH)
        print("Traffic model loaded successfully via joblib.")
        return model
    except Exception as e1:
        print(f"joblib load failed ({e1}), trying pickle...")
    # Fallback to raw pickle
    try:
        import pickle
        with open(MODEL_PATH, "rb") as f:
            model = pickle.load(f)
        print("Traffic model loaded successfully via pickle.")
        return model
    except Exception as e2:
        model_load_error = str(e2)
        print(f"WARNING: Could not load traffic model: {e2}")
        print("Server will start in DEMO MODE — predictions will use a statistical simulation.")
        return None

@app.on_event("startup")
async def startup_event():
    load_model()


# ── Schemas ────────────────────────────────────────────────────────────────────
class PredictRequest(BaseModel):
    junction: int
    hour: int
    day: int
    month: int
    weekday: int


class PredictResponse(BaseModel):
    predicted_vehicles: int
    congestion_level: str
    confidence: float


# ── Traffic Prediction ─────────────────────────────────────────────────────────
def get_congestion_level(vehicles: int) -> str:
    if vehicles < 20:
        return "Low"
    elif vehicles < 50:
        return "Medium"
    else:
        return "High"


@app.post("/predict", response_model=PredictResponse)
async def predict_traffic(data: PredictRequest):
    m = load_model()

    if m is not None:
        # Real ML prediction
        try:
            features = np.array([[data.junction, data.hour, data.day, data.month, data.weekday]])
            prediction = m.predict(features)
            vehicles = max(0, int(round(float(prediction[0]))))
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")
    else:
        # Statistical simulation fallback (model incompatible with current Python)
        base = 15 + (data.junction * 5)
        hour_factor = 1.0
        if data.hour in [7, 8, 9]:     hour_factor = 2.5   # morning rush
        elif data.hour in [17, 18, 19]: hour_factor = 2.2   # evening rush
        elif data.hour in [12, 13]:     hour_factor = 1.4   # lunch
        elif data.hour in [0, 1, 2, 3, 4]: hour_factor = 0.3  # night
        weekend_factor = 0.65 if data.weekday in [0, 6] else 1.0
        noise = np.random.randint(-5, 6)
        vehicles = max(0, int(base * hour_factor * weekend_factor) + noise)

    level = get_congestion_level(vehicles)
    confidence = round(0.85 + (0.1 * (1 - min(vehicles / 100, 1))), 2) if m is not None else 0.72

    return PredictResponse(
        predicted_vehicles=vehicles,
        congestion_level=level,
        confidence=confidence,
    )


# ── OpenWeather Pollution Proxy ────────────────────────────────────────────────
@app.get("/pollution")
async def get_pollution(lat: float, lon: float, apikey: str):
    url = "http://api.openweathermap.org/data/2.5/air_pollution"
    params = {"lat": lat, "lon": lon, "appid": apikey}
    async with httpx.AsyncClient(timeout=15) as client:
        try:
            resp = await client.get(url, params=params)
            resp.raise_for_status()
            return resp.json()
        except httpx.HTTPStatusError as e:
            raise HTTPException(status_code=e.response.status_code, detail="OpenWeather API error")
        except Exception as e:
            raise HTTPException(status_code=502, detail=f"Upstream error: {str(e)}")


# ── NASA POWER API Proxy ───────────────────────────────────────────────────────
@app.get("/environment")
async def get_environment(lat: float, lon: float, start: str = "20240101", end: str = "20240131"):
    url = "https://power.larc.nasa.gov/api/temporal/daily/point"
    params = {
        "parameters": "T2M,RH2M,WS10M,PRECTOTCORR",
        "community": "RE",
        "longitude": lon,
        "latitude": lat,
        "start": start,
        "end": end,
        "format": "JSON",
    }
    async with httpx.AsyncClient(timeout=30) as client:
        try:
            resp = await client.get(url, params=params)
            resp.raise_for_status()
            return resp.json()
        except httpx.HTTPStatusError as e:
            raise HTTPException(status_code=e.response.status_code, detail="NASA POWER API error")
        except Exception as e:
            raise HTTPException(status_code=502, detail=f"Upstream error: {str(e)}")


# ── Health Check ───────────────────────────────────────────────────────────────
@app.get("/health")
async def health():
    return {"status": "ok", "model_loaded": model is not None}


# ── Mock Data Endpoints (for demo when APIs unavailable) ───────────────────────
@app.get("/mock/pollution")
async def mock_pollution():
    return {
        "list": [{
            "main": {"aqi": 3},
            "components": {
                "co": 233.65, "no": 0.0, "no2": 18.4, "o3": 68.25,
                "so2": 0.64, "pm2_5": 12.4, "pm10": 18.73, "nh3": 0.24
            },
            "dt": 1709606400
        }]
    }


@app.get("/mock/environment")
async def mock_environment():
    return {
        "properties": {
            "parameter": {
                "T2M": {str(i): 22.5 + (i % 7) for i in range(20240101, 20240131)},
                "RH2M": {str(i): 55.0 + (i % 5) for i in range(20240101, 20240131)},
                "WS10M": {str(i): 3.2 + (i % 3) * 0.5 for i in range(20240101, 20240131)},
                "PRECTOTCORR": {str(i): (i % 4) * 0.5 for i in range(20240101, 20240131)},
            }
        }
    }
