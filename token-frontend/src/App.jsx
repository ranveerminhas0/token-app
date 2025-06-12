import { Routes, Route, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Landing from './components/Landing'
import Search from './pages/Search'
import AllTokens from './pages/AllTokens'
import TokenList from './pages/TokenList'
import B2BDashboard from './components/B2B/B2BDashboard'
import B2BADashboard from './components/B2BA/B2BADashboard'
import './App.css'

function App() {
  return (
    <div className="app">
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/search" element={<Search />} />
          <Route path="/tokens" element={<AllTokens />} />
          <Route path="/tokens/:type" element={<TokenList />} />
          <Route path="/b2b" element={<B2BDashboard />} />
          <Route path="/b2b/*" element={<Navigate to="/b2b" replace />} />
          <Route path="/b2ba" element={<B2BADashboard />} />
          <Route path="/b2ba/*" element={<Navigate to="/b2ba" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </div>
  )
}

export default App
