import { useState } from 'react'
import { Car, Activity, TrendingUp, AlertCircle } from 'lucide-react'
import { predictTraffic } from '../services/api'
import { SmartAreaChart } from '../components/Charts'

const junctions = [1, 2, 3, 4]
const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function CongestionGauge({ level, vehicles }) {
    const pct = Math.min(vehicles / 100, 1)
    const angle = -135 + pct * 270
    const color = level === 'Low' ? 'var(--green)' : level === 'Medium' ? 'var(--amber)' : 'var(--red)'
    const r = 80
    const cx = 100, cy = 100
    const arcLength = (pct * 270 * Math.PI * r) / 180
    const totalArc = (270 * Math.PI * r) / 180

    return (
        <div className="gauge-container">
            <svg width="200" height="150" viewBox="0 0 200 170">
                {/* Track */}
                <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={16}
                    strokeDasharray={`${totalArc} ${2 * Math.PI * r}`}
                    strokeDashoffset={(totalArc * (-135 + 270)) / 360}
                    strokeLinecap="round"
                    transform={`rotate(-135 ${cx} ${cy})`}
                />
                {/* Arc */}
                <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={16}
                    strokeDasharray={`${arcLength} ${2 * Math.PI * r}`}
                    strokeLinecap="round"
                    transform={`rotate(-135 ${cx} ${cy})`}
                    style={{ filter: `drop-shadow(0 0 8px ${color})`, transition: 'stroke-dasharray 1s ease' }}
                />
                {/* Needle */}
                <line
                    x1={cx} y1={cy}
                    x2={cx + 60 * Math.cos((angle * Math.PI) / 180)}
                    y2={cy + 60 * Math.sin((angle * Math.PI) / 180)}
                    stroke="white" strokeWidth={2} strokeLinecap="round"
                    style={{ transition: 'all 1s ease' }}
                />
                <circle cx={cx} cy={cy} r={6} fill="white" />
                {/* Labels */}
                <text x="30" y="155" textAnchor="middle" fill="var(--text-muted)" fontSize="11">Low</text>
                <text x="100" y="25" textAnchor="middle" fill="var(--text-muted)" fontSize="11">Med</text>
                <text x="170" y="155" textAnchor="middle" fill="var(--text-muted)" fontSize="11">High</text>
            </svg>
            <div style={{ marginTop: -20, textAlign: 'center' }}>
                <div style={{ fontSize: 40, fontWeight: 900, color }}>{vehicles}</div>
                <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>vehicles/hour</div>
                <div className={`badge badge-${level === 'Low' ? 'green' : level === 'Medium' ? 'amber' : 'red'}`}
                    style={{ marginTop: 8 }}>
                    {level} Congestion
                </div>
            </div>
        </div>
    )
}

function makeTrendData(baseVehicles) {
    const hours = ['06', '08', '10', '12', '14', '16', '18', '20']
    return hours.map(h => ({
        name: `${h}:00`,
        vehicles: Math.max(0, Math.round(baseVehicles + (Math.random() - 0.5) * 20 + (h === '08' || h === '18' ? 25 : 0))),
    }))
}

export default function TrafficPrediction() {
    const now = new Date()
    const [form, setForm] = useState({
        junction: '1',
        hour: String(now.getHours()),
        day: String(now.getDate()),
        month: String(now.getMonth() + 1),
        weekday: String(now.getDay()),
    })
    const [result, setResult] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [trendData, setTrendData] = useState([])

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

    async function handlePredict() {
        setLoading(true)
        setError(null)
        try {
            const res = await predictTraffic({
                junction: +form.junction, hour: +form.hour,
                day: +form.day, month: +form.month, weekday: +form.weekday,
            })
            setResult(res)
            setTrendData(makeTrendData(res.predicted_vehicles))
        } catch (e) {
            setError(e.response?.data?.detail || 'Backend not reachable. Is FastAPI running?')
        }
        setLoading(false)
    }

    return (
        <div>
            <div className="page-header">
                <h1>Traffic Prediction</h1>
                <p>Enter junction and time parameters to predict congestion level using the trained ML model</p>
            </div>

            <div className="grid-2" style={{ alignItems: 'start' }}>
                {/* Input Form */}
                <div className="card">
                    <div className="section-title"><Car size={18} color="var(--cyan)" /> Prediction Parameters</div>

                    <div className="form-group">
                        <label className="form-label">Junction ID</label>
                        <select className="form-select" id="input-junction" value={form.junction} onChange={e => set('junction', e.target.value)}>
                            {junctions.map(j => <option key={j} value={j}>Junction {j}</option>)}
                        </select>
                    </div>

                    <div className="grid-2">
                        <div className="form-group">
                            <label className="form-label">Hour (0–23)</label>
                            <input className="form-input" type="number" id="input-hour" min={0} max={23}
                                value={form.hour} onChange={e => set('hour', e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Day of Month</label>
                            <input className="form-input" type="number" id="input-day" min={1} max={31}
                                value={form.day} onChange={e => set('day', e.target.value)} />
                        </div>
                    </div>

                    <div className="grid-2">
                        <div className="form-group">
                            <label className="form-label">Month</label>
                            <select className="form-select" id="input-month" value={form.month} onChange={e => set('month', e.target.value)}>
                                {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Weekday</label>
                            <select className="form-select" id="input-weekday" value={form.weekday} onChange={e => set('weekday', e.target.value)}>
                                {days.map((d, i) => <option key={i} value={i}>{d}</option>)}
                            </select>
                        </div>
                    </div>

                    <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
                        id="btn-predict" onClick={handlePredict} disabled={loading}>
                        {loading ? 'Predicting...' : <><Activity size={16} /> Predict Traffic</>}
                    </button>

                    {error && (
                        <div className="card card-sm" style={{ marginTop: 16, borderColor: 'var(--red)', background: 'var(--red-dim)', display: 'flex', gap: 10, color: 'var(--red)' }}>
                            <AlertCircle size={16} style={{ flexShrink: 0 }} />
                            <span style={{ fontSize: 13 }}>{error}</span>
                        </div>
                    )}
                </div>

                {/* Result */}
                <div>
                    {result ? (
                        <>
                            <div className="card" style={{ marginBottom: 20 }}>
                                <div className="section-title"><TrendingUp size={18} color="var(--cyan)" /> Prediction Result</div>
                                <CongestionGauge level={result.congestion_level} vehicles={result.predicted_vehicles} />
                                <div className="divider" />
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, textAlign: 'center' }}>
                                    <div>
                                        <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Vehicles</div>
                                        <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--cyan)' }}>{result.predicted_vehicles}</div>
                                        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>per hour</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Level</div>
                                        <div style={{ fontSize: 22, fontWeight: 800, color: result.congestion_level === 'Low' ? 'var(--green)' : result.congestion_level === 'Medium' ? 'var(--amber)' : 'var(--red)' }}>
                                            {result.congestion_level}
                                        </div>
                                        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>congestion</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Confidence</div>
                                        <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--green)' }}>{Math.round((result.confidence || 0.85) * 100)}%</div>
                                        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>accuracy</div>
                                    </div>
                                </div>
                            </div>

                            <div className="chart-card">
                                <div className="chart-title">Hourly Traffic Trend</div>
                                <div className="chart-subtitle">Estimated vehicle count throughout the day</div>
                                <SmartAreaChart
                                    data={trendData}
                                    areas={[{ key: 'vehicles', color: 'var(--cyan)', name: 'Vehicles' }]}
                                    height={200}
                                />
                            </div>
                        </>
                    ) : (
                        <div className="card" style={{ textAlign: 'center', padding: '60px 24px' }}>
                            <Car size={48} color="var(--text-muted)" style={{ margin: '0 auto 16px', display: 'block' }} />
                            <div style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>No prediction yet</div>
                            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8 }}>
                                Fill in the parameters and click "Predict Traffic"
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Info Card */}
            <div className="card" style={{ marginTop: 24, display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--cyan-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Activity size={18} color="var(--cyan)" />
                </div>
                <div>
                    <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>About the Model</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        The traffic prediction model is trained on junction-level vehicle count data, using features like
                        hour of day, day of month, month, and weekday. Congestion levels are classified as:
                        Low (&lt;20 vehicles/hr), Medium (20–50), High (&gt;50).
                    </div>
                </div>
            </div>
        </div>
    )
}
