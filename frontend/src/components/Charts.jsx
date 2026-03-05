import {
    ResponsiveContainer, LineChart, Line, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, AreaChart, Area
} from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
        <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            padding: '10px 14px',
            fontSize: 13,
        }}>
            <div style={{ color: 'var(--text-secondary)', marginBottom: 6 }}>{label}</div>
            {payload.map((p, i) => (
                <div key={i} style={{ color: p.color, fontWeight: 600 }}>
                    {p.name}: {typeof p.value === 'number' ? p.value.toFixed(2) : p.value}
                </div>
            ))}
        </div>
    )
}

const axisStyle = { fill: 'var(--text-muted)', fontSize: 11 }
const gridStyle = { stroke: 'rgba(255,255,255,0.04)' }

export function SmartLineChart({ data, lines, height = 280 }) {
    return (
        <ResponsiveContainer width="100%" height={height}>
            <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" {...gridStyle} />
                <XAxis dataKey="name" tick={axisStyle} />
                <YAxis tick={axisStyle} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12, color: 'var(--text-secondary)' }} />
                {lines.map(({ key, color, name }) => (
                    <Line
                        key={key} type="monotone" dataKey={key} name={name || key}
                        stroke={color} strokeWidth={2} dot={false} activeDot={{ r: 4 }}
                    />
                ))}
            </LineChart>
        </ResponsiveContainer>
    )
}

export function SmartAreaChart({ data, areas, height = 280 }) {
    return (
        <ResponsiveContainer width="100%" height={height}>
            <AreaChart data={data}>
                <defs>
                    {areas.map(({ key, color }) => (
                        <linearGradient key={key} id={`grad-${key}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={color} stopOpacity={0} />
                        </linearGradient>
                    ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" {...gridStyle} />
                <XAxis dataKey="name" tick={axisStyle} />
                <YAxis tick={axisStyle} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12, color: 'var(--text-secondary)' }} />
                {areas.map(({ key, color, name }) => (
                    <Area
                        key={key} type="monotone" dataKey={key} name={name || key}
                        stroke={color} fill={`url(#grad-${key})`} strokeWidth={2}
                    />
                ))}
            </AreaChart>
        </ResponsiveContainer>
    )
}

export function SmartBarChart({ data, bars, height = 280 }) {
    return (
        <ResponsiveContainer width="100%" height={height}>
            <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" {...gridStyle} />
                <XAxis dataKey="name" tick={axisStyle} />
                <YAxis tick={axisStyle} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12, color: 'var(--text-secondary)' }} />
                {bars.map(({ key, color, name }) => (
                    <Bar key={key} dataKey={key} name={name || key} fill={color} radius={[4, 4, 0, 0]} />
                ))}
            </BarChart>
        </ResponsiveContainer>
    )
}
