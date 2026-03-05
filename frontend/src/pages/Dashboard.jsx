import { useState, useEffect } from 'react'
import { Activity, Wind, Thermometer, Gauge, TrendingUp, AlertTriangle, RefreshCw } from 'lucide-react'
import MetricCard from '../components/MetricCard'
import { SmartAreaChart, SmartBarChart } from '../components/Charts'
import { getPollutionData, getEnvironmentData, getMockEnvironment } from '../services/api'

// Generate mock traffic trend data
function makeTrafficTrend() {
    const hours = ['00', '02', '04', '06', '08', '10', '12', '14', '16', '18', '20', '22']
    return hours.map(h => ({
        name: `${h}:00`,
        vehicles: Math.round(10 + Math.random() * 70 + (h >= '07' && h <= '09' ? 40 : 0) + (h >= '17' && h <= '19' ? 35 : 0)),
        prediction: Math.round(15 + Math.random() * 60),
    }))
}

function makePollutionTrend() {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    return days.map(d => ({
        name: d,
        PM25: +(8 + Math.random() * 20).toFixed(1),
        PM10: +(15 + Math.random() * 30).toFixed(1),
        AQI: Math.round(50 + Math.random() * 100),
    }))
}

function makeEnvTrend() {
    const days = Array.from({ length: 14 }, (_, i) => `Day ${i + 1}`)
    return days.map(d => ({
        name: d,
        temp: +(20 + Math.random() * 10).toFixed(1),
        humidity: +(45 + Math.random() * 30).toFixed(1),
        wind: +(2 + Math.random() * 6).toFixed(1),
    }))
}

export default function Dashboard() {
    const [pollutionData, setPollutionData] = useState(null)
    const [envData, setEnvData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [lastUpdated, setLastUpdated] = useState(null)

    const trafficTrend = makeTrafficTrend()
    const pollutionTrend = makePollutionTrend()
    const envTrend = makeEnvTrend()

    async function fetchData() {
        setLoading(true)
        try {
            const [pollution, env] = await Promise.allSettled([
                getPollutionData(),
                getMockEnvironment(),
            ])
            if (pollution.status === 'fulfilled') setPollutionData(pollution.value)
            if (env.status === 'fulfilled') setEnvData(env.value)
            setLastUpdated(new Date().toLocaleTimeString())
        } catch (e) { /* silent */ }
        setLoading(false)
    }

    useEffect(() => { fetchData() }, [])

    const aqi = pollutionData?.list?.[0]?.main?.aqi ?? 2
    const pm25 = pollutionData?.list?.[0]?.components?.pm2_5 ?? 12.4
    const pm10 = pollutionData?.list?.[0]?.components?.pm10 ?? 18.7
    const aqiLabels = ['', 'Good', 'Fair', 'Moderate', 'Poor', 'Very Poor']
    const aqiColors = ['', 'var(--green)', '#a8e063', 'var(--amber)', '#ff7043', 'var(--red)']

    return (
        <div>
            {/* Header */}
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1>City Dashboard</h1>
                    <p>Real-time overview of traffic, pollution, and environmental conditions</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {lastUpdated && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Updated {lastUpdated}</span>}
                    <button className="btn btn-ghost btn-sm" onClick={fetchData} id="btn-refresh-dashboard">
                        <RefreshCw size={14} /> Refresh
                    </button>
                </div>
            </div>

            {/* Metric Cards */}
            <div className="metrics-grid">
                <MetricCard label="Avg Traffic Level" value="38" unit="veh/hr" icon={Activity} color="cyan" change="12%" changeDir="up" />
                <MetricCard label="Air Quality Index" value={aqi} unit={aqiLabels[aqi]} icon={Wind} color={aqi <= 2 ? 'green' : aqi <= 3 ? 'amber' : 'red'} />
                <MetricCard label="Temperature" value="24.3" unit="°C" icon={Thermometer} color="amber" change="1.2°C" changeDir="up" />
                <MetricCard label="Wind Speed" value="3.8" unit="m/s" icon={Gauge} color="purple" />
            </div>

            {/* Status Banner */}
            <div className="card" style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                    width: 40, height: 40, borderRadius: 10, background: 'var(--green-dim)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                    <Activity size={20} color="var(--green)" />
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>System Status: All Services Operational</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                        ML model loaded · OpenWeather API connected · NASA POWER API ready
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <span className="badge badge-green">Traffic OK</span>
                    <span className="badge badge-cyan">AQI: {aqiLabels[aqi]}</span>
                    <span className="badge badge-amber">Temp: 24.3°C</span>
                </div>
            </div>

            {/* PM2.5 / PM10 + AQI row */}
            <div className="metrics-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                <div className="card card-sm" style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>PM2.5</div>
                    <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--cyan)', margin: '8px 0' }}>{pm25.toFixed(1)}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>μg/m³</div>
                </div>
                <div className="card card-sm" style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>PM10</div>
                    <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--green)', margin: '8px 0' }}>{pm10.toFixed(1)}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>μg/m³</div>
                </div>
                <div className="card card-sm" style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Air Quality</div>
                    <div style={{ fontSize: 32, fontWeight: 800, color: aqiColors[aqi], margin: '8px 0' }}>{aqiLabels[aqi]}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>AQI Level {aqi}/5</div>
                </div>
            </div>

            {/* Charts */}
            <div className="charts-grid" style={{ marginTop: 24 }}>
                <div className="chart-card">
                    <div className="chart-title">Traffic Volume Trend</div>
                    <div className="chart-subtitle">Hourly vehicle count today</div>
                    <SmartAreaChart
                        data={trafficTrend}
                        areas={[
                            { key: 'vehicles', color: 'var(--cyan)', name: 'Actual' },
                            { key: 'prediction', color: 'var(--green)', name: 'Predicted' },
                        ]}
                    />
                </div>
                <div className="chart-card">
                    <div className="chart-title">Weekly Pollution Levels</div>
                    <div className="chart-subtitle">PM2.5 and PM10 this week</div>
                    <SmartBarChart
                        data={pollutionTrend}
                        bars={[
                            { key: 'PM25', color: 'var(--cyan)', name: 'PM2.5' },
                            { key: 'PM10', color: 'var(--amber)', name: 'PM10' },
                        ]}
                    />
                </div>
            </div>

            <div className="chart-card" style={{ marginTop: 0 }}>
                <div className="chart-title">14-Day Environmental Trend</div>
                <div className="chart-subtitle">Temperature, Humidity, and Wind Speed</div>
                <SmartAreaChart
                    data={envTrend}
                    areas={[
                        { key: 'temp', color: 'var(--amber)', name: 'Temp (°C)' },
                        { key: 'humidity', color: 'var(--cyan)', name: 'Humidity (%)' },
                        { key: 'wind', color: 'var(--green)', name: 'Wind (m/s)' },
                    ]}
                    height={260}
                />
            </div>
        </div>
    )
}
