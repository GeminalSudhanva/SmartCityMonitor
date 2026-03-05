import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Activity, Wind, Leaf, Cpu, ArrowRight, Zap, Database, Globe } from 'lucide-react'

const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, delay, ease: 'easeOut' },
})

const features = [
    { icon: Activity, color: 'var(--cyan)', title: 'Traffic Prediction', desc: 'ML-powered congestion forecasting using real junction data and time-of-day patterns.' },
    { icon: Wind, color: 'var(--green)', title: 'Pollution Monitoring', desc: 'Live PM2.5, PM10, AQI and pollutant levels via OpenWeather Air Quality API.' },
    { icon: Leaf, color: 'var(--amber)', title: 'Environmental Insights', desc: 'Temperature, humidity, wind and precipitation from NASA POWER satellite data.' },
    { icon: Cpu, color: 'var(--purple)', title: 'Smart City Simulation', desc: 'Interactive 3D city view with real-time traffic and environmental scenario modeling.' },
]

const techs = [
    { icon: Zap, label: 'Machine Learning', desc: 'Scikit-learn RandomForest traffic model' },
    { icon: Database, label: 'FastAPI Backend', desc: 'High-performance async REST API' },
    { icon: Globe, label: 'OpenWeather API', desc: 'Real-time air pollution data' },
    { icon: Leaf, label: 'NASA POWER API', desc: 'Satellite environmental analytics' },
]

export default function LandingPage() {
    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', overflowX: 'hidden' }}>

            {/* ── Navbar ── */}
            <nav style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '20px 60px', borderBottom: '1px solid var(--border)',
                background: 'rgba(10,14,26,0.8)', backdropFilter: 'blur(10px)',
                position: 'sticky', top: 0, zIndex: 100,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                        width: 32, height: 32, borderRadius: 8,
                        background: 'linear-gradient(135deg, var(--cyan), var(--green))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <Activity size={18} color="#000" />
                    </div>
                    <span style={{ fontWeight: 800, fontSize: 16, color: 'var(--text-primary)' }}>SmartCity Monitor</span>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                    <Link to="/dashboard" className="btn btn-secondary btn-sm" id="nav-dashboard">Dashboard</Link>
                    <Link to="/reports" className="btn btn-primary btn-sm" id="nav-analytics">Analytics</Link>
                </div>
            </nav>

            {/* ── Hero ── */}
            <section style={{
                minHeight: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '60px 60px', position: 'relative', overflow: 'hidden',
            }}>
                {/* Background blobs */}
                <div style={{
                    position: 'absolute', width: 600, height: 600, borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(0,212,255,0.08) 0%, transparent 70%)',
                    top: -100, left: -100, pointerEvents: 'none',
                }} />
                <div style={{
                    position: 'absolute', width: 500, height: 500, borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(0,255,136,0.06) 0%, transparent 70%)',
                    bottom: -100, right: -50, pointerEvents: 'none',
                }} />

                <div style={{ maxWidth: 900, textAlign: 'center', zIndex: 1 }}>
                    <motion.div {...fadeUp(0)}>
                        <div className="badge badge-cyan" style={{ margin: '0 auto 20px', display: 'inline-flex' }}>
                            ● AI-Powered Smart City Platform
                        </div>
                    </motion.div>

                    <motion.h1 {...fadeUp(0.1)} style={{
                        fontSize: 'clamp(36px, 6vw, 72px)', fontWeight: 900, lineHeight: 1.1,
                        marginBottom: 24, letterSpacing: '-1px',
                    }}>
                        <span style={{ color: 'var(--text-primary)' }}>AI Smart City</span>
                        <br />
                        <span style={{
                            background: 'linear-gradient(135deg, var(--cyan), var(--green))',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                        }}>
                            Traffic & Environmental
                        </span>
                        <br />
                        <span style={{ color: 'var(--text-primary)' }}>Monitoring System</span>
                    </motion.h1>

                    <motion.p {...fadeUp(0.2)} style={{
                        fontSize: 18, color: 'var(--text-secondary)', maxWidth: 600, margin: '0 auto 40px',
                        lineHeight: 1.7,
                    }}>
                        Harness machine learning, satellite data, and real-time APIs to predict traffic congestion,
                        monitor air quality, and analyze environmental conditions across your city.
                    </motion.p>

                    <motion.div {...fadeUp(0.3)} style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link to="/dashboard" className="btn btn-primary btn-lg" id="hero-launch-dashboard">
                            Launch Dashboard <ArrowRight size={18} />
                        </Link>
                        <Link to="/reports" className="btn btn-secondary btn-lg" id="hero-view-analytics">
                            View Analytics
                        </Link>
                    </motion.div>

                    {/* Stats row */}
                    <motion.div {...fadeUp(0.4)} style={{
                        display: 'flex', gap: 32, justifyContent: 'center', marginTop: 60, flexWrap: 'wrap',
                    }}>
                        {[
                            { num: '94%', label: 'Prediction Accuracy' },
                            { num: 'Real-time', label: 'Air Quality Data' },
                            { num: '30+', label: 'Env Parameters' },
                            { num: '3D', label: 'City Simulation' },
                        ].map(({ num, label }) => (
                            <div key={label} style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--cyan)' }}>{num}</div>
                                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>{label}</div>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ── Features ── */}
            <section style={{ padding: '80px 60px', maxWidth: 1200, margin: '0 auto' }}>
                <motion.div {...fadeUp(0)} style={{ textAlign: 'center', marginBottom: 60 }}>
                    <div className="badge badge-green" style={{ margin: '0 auto 12px', display: 'inline-flex' }}>
                        Platform Features
                    </div>
                    <h2 style={{ fontSize: 40, fontWeight: 800, color: 'var(--text-primary)' }}>
                        Everything you need to monitor a smart city
                    </h2>
                </motion.div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
                    {features.map(({ icon: Icon, color, title, desc }, i) => (
                        <motion.div key={title} {...fadeUp(i * 0.1)}>
                            <div className="card" style={{ height: '100%', cursor: 'default' }}>
                                <div style={{
                                    width: 52, height: 52, borderRadius: 14, marginBottom: 16,
                                    background: `${color}18`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <Icon size={24} color={color} />
                                </div>
                                <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>{title}</h3>
                                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ── Technology ── */}
            <section style={{
                padding: '80px 60px', background: 'var(--bg-secondary)',
                borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)',
            }}>
                <div style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
                    <div className="badge badge-amber" style={{ margin: '0 auto 12px', display: 'inline-flex' }}>
                        Technology Stack
                    </div>
                    <h2 style={{ fontSize: 36, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 48 }}>
                        Built with cutting-edge technologies
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
                        {techs.map(({ icon: Icon, label, desc }) => (
                            <div key={label} className="card card-sm" style={{ textAlign: 'left', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                                <div style={{
                                    width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                                    background: 'var(--cyan-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <Icon size={18} color="var(--cyan)" />
                                </div>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{label}</div>
                                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA ── */}
            <section style={{ padding: '100px 60px', textAlign: 'center' }}>
                <motion.div {...fadeUp(0)}>
                    <h2 style={{ fontSize: 42, fontWeight: 900, color: 'var(--text-primary)', marginBottom: 16 }}>
                        Ready to monitor your city?
                    </h2>
                    <p style={{ fontSize: 16, color: 'var(--text-secondary)', marginBottom: 40 }}>
                        Start with the dashboard or configure your API keys in Settings.
                    </p>
                    <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
                        <Link to="/dashboard" className="btn btn-primary btn-lg" id="cta-launch">Launch Dashboard</Link>
                        <Link to="/settings" className="btn btn-secondary btn-lg" id="cta-settings">Configure APIs</Link>
                    </div>
                </motion.div>
            </section>

            {/* ── Footer ── */}
            <footer style={{
                padding: '24px 60px', borderTop: '1px solid var(--border)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                color: 'var(--text-muted)', fontSize: 13,
            }}>
                <span>© 2026 SmartCity Monitor — AI Traffic & Environment Platform</span>
                <span>FastAPI · React · Three.js · Recharts</span>
            </footer>
        </div>
    )
}
