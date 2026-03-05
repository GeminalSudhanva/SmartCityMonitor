import { useState, useEffect } from 'react'
import { Wind, RefreshCw, MapPin, AlertCircle } from 'lucide-react'
import { getPollutionData } from '../services/api'
import { SmartAreaChart, SmartBarChart } from '../components/Charts'

const aqiLabels = ['', 'Good', 'Fair', 'Moderate', 'Poor', 'Very Poor']
const aqiColors = ['', 'var(--green)', '#a8e063', 'var(--amber)', '#ff7043', 'var(--red)']
const aqiDescs = ['', 'Air quality is satisfactory.', 'Acceptable air quality.', 'Sensitive groups may experience effects.', 'Everyone may experience effects.', 'Emergency conditions.']

function AqiRing({ aqi }) {
    const color = aqiColors[aqi] || 'var(--cyan)'
    const pct = ((aqi - 1) / 4)
    const r = 60
    const circ = 2 * Math.PI * r
    const dash = circ * pct

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 0' }}>
            <svg width={160} height={160}>
                <circle cx={80} cy={80} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={12} />
                <circle
                    cx={80} cy={80} r={r} fill="none" stroke={color} strokeWidth={12} strokeLinecap="round"
                    strokeDasharray={`${dash} ${circ}`}
                    transform="rotate(-90 80 80)"
                    style={{ filter: `drop-shadow(0 0 6px ${color})`, transition: 'stroke-dasharray 0.8s ease' }}
                />
                <text x={80} y={74} textAnchor="middle" fill={color} fontSize={32} fontWeight={900}>{aqi}</text>
                <text x={80} y={96} textAnchor="middle" fill="var(--text-secondary)" fontSize={12}>{aqiLabels[aqi]}</text>
            </svg>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', textAlign: 'center', maxWidth: 200, marginTop: 8 }}>
                {aqiDescs[aqi]}
            </div>
        </div>
    )
}

function PollutantBar({ label, value, max, color, unit }) {
    const pct = Math.min(value / max, 1)
    return (
        <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</span>
                <span style={{ color, fontWeight: 700 }}>{value?.toFixed(2)} {unit}</span>
            </div>
            <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3 }}>
                <div style={{
                    height: '100%', width: `${pct * 100}%`, borderRadius: 3,
                    background: color, boxShadow: `0 0 8px ${color}60`,
                    transition: 'width 0.8s ease'
                }} />
            </div>
        </div>
    )
}

function makeTrend() {
    const hrs = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`)
    return hrs.map(h => ({
        name: h,
        PM25: +(8 + Math.random() * 20).toFixed(2),
        PM10: +(15 + Math.random() * 25).toFixed(2),
        AQI_raw: +(30 + Math.random() * 100).toFixed(0),
    }))
}

export default function PollutionMonitoring() {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [coords, setCoords] = useState({ lat: 28.6139, lon: 77.2090 })
    const trend = makeTrend()

    async function fetchData() {
        // Read lat/lon fresh from localStorage every time
        const lat = parseFloat(localStorage.getItem('city_lat') || '28.6139')
        const lon = parseFloat(localStorage.getItem('city_lon') || '77.2090')
        setCoords({ lat, lon })
        setLoading(true)
        setError(null)
        try {
            const res = await getPollutionData(lat, lon)
            setData(res)
        } catch (e) {
            setError('Failed to fetch pollution data. Check your OpenWeather API key in Settings.')
        }
        setLoading(false)
    }

    useEffect(() => { fetchData() }, [])

    const item = data?.list?.[0] || null
    const aqi = item?.main?.aqi ?? 2
    const c = item?.components || { pm2_5: 12.4, pm10: 18.7, no2: 18.4, co: 233.65, o3: 68.25, so2: 0.64, nh3: 0.24 }

    return (
        <div>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1>Pollution Monitoring</h1>
                    <p>Real-time air quality data via OpenWeather Air Pollution API</p>
                </div>
                <div style={{ display: 'flex', align: 'center', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-secondary)' }}>
                        <MapPin size={14} /> {coords.lat.toFixed(2)}°N, {coords.lon.toFixed(2)}°E
                    </div>
                    <button className="btn btn-ghost btn-sm" onClick={fetchData} id="btn-refresh-pollution" disabled={loading}>
                        <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh
                    </button>
                </div>
            </div>

            {error && (
                <div className="card" style={{ marginBottom: 20, borderColor: 'var(--amber)', background: 'var(--amber-dim)', display: 'flex', gap: 12, alignItems: 'center' }}>
                    <AlertCircle size={18} color="var(--amber)" style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: 14, color: 'var(--amber)' }}>{error}</span>
                </div>
            )}

            <div className="grid-2" style={{ marginBottom: 24, alignItems: 'start' }}>
                {/* AQI Ring */}
                <div className="card" style={{ textAlign: 'center' }}>
                    <div className="section-title" style={{ justifyContent: 'center' }}>
                        <Wind size={18} color="var(--cyan)" /> Air Quality Index
                    </div>
                    <AqiRing aqi={aqi} />
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className={`badge badge-${i === 1 ? 'green' : i === 2 ? 'cyan' : i === 3 ? 'amber' : 'red'}`}
                                style={{ opacity: aqi === i ? 1 : 0.3 }}>
                                {aqiLabels[i]}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Pollutants */}
                <div className="card">
                    <div className="section-title"><Wind size={18} color="var(--cyan)" /> Pollutant Breakdown</div>
                    <PollutantBar label="PM2.5" value={c.pm2_5} max={75} color="var(--cyan)" unit="μg/m³" />
                    <PollutantBar label="PM10" value={c.pm10} max={150} color="var(--green)" unit="μg/m³" />
                    <PollutantBar label="NO₂" value={c.no2} max={200} color="var(--amber)" unit="μg/m³" />
                    <PollutantBar label="CO" value={c.co} max={10000} color="#4299e1" unit="μg/m³" />
                    <PollutantBar label="O₃" value={c.o3} max={240} color="var(--purple)" unit="μg/m³" />
                    <PollutantBar label="SO₂" value={c.so2} max={500} color="var(--red)" unit="μg/m³" />
                </div>
            </div>

            {/* Metric Cards */}
            <div className="metrics-grid" style={{ marginBottom: 24 }}>
                {[
                    { label: 'PM2.5', value: c.pm2_5?.toFixed(1), unit: 'μg/m³', color: 'cyan' },
                    { label: 'PM10', value: c.pm10?.toFixed(1), unit: 'μg/m³', color: 'green' },
                    { label: 'NO₂', value: c.no2?.toFixed(1), unit: 'μg/m³', color: 'amber' },
                    { label: 'CO', value: c.co?.toFixed(0), unit: 'μg/m³', color: 'purple' },
                ].map(({ label, value, unit, color }) => (
                    <div key={label} className="metric-card" style={{ '--accent-color': `var(--${color})` }}>
                        <div className="metric-label">{label}</div>
                        <div className="metric-value">{value}<span className="metric-unit" style={{ fontSize: 13, marginLeft: 4 }}>{unit}</span></div>
                    </div>
                ))}
            </div>

            {/* Trend Charts */}
            <div className="charts-grid">
                <div className="chart-card">
                    <div className="chart-title">PM Levels – 24 Hour Trend</div>
                    <div className="chart-subtitle">Particulate matter concentration throughout the day</div>
                    <SmartAreaChart data={trend} areas={[
                        { key: 'PM25', color: 'var(--cyan)', name: 'PM2.5 (μg/m³)' },
                        { key: 'PM10', color: 'var(--amber)', name: 'PM10 (μg/m³)' },
                    ]} />
                </div>
                <div className="chart-card">
                    <div className="chart-title">Raw AQI Index – Hourly</div>
                    <div className="chart-subtitle">Raw air quality index score over 24 hours</div>
                    <SmartAreaChart data={trend} areas={[
                        { key: 'AQI_raw', color: 'var(--green)', name: 'AQI Score' },
                    ]} />
                </div>
            </div>
        </div>
    )
}
