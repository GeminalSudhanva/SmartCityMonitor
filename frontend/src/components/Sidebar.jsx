import { NavLink } from 'react-router-dom'
import {
    LayoutDashboard, Car, Wind, Leaf, Cpu, BarChart3, Settings, Zap
} from 'lucide-react'

const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/traffic', icon: Car, label: 'Traffic Prediction' },
    { to: '/pollution', icon: Wind, label: 'Pollution' },
    { to: '/environment', icon: Leaf, label: 'Environment' },
    { to: '/simulation', icon: Cpu, label: 'Simulation' },
    { to: '/reports', icon: BarChart3, label: 'Reports' },
    { to: '/settings', icon: Settings, label: 'Settings' },
]

export default function Sidebar() {
    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <h2>SmartCity<br />Monitor</h2>
                <span>AI Traffic & Environment</span>
            </div>

            <nav className="nav-section">
                <div className="nav-section-label">Navigation</div>
                {navItems.map(({ to, icon: Icon, label }) => (
                    <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    >
                        <Icon className="nav-icon" size={18} />
                        {label}
                    </NavLink>
                ))}
            </nav>

            <div className="sidebar-footer">
                <div className="status-badge">
                    <div className="status-dot" />
                    <span>System Online</span>
                </div>
                <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text-muted)' }}>
                    v1.0.0 · FastAPI Backend
                </div>
            </div>
        </aside>
    )
}
