import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { useAppStore } from './store/useAppStore'
import Layout from './components/Layout'
import { ApiErrorBoundary } from './components/ApiErrorBoundary'
import Dashboard from './pages/Dashboard'
import FileManager from './pages/FileManager'
import Search from './pages/Search'
import Chat from './pages/Chat'
import Settings from './pages/Settings'

function App() {
  const theme = useAppStore(state => state.theme)

  // 监听主题变化并更新 HTML 根元素的 class
  useEffect(() => {
    const htmlElement = document.documentElement
    if (theme === 'dark') {
      htmlElement.classList.add('dark')
    } else {
      htmlElement.classList.remove('dark')
    }
  }, [theme])

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/files" element={<FileManager />} />
          <Route path="/search" element={<Search />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
      <ApiErrorBoundary />
    </Router>
  )
}

export default App
