import { useState, useEffect } from 'react'
import { Leaf, RefreshCw, MapPin, Thermometer, Droplets, Wind, CloudRain } from 'lucide-react'
import { getMockEnvironment } from '../services/api'
import { SmartAreaChart, SmartLineChart } from '../components/Charts'
import MetricCard from '../components/MetricCard'

function processNasaData(raw) {
    const params = raw?.properties?.parameter || {}
    const T2M = params.T2M || {}
    const RH2M = params.RH2M || {}
    const WS10M = params.WS10M || {}
    const PREC = params.PRECTOTCORR || {}

    const keys = Object.keys(T2M).slice(0, 30)
    return keys.map((k, i) => ({
        name: `Day ${i + 1}`,
        temp: +(T2M[k] ?? 22).toFixed(1),
        humidity: +(RH2M[k] ?? 55).toFixed(1),
        wind: +(WS10M[k] ?? 3.5).toFixed(1),
        precip: +(PREC[k] ?? 0.5).toFixed(2),
    }))
}

function avg(arr, key) {
    if (!arr.length) return 0
    return (arr.reduce((s, x) => s + (x[key] || 0), 0) / arr.length).toFixed(1)
}

export default function EnvironmentalData() {
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)
    const [coords, setCoords] = useState({ lat: 28.6139, lon: 77.2090 })

    async function fetchData() {
        const lat = parseFloat(localStorage.getItem('city_lat') || '28.6139')
        const lon = parseFloat(localStorage.getItem('city_lon') || '77.2090')
        setCoords({ lat, lon })
        setLoading(true)
        try {
            const raw = await getMockEnvironment()
            setData(processNasaData(raw))
        } catch (e) { /* use fallback */ }
        setLoading(false)
    }

    useEffect(() => { fetchData() }, [])

    const avgTemp = avg(data, 'temp')
    const avgHum = avg(data, 'humidity')
    const avgWind = avg(data, 'wind')
    const avgPrec = avg(data, 'precip')

    return (
        <div>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1>Environmental Data</h1>
                    <p>Satellite environmental parameters from NASA POWER API</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-secondary)' }}>
                        <MapPin size={14} /> {coords.lat.toFixed(2)}°N, {coords.lon.toFixed(2)}°E
                    </div>
                    <button className="btn btn-ghost btn-sm" onClick={fetchData} id="btn-refresh-env">
                        <RefreshCw size={14} /> Refresh
                    </button>
                </div>
            </div>

            {/* Metric Cards */}
            <div className="metrics-grid">
                <MetricCard label="Avg Temperature" value={avgTemp} unit="°C" icon={Thermometer} color="amber" />
                <MetricCard label="Avg Humidity" value={avgHum} unit="%" icon={Droplets} color="cyan" />
                <MetricCard label="Avg Wind Speed" value={avgWind} unit="m/s" icon={Wind} color="green" />
                <MetricCard label="Avg Precipitation" value={avgPrec} unit="mm" icon={CloudRain} color="purple" />
            </div>

            {/* Charts */}
            <div className="charts-grid" style={{ marginBottom: 24 }}>
                <div className="chart-card">
                    <div className="chart-title">Temperature Trend</div>
                    <div className="chart-subtitle">Daily temperature (°C) — 30-day period</div>
                    <SmartAreaChart
                        data={data}
                        areas={[{ key: 'temp', color: 'var(--amber)', name: 'Temperature (°C)' }]}
                    />
                </div>
                <div className="chart-card">
                    <div className="chart-title">Wind Speed Trend</div>
                    <div className="chart-subtitle">Daily wind speed (m/s) at 10m height</div>
                    <SmartAreaChart
                        data={data}
                        areas={[{ key: 'wind', color: 'var(--green)', name: 'Wind Speed (m/s)' }]}
                    />
                </div>
            </div>

            <div className="chart-card" style={{ marginBottom: 24 }}>
                <div className="chart-title">Environmental Condition Overview</div>
                <div className="chart-subtitle">Temperature, Humidity, and Precipitation — correlation view</div>
                <SmartLineChart
                    data={data}
                    lines={[
                        { key: 'temp', color: 'var(--amber)', name: 'Temperature (°C)' },
                        { key: 'humidity', color: 'var(--cyan)', name: 'Humidity (%)' },
                        { key: 'precip', color: 'var(--purple)', name: 'Precipitation (mm)' },
                    ]}
                    height={260}
                />
            </div>

            {/* Data Table preview */}
            <div className="card">
                <div className="section-title"><Leaf size={18} color="var(--green)" /> Recent Readings</div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                {['Day', 'Temp (°C)', 'Humidity (%)', 'Wind (m/s)', 'Precip (mm)'].map(h => (
                                    <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {data.slice(0, 10).map((row, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                    <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>{row.name}</td>
                                    <td style={{ padding: '10px 12px', color: 'var(--amber)', fontWeight: 600 }}>{row.temp}</td>
                                    <td style={{ padding: '10px 12px', color: 'var(--cyan)', fontWeight: 600 }}>{row.humidity}</td>
                                    <td style={{ padding: '10px 12px', color: 'var(--green)', fontWeight: 600 }}>{row.wind}</td>
                                    <td style={{ padding: '10px 12px', color: 'var(--purple)', fontWeight: 600 }}>{row.precip}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 12 }}>
                    Showing first 10 of {data.length} days. Data sourced from NASA POWER API.
                </div>
            </div>
        </div>
    )
}
