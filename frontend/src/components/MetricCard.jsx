export default function MetricCard({ label, value, unit, icon: Icon, color = 'cyan', change, changeDir }) {
    const colors = {
        cyan: { accent: 'var(--cyan)', bg: 'var(--cyan-dim)' },
        green: { accent: 'var(--green)', bg: 'var(--green-dim)' },
        amber: { accent: 'var(--amber)', bg: 'var(--amber-dim)' },
        red: { accent: 'var(--red)', bg: 'var(--red-dim)' },
        purple: { accent: 'var(--purple)', bg: 'var(--purple-dim)' },
    }
    const c = colors[color] || colors.cyan

    return (
        <div className="metric-card" style={{ '--accent-color': c.accent }}>
            {Icon && (
                <div className="metric-icon" style={{ background: c.bg }}>
                    <Icon size={20} color={c.accent} />
                </div>
            )}
            <div className="metric-label">{label}</div>
            <div className="metric-value">
                {value}
                {unit && <span className="metric-unit" style={{ fontSize: 14, marginLeft: 4 }}>{unit}</span>}
            </div>
            {change !== undefined && (
                <div className={`metric-change ${changeDir}`}>
                    {changeDir === 'up' ? '↑' : '↓'} {change}
                </div>
            )}
        </div>
    )
}
