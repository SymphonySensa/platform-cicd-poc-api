import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import Dashboard from '@/pages/Dashboard'
import Deployments from '@/pages/Deployments'
import FeatureFlags from '@/pages/FeatureFlags'
import ABTests from '@/pages/ABTests'
import './App.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="app-container">
          <nav className="navbar">
            <div className="nav-brand">Platform CICD POC</div>
            <ul className="nav-links">
              <li><a href="/">Dashboard</a></li>
              <li><a href="/deployments">Deployments</a></li>
              <li><a href="/flags">Feature Flags</a></li>
              <li><a href="/ab-tests">A/B Tests</a></li>
            </ul>
          </nav>

          <main className="main-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/deployments" element={<Deployments />} />
              <Route path="/flags" element={<FeatureFlags />} />
              <Route path="/ab-tests" element={<ABTests />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
