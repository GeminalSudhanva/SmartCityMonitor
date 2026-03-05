import { useRef, useEffect, useState, useCallback } from 'react'
import * as THREE from 'three'
import { Cpu, Play, RotateCcw, Building2, MapPin } from 'lucide-react'
import { predictTraffic } from '../services/api'

const junctions = [1, 2, 3, 4]
const timeSlots = ['Morning Rush (8AM)', 'Midday (12PM)', 'Evening Rush (6PM)', 'Night (11PM)']
const timeMap = { 0: 8, 1: 12, 2: 18, 3: 23 }

function CityScene({ congestionLevel, density }) {
    const mountRef = useRef(null)
    const sceneRef = useRef({})

    useEffect(() => {
        const el = mountRef.current
        if (!el) return
        const w = el.clientWidth, h = el.clientHeight

        // Renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
        renderer.setSize(w, h)
        renderer.setPixelRatio(window.devicePixelRatio)
        renderer.shadowMap.enabled = true
        el.appendChild(renderer.domElement)

        // Scene
        const scene = new THREE.Scene()
        scene.background = new THREE.Color(0x0a0e1a)
        scene.fog = new THREE.FogExp2(0x0a0e1a, 0.012)

        // Camera
        const camera = new THREE.PerspectiveCamera(55, w / h, 0.1, 1000)
        camera.position.set(0, 18, 28)
        camera.lookAt(0, 0, 0)

        // Lights
        scene.add(new THREE.AmbientLight(0x334466, 0.8))
        const dirLight = new THREE.DirectionalLight(0x88ccff, 1.2)
        dirLight.position.set(10, 20, 10)
        dirLight.castShadow = true
        scene.add(dirLight)

        // Ground
        const ground = new THREE.Mesh(
            new THREE.PlaneGeometry(60, 60),
            new THREE.MeshLambertMaterial({ color: 0x0d1220 })
        )
        ground.rotation.x = -Math.PI / 2
        ground.receiveShadow = true
        scene.add(ground)

        // Road color based on congestion
        const roadColor = congestionLevel === 'Low' ? 0x00cc66
            : congestionLevel === 'Medium' ? 0xffaa00 : 0xff3355

        // Roads
        const roadMat = new THREE.MeshLambertMaterial({ color: roadColor, emissive: roadColor, emissiveIntensity: 0.15 })
            ;[
                [0, 0, 0, 60, 4, 0.1],   // horizontal
                [0, 0, 0, 4, 0.1, 60],   // vertical
            ].forEach(([x, y, z, rx, ry, rz]) => {
                const mesh = new THREE.Mesh(new THREE.BoxGeometry(rx, ry, rz), roadMat)
                mesh.position.set(x, y, z)
                scene.add(mesh)
            })

        // Buildings
        const buildingColors = [0x1a2340, 0x1e2845, 0x162035, 0x1c273f]
        const positions = [
            [-10, 8], [-10, -8], [10, 8], [10, -8],
            [-18, 5], [-18, -5], [18, 5], [18, -5],
            [-14, 15], [14, 15], [-14, -15], [14, -15],
        ]
        positions.forEach(([x, z]) => {
            const h = 4 + Math.random() * 12
            const w2 = 2 + Math.random() * 3
            const mesh = new THREE.Mesh(
                new THREE.BoxGeometry(w2, h, w2),
                new THREE.MeshLambertMaterial({ color: buildingColors[Math.floor(Math.random() * buildingColors.length)] })
            )
            mesh.position.set(x, h / 2, z)
            mesh.castShadow = true
            scene.add(mesh)

            // Window dots
            for (let i = 0; i < 8; i++) {
                const win = new THREE.Mesh(
                    new THREE.PlaneGeometry(0.2, 0.2),
                    new THREE.MeshBasicMaterial({ color: Math.random() > 0.4 ? 0xffff88 : 0x334455 })
                )
                win.position.set(x + w2 / 2 + 0.01, Math.random() * h * 0.8 + 0.5, z + (Math.random() - 0.5) * w2 * 0.8)
                win.rotation.y = Math.PI / 2
                scene.add(win)
            }
        })

        // Traffic particles
        const numCars = Math.round(5 + density * 25)
        const carGeo = new THREE.BoxGeometry(0.5, 0.25, 1)
        const cars = []
        for (let i = 0; i < numCars; i++) {
            const isHoriz = Math.random() > 0.5
            const carMat = new THREE.MeshLambertMaterial({
                color: [0xff4444, 0x4488ff, 0xffcc00, 0x88ff44][Math.floor(Math.random() * 4)]
            })
            const car = new THREE.Mesh(carGeo, carMat)
            car.position.set(isHoriz ? (Math.random() - 0.5) * 56 : (Math.random() < 0.5 ? -1 : 1), 0.2, isHoriz ? (Math.random() < 0.5 ? -1 : 1) : (Math.random() - 0.5) * 56)
            car.rotation.y = isHoriz ? 0 : Math.PI / 2
            car.userData = { speed: (0.05 + Math.random() * 0.1) * (congestionLevel === 'High' ? 0.3 : 1), horiz: isHoriz, dir: Math.random() > 0.5 ? 1 : -1 }
            scene.add(car)
            cars.push(car)
        }

        let frameId
        const animate = () => {
            frameId = requestAnimationFrame(animate)
            cars.forEach(car => {
                if (car.userData.horiz) {
                    car.position.x += car.userData.speed * car.userData.dir
                    if (Math.abs(car.position.x) > 28) car.position.x = -car.position.x
                } else {
                    car.position.z += car.userData.speed * car.userData.dir
                    if (Math.abs(car.position.z) > 28) car.position.z = -car.position.z
                }
            })
            camera.position.x = Math.sin(Date.now() * 0.0003) * 5
            camera.lookAt(0, 0, 0)
            renderer.render(scene, camera)
        }
        animate()

        sceneRef.current = { renderer, frameId }

        const onResize = () => {
            const w2 = el.clientWidth, h2 = el.clientHeight
            camera.aspect = w2 / h2
            camera.updateProjectionMatrix()
            renderer.setSize(w2, h2)
        }
        window.addEventListener('resize', onResize)

        return () => {
            cancelAnimationFrame(frameId)
            window.removeEventListener('resize', onResize)
            el.removeChild(renderer.domElement)
            renderer.dispose()
        }
    }, [congestionLevel, density])

    return <div ref={mountRef} style={{ width: '100%', height: '100%', borderRadius: 12, overflow: 'hidden' }} />
}

export default function Simulation() {
    const [junction, setJunction] = useState('1')
    const [timeSlot, setTimeSlot] = useState('0')
    const [density, setDensity] = useState(0.5)
    const [result, setResult] = useState(null)
    const [running, setRunning] = useState(false)
    const [loading, setLoading] = useState(false)

    async function runSimulation() {
        setLoading(true)
        const hour = timeMap[+timeSlot]
        const now = new Date()
        try {
            const res = await predictTraffic({
                junction: +junction, hour, day: now.getDate(),
                month: now.getMonth() + 1, weekday: now.getDay()
            })
            setResult(res)
            setRunning(true)
        } catch (e) {
            // fallback demo mode
            setResult({ predicted_vehicles: Math.round(density * 80), congestion_level: density > 0.7 ? 'High' : density > 0.4 ? 'Medium' : 'Low' })
            setRunning(true)
        }
        setLoading(false)
    }

    function reset() {
        setRunning(false)
        setResult(null)
    }

    const congestionColor = !result ? 'var(--cyan)' : result.congestion_level === 'Low' ? 'var(--green)' : result.congestion_level === 'Medium' ? 'var(--amber)' : 'var(--red)'

    return (
        <div>
            <div className="page-header">
                <h1>City Simulation</h1>
                <p>Interactive 3D city view with traffic and pollution scenario modeling</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20, height: 'calc(100vh - 200px)', minHeight: 500 }}>
                {/* Controls Panel */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div className="card">
                        <div className="section-title"><Cpu size={18} color="var(--cyan)" /> Simulation Controls</div>

                        <div className="form-group">
                            <label className="form-label">Junction</label>
                            <select className="form-select" id="sim-junction" value={junction} onChange={e => setJunction(e.target.value)}>
                                {junctions.map(j => <option key={j} value={j}>Junction {j}</option>)}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Time of Day</label>
                            <select className="form-select" id="sim-timeslot" value={timeSlot} onChange={e => setTimeSlot(e.target.value)}>
                                {timeSlots.map((t, i) => <option key={i} value={i}>{t}</option>)}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Traffic Density: {Math.round(density * 100)}%</label>
                            <input type="range" min={0} max={1} step={0.01} value={density}
                                onChange={e => setDensity(+e.target.value)}
                                style={{ width: '100%', accentColor: 'var(--cyan)' }}
                                id="sim-density"
                            />
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                                <span>Low</span><span>High</span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: 8 }}>
                            <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}
                                id="btn-run-simulation" onClick={runSimulation} disabled={loading}>
                                <Play size={14} /> {loading ? 'Loading...' : 'Run'}
                            </button>
                            <button className="btn btn-ghost btn-sm" id="btn-reset-simulation" onClick={reset}>
                                <RotateCcw size={14} />
                            </button>
                        </div>
                    </div>

                    {result && (
                        <div className="card">
                            <div className="section-title"><Building2 size={18} color="var(--cyan)" /> Results</div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: 48, fontWeight: 900, color: congestionColor }}>
                                    {result.predicted_vehicles}
                                </div>
                                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>vehicles / hour</div>
                                <div className={`badge badge-${result.congestion_level === 'Low' ? 'green' : result.congestion_level === 'Medium' ? 'amber' : 'red'}`}
                                    style={{ fontSize: 14, padding: '6px 16px', marginBottom: 16 }}>
                                    {result.congestion_level} Congestion
                                </div>
                                <div className="divider" />
                                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
                                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Road color shows:</span>
                                    <span className={`badge badge-${result.congestion_level === 'Low' ? 'green' : result.congestion_level === 'Medium' ? 'amber' : 'red'}`}>
                                        {result.congestion_level}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* 3D Canvas */}
                <div className="card" style={{ padding: 4, position: 'relative' }}>
                    {running ? (
                        <CityScene congestionLevel={result?.congestion_level || 'Low'} density={density} />
                    ) : (
                        <div style={{
                            height: '100%', display: 'flex', flexDirection: 'column',
                            alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)',
                            borderRadius: 12, background: 'rgba(0,0,0,0.3)',
                        }}>
                            <Building2 size={64} color="var(--text-muted)" style={{ marginBottom: 16 }} />
                            <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 8 }}>3D City Simulation</div>
                            <div style={{ fontSize: 14, color: 'var(--text-muted)', textAlign: 'center', maxWidth: 300 }}>
                                Configure parameters and press Run to launch the interactive Three.js city view
                            </div>
                        </div>
                    )}
                    {running && (
                        <div style={{
                            position: 'absolute', top: 16, right: 16, zIndex: 10,
                            background: 'rgba(10,14,26,0.8)', backdropFilter: 'blur(8px)',
                            border: '1px solid var(--border)', borderRadius: 8, padding: '8px 14px',
                            fontSize: 12, color: 'var(--text-secondary)',
                        }}>
                            <MapPin size={12} style={{ marginRight: 6 }} /> Three.js Live View
                            <div style={{ color: congestionColor, fontWeight: 700, marginTop: 2 }}>
                                {result?.congestion_level} Traffic
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
