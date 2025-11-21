import { ReactNode } from 'react'
import { useAppStore } from '@/store/useAppStore'
import Sidebar from './Sidebar'
import Header from './Header'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const sidebarCollapsed = useAppStore(state => state.sidebarCollapsed)

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex">
        {/* 侧边栏 */}
        <Sidebar />
        
        {/* 主内容区域 */}
        <div className={`flex-1 transition-all duration-300 ${
          sidebarCollapsed ? 'ml-16' : 'ml-64'
        }`}>
          {/* 顶部导航 */}
          <Header />
          
          {/* 页面内容 */}
          <main className="p-6">
            <div className="animate-fade-in">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
