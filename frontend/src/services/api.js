import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({ baseURL: API_BASE, timeout: 30000 })

// ── Traffic Prediction ─────────────────────────────────────────────────────────
export async function predictTraffic(data) {
    const res = await api.post('/predict', data)
    return res.data
}

// ── Pollution Data ─────────────────────────────────────────────────────────────
export async function getPollutionData(lat = 28.6139, lon = 77.2090) {
    const apikey = localStorage.getItem('openweather_key') || ''
    if (!apikey) {
        const res = await api.get('/mock/pollution')
        return res.data
    }
    const res = await api.get('/pollution', { params: { lat, lon, apikey } })
    return res.data
}

// ── Environmental Data ─────────────────────────────────────────────────────────
export async function getEnvironmentData(lat = 28.6139, lon = 77.2090, start = '20240101', end = '20240131') {
    const res = await api.get('/environment', { params: { lat, lon, start, end } })
    return res.data
}

// ── Health Check ───────────────────────────────────────────────────────────────
export async function getHealth() {
    const res = await api.get('/health')
    return res.data
}

// ── Mock Environment Data (fallback) ───────────────────────────────────────────
export async function getMockEnvironment() {
    const res = await api.get('/mock/environment')
    return res.data
}

export default api
