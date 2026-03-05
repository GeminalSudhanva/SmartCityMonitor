import { useState, useEffect } from 'react'
import { Settings as SettingsIcon, Key, Server, Globe, CheckCircle, XCircle, Save } from 'lucide-react'
import { getHealth } from '../services/api'

function Field({ id, label, icon: Icon, value, onChange, placeholder, type = 'text', hint }) {
    return (
        <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {Icon && <Icon size={13} color="var(--text-muted)" />} {label}
            </label>
            <input className="form-input" id={id} type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
            {hint && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{hint}</div>}
        </div>
    )
}

export default function Settings() {
    const [openweatherKey, setOpenweatherKey] = useState('')
    const [backendUrl, setBackendUrl] = useState('http://localhost:8000')
    const [lat, setLat] = useState('28.6139')
    const [lon, setLon] = useState('77.2090')
    const [saved, setSaved] = useState(false)
    const [healthStatus, setHealthStatus] = useState(null)
    const [testingConn, setTestingConn] = useState(false)

    useEffect(() => {
        setOpenweatherKey(localStorage.getItem('openweather_key') || '')
        setBackendUrl(localStorage.getItem('backend_url') || 'http://localhost:8000')
        setLat(localStorage.getItem('city_lat') || '28.6139')
        setLon(localStorage.getItem('city_lon') || '77.2090')
    }, [])

    function handleSave() {
        localStorage.setItem('openweather_key', openweatherKey)
        localStorage.setItem('backend_url', backendUrl)
        localStorage.setItem('city_lat', lat)
        localStorage.setItem('city_lon', lon)
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
    }

    async function testConnection() {
        setTestingConn(true)
        setHealthStatus(null)
        try {
            const data = await getHealth()
            setHealthStatus({ ok: true, msg: `Backend online · Model loaded: ${data.model_loaded}` })
        } catch (e) {
            setHealthStatus({ ok: false, msg: 'Cannot connect to backend. Is FastAPI running on port 8000?' })
        }
        setTestingConn(false)
    }

    return (
        <div>
            <div className="page-header">
                <h1>Settings & API Configuration</h1>
                <p>Configure API keys, backend endpoint, and location settings</p>
            </div>

            <div className="grid-2" style={{ alignItems: 'start' }}>

                {/* API Keys */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div className="card">
                        <div className="section-title"><Key size={16} color="var(--cyan)" /> API Keys</div>
                        <Field
                            id="input-openweather-key"
                            label="OpenWeather API Key"
                            icon={Globe}
                            value={openweatherKey}
                            onChange={setOpenweatherKey}
                            placeholder="Enter your OpenWeather API key..."
                            type="password"
                            hint="Required for real-time air pollution data. Get a free key at openweathermap.org"
                        />
                        <div className="card card-sm" style={{ background: openweatherKey ? 'var(--green-dim)' : 'rgba(255,255,255,0.03)', borderColor: openweatherKey ? 'var(--green)' : 'var(--border)' }}>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13 }}>
                                {openweatherKey
                                    ? <><CheckCircle size={14} color="var(--green)" /> <span style={{ color: 'var(--green)' }}>API key configured — real data will be fetched</span></>
                                    : <><XCircle size={14} color="var(--text-muted)" /> <span style={{ color: 'var(--text-muted)' }}>No key set — mock pollution data will be used</span></>
                                }
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="section-title"><Globe size={16} color="var(--cyan)" /> NASA POWER API</div>
                        <div className="card card-sm" style={{ background: 'var(--green-dim)', borderColor: 'var(--green)' }}>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13 }}>
                                <CheckCircle size={14} color="var(--green)" />
                                <span style={{ color: 'var(--green)' }}>NASA POWER API is free and requires no API key.</span>
                            </div>
                        </div>
                        <div style={{ marginTop: 12, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                            NASA POWER provides satellite-based meteorological data including temperature, humidity, wind speed,
                            and precipitation. The API is publicly accessible without authentication.
                        </div>
                    </div>
                </div>

                {/* Backend & Location */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div className="card">
                        <div className="section-title"><Server size={16} color="var(--cyan)" /> Backend Configuration</div>
                        <Field
                            id="input-backend-url"
                            label="FastAPI Backend URL"
                            icon={Server}
                            value={backendUrl}
                            onChange={setBackendUrl}
                            placeholder="http://localhost:8000"
                            hint="The base URL of your FastAPI backend server"
                        />

                        <button className="btn btn-ghost btn-sm" id="btn-test-connection" onClick={testConnection} disabled={testingConn}
                            style={{ marginBottom: 12 }}>
                            {testingConn ? 'Testing...' : '⚡ Test Connection'}
                        </button>

                        {healthStatus && (
                            <div className="card card-sm" style={{
                                background: healthStatus.ok ? 'var(--green-dim)' : 'var(--red-dim)',
                                borderColor: healthStatus.ok ? 'var(--green)' : 'var(--red)',
                            }}>
                                <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13 }}>
                                    {healthStatus.ok
                                        ? <CheckCircle size={14} color="var(--green)" />
                                        : <XCircle size={14} color="var(--red)" />
                                    }
                                    <span style={{ color: healthStatus.ok ? 'var(--green)' : 'var(--red)' }}>{healthStatus.msg}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="card">
                        <div className="section-title"><Globe size={16} color="var(--cyan)" /> City Location</div>
                        <div className="grid-2">
                            <Field id="input-lat" label="Latitude" value={lat} onChange={setLat} placeholder="28.6139" hint="Default: New Delhi" />
                            <Field id="input-lon" label="Longitude" value={lon} onChange={setLon} placeholder="77.2090" />
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                            Location is used for OpenWeather pollution and NASA POWER environment data.
                        </div>
                    </div>

                    <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}
                        id="btn-save-settings" onClick={handleSave}>
                        {saved ? <><CheckCircle size={16} /> Saved!</> : <><Save size={16} /> Save Settings</>}
                    </button>
                </div>
            </div>

            {/* How to run backend */}
            <div className="card" style={{ marginTop: 24 }}>
                <div className="section-title"><Server size={16} color="var(--cyan)" /> How to Start the Backend</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13, color: 'var(--text-secondary)' }}>
                    {[
                        { step: '1', cmd: 'cd "D:\\\\Web apps\\\\AI Environment Analysis\\\\backend"', desc: 'Navigate to backend folder' },
                        { step: '2', cmd: 'pip install -r requirements.txt', desc: 'Install Python dependencies' },
                        { step: '3', cmd: 'uvicorn main:app --reload --port 8000', desc: 'Start FastAPI server (loads ML model on startup)' },
                    ].map(({ step, cmd, desc }) => (
                        <div key={step} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                            <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--cyan-dim)', color: 'var(--cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{step}</div>
                            <div>
                                <div style={{ color: 'var(--text-muted)', fontSize: 11, marginBottom: 4 }}>{desc}</div>
                                <code style={{ background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: 4, fontSize: 12, color: 'var(--cyan)', display: 'block' }}>{cmd}</code>
                            </div>
                        </div>
                    ))}
                </div>
                <div style={{ marginTop: 16, padding: 12, background: 'var(--amber-dim)', borderRadius: 8, fontSize: 12, color: 'var(--amber)', lineHeight: 1.6 }}>
                    ⚠️ The ML model (~637MB) will be loaded at startup — first load may take 30–60 seconds.
                </div>
            </div>
        </div>
    )
}
