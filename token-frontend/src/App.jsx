import { Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Landing from './components/Landing'
import Search from './pages/Search'
import AllTokens from './pages/AllTokens'
import TokenList from './pages/TokenList'
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
          </Routes>
        </AnimatePresence>
    </div>
  )
}

export default App
