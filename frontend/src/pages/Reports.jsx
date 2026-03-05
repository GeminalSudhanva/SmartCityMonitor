import { useState } from 'react'
import { BarChart3, TrendingUp, Wind, Leaf, Download, Calendar } from 'lucide-react'
import { SmartAreaChart, SmartBarChart, SmartLineChart } from '../components/Charts'

function makeDailyTraffic() {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    const junctions = [1, 2, 3, 4]
    return days.map(d => {
        const obj = { name: d }
        junctions.forEach(j => { obj[`J${j}`] = Math.round(15 + Math.random() * 55) })
        return obj
    })
}

function makeHourlyPattern() {
    const hrs = ['00', '03', '06', '07', '08', '09', '10', '12', '14', '16', '17', '18', '19', '21', '23']
    return hrs.map(h => ({
        name: `${h}:00`,
        avg: Math.round(5 + Math.random() * 60 + (['07', '08', '09', '17', '18', '19'].includes(h) ? 40 : 0)),
        peak: Math.round(10 + Math.random() * 80 + (['07', '08', '09', '17', '18', '19'].includes(h) ? 50 : 0)),
    }))
}

function makePollutionWeekly() {
    const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4']
    return weeks.map(w => ({
        name: w,
        PM25: +(10 + Math.random() * 20).toFixed(1),
        PM10: +(18 + Math.random() * 25).toFixed(1),
        AQI: Math.round(50 + Math.random() * 100),
    }))
}

function makeCorrelation() {
    return Array.from({ length: 20 }, (_, i) => ({
        name: `Sample ${i + 1}`,
        traffic: Math.round(10 + Math.random() * 70),
        pollution: +(8 + Math.random() * 30).toFixed(1),
        temp: +(18 + Math.random() * 15).toFixed(1),
    }))
}

const daily = makeDailyTraffic()
const hourly = makeHourlyPattern()
const weeklyPollution = makePollutionWeekly()
const corr = makeCorrelation()

export default function Reports() {
    const [period, setPeriod] = useState('week')

    function handleExport() {
        const obj = { daily, hourly, weeklyPollution, corr, exportedAt: new Date().toISOString() }
        const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; a.download = 'smartcity_report.json'; a.click()
        URL.revokeObjectURL(url)
    }

    return (
        <div>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1>Reports & Analytics</h1>
                    <p>Comprehensive traffic patterns, pollution trends, and environmental correlation analysis</p>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    <div style={{ display: 'flex', gap: 4 }}>
                        {['week', 'month'].map(p => (
                            <button key={p} className={`btn btn-sm ${period === p ? 'btn-primary' : 'btn-ghost'}`}
                                id={`btn-period-${p}`} onClick={() => setPeriod(p)}>
                                {p === 'week' ? 'This Week' : 'This Month'}
                            </button>
                        ))}
                    </div>
                    <button className="btn btn-secondary btn-sm" id="btn-export-report" onClick={handleExport}>
                        <Download size={14} /> Export JSON
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="metrics-grid" style={{ marginBottom: 24 }}>
                {[
                    { label: 'Avg Traffic', value: '38', unit: 'veh/hr', color: 'cyan', icon: TrendingUp },
                    { label: 'Peak Hour', value: '8AM', unit: '& 6PM', color: 'amber', icon: Calendar },
                    { label: 'Avg PM2.5', value: '14.2', unit: 'μg/m³', color: 'green', icon: Wind },
                    { label: 'Avg Temp', value: '23.8', unit: '°C', color: 'purple', icon: Leaf },
                ].map(({ label, value, unit, color, icon: Icon }) => (
                    <div key={label} className="metric-card" style={{ '--accent-color': `var(--${color})` }}>
                        <div className="metric-icon" style={{ background: `var(--${color}-dim)` }}>
                            <Icon size={18} color={`var(--${color})`} />
                        </div>
                        <div className="metric-label">{label}</div>
                        <div className="metric-value">{value}<span className="metric-unit" style={{ fontSize: 13, marginLeft: 4 }}>{unit}</span></div>
                    </div>
                ))}
            </div>

            {/* Daily Traffic per Junction */}
            <div className="chart-card" style={{ marginBottom: 20 }}>
                <div className="chart-title">Daily Traffic by Junction</div>
                <div className="chart-subtitle">Vehicle counts across 4 junctions — {period === 'week' ? 'this week' : 'this month'}</div>
                <SmartBarChart
                    data={daily}
                    bars={[
                        { key: 'J1', color: 'var(--cyan)', name: 'Junction 1' },
                        { key: 'J2', color: 'var(--green)', name: 'Junction 2' },
                        { key: 'J3', color: 'var(--amber)', name: 'Junction 3' },
                        { key: 'J4', color: 'var(--purple)', name: 'Junction 4' },
                    ]}
                    height={300}
                />
            </div>

            <div className="charts-grid" style={{ marginBottom: 20 }}>
                <div className="chart-card">
                    <div className="chart-title">Hourly Traffic Pattern</div>
                    <div className="chart-subtitle">Average vs peak vehicle count by hour</div>
                    <SmartAreaChart data={hourly} areas={[
                        { key: 'peak', color: 'var(--red)', name: 'Peak' },
                        { key: 'avg', color: 'var(--cyan)', name: 'Average' },
                    ]} />
                </div>

                <div className="chart-card">
                    <div className="chart-title">Weekly Pollution Trend</div>
                    <div className="chart-subtitle">PM2.5, PM10, and AQI week by week</div>
                    <SmartBarChart data={weeklyPollution} bars={[
                        { key: 'PM25', color: 'var(--cyan)', name: 'PM2.5' },
                        { key: 'PM10', color: 'var(--amber)', name: 'PM10' },
                    ]} />
                </div>
            </div>

            {/* Correlation Chart */}
            <div className="chart-card" style={{ marginBottom: 20 }}>
                <div className="chart-title">Traffic-Pollution Correlation</div>
                <div className="chart-subtitle">How traffic levels relate to pollution and temperature over 20 samples</div>
                <SmartLineChart data={corr} lines={[
                    { key: 'traffic', color: 'var(--cyan)', name: 'Traffic (veh/hr)' },
                    { key: 'pollution', color: 'var(--red)', name: 'PM2.5 (μg/m³)' },
                    { key: 'temp', color: 'var(--amber)', name: 'Temp (°C)' },
                ]} height={260} />
            </div>

            {/* Insight Cards */}
            <div className="grid-3">
                {[
                    { title: 'Peak Traffic Hours', desc: 'Morning rush (7–9 AM) and evening rush (5–7 PM) show 2× average vehicle counts.', color: 'cyan', icon: TrendingUp },
                    { title: 'Pollution Hotspot', desc: 'PM2.5 levels are highest on weekday mornings correlating with traffic peaks.', color: 'amber', icon: Wind },
                    { title: 'Weekend Effect', desc: 'Saturday/Sunday traffic is 35% lower, resulting in 20% better air quality scores.', color: 'green', icon: Leaf },
                ].map(({ title, desc, color, icon: Icon }) => (
                    <div key={title} className="card">
                        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                            <div style={{ width: 36, height: 36, borderRadius: 9, background: `var(--${color}-dim)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <Icon size={16} color={`var(--${color})`} />
                            </div>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 6 }}>{title}</div>
                                <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{desc}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
