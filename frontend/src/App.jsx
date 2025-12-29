import { Routes, Route } from 'react-router-dom'
import MainLayout from './components/layout/MainLayout'
import Home from './pages/Home'

function App() {
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* 路由将在后续阶段逐步完善 */}
      </Routes>
    </MainLayout>
  )
}

export default App

