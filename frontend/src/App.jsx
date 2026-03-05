import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from './components/AppLayout'
import LandingPage from './pages/LandingPage'
import Dashboard from './pages/Dashboard'
import TrafficPrediction from './pages/TrafficPrediction'
import PollutionMonitoring from './pages/PollutionMonitoring'
import EnvironmentalData from './pages/EnvironmentalData'
import Simulation from './pages/Simulation'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import './index.css'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/traffic" element={<TrafficPrediction />} />
          <Route path="/pollution" element={<PollutionMonitoring />} />
          <Route path="/environment" element={<EnvironmentalData />} />
          <Route path="/simulation" element={<Simulation />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
