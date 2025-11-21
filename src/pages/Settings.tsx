import { useState } from 'react'
import { Save, Key, Database, Palette, Shield, Info } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAppStore } from '@/store/useAppStore'
import { useTranslation } from '@/lib/useTranslation'

export default function Settings() {
  const { theme, toggleTheme, language, setLanguage } = useAppStore()
  const { t } = useTranslation()
  const [apiKey, setApiKey] = useState('')
  const [vectorDbPath, setVectorDbPath] = useState('')
  const [maxFileSize, setMaxFileSize] = useState('10')
  const [notifications, setNotifications] = useState(true)
  const [autoSave, setAutoSave] = useState(true)

  const handleSave = () => {
    // 这里会保存设置到后端或本地存储
    // 显示保存成功提示
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('settingsTitle')}</h1>
        <p className="text-muted-foreground mt-2">
          {t('settingsDescription')}
        </p>
      </div>

      <div className="grid gap-6">
        {/* API 配置 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items中心">
              <Key className="h-5 w-5 mr-2" />
              API 配置
            </CardTitle>
            <CardDescription>
              配置与后端服务和AI模型的连接
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                OpenAI API Key
              </label>
              <Input
                type="password"
                placeholder="sk-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                用于AI聊天和语义搜索功能
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">
                后端服务地址
              </label>
              <Input
                placeholder="http://localhost:8000"
                defaultValue="http://localhost:8000"
              />
            </div>
          </CardContent>
        </Card>

        {/* 向量数据库配置 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items中心">
              <Database className="h-5 w-5 mr-2" />
              向量数据库
            </CardTitle>
            <CardDescription>
              配置知识库存储和检索设置
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                数据库路径
              </label>
              <Input
                placeholder="./vector_db"
                value={vectorDbPath}
                onChange={(e) => setVectorDbPath(e.target.value)}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">
                嵌入模型
              </label>
              <select className="w-全 p-2 border border-input bg-background rounded-md">
                <option>text-embedding-ada-002</option>
                <option>sentence-transformers/all-MiniLM-L6-v2</option>
                <option>BAAI/bge-large-zh</option>
              </select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">
                相似度阈值
              </label>
              <Input
                type="number"
                min="0"
                max="1"
                step="0.1"
                defaultValue="0.7"
              />
            </div>
          </CardContent>
        </Card>

        {/* 文件管理 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items中心">
              <Shield className="h-5 w-5 mr-2" />
              文件管理
            </CardTitle>
            <CardDescription>
              文件上传和处理相关设置
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                最大文件大小 (MB)
              </label>
              <Input
                type="number"
                min="1"
                max="100"
                value={maxFileSize}
                onChange={(e) => setMaxFileSize(e.target.value)}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">
                支持的文件类型
              </label>
              <div className="flex flex-wrap gap-2 mt-2">
                {['PDF', 'DOCX', 'TXT', 'MD', 'XLSX'].map((type) => (
                  <span
                    key={type}
                    className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs"
                  >
                    {type}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="flex items中心 justify之间">
              <div>
                <p className="text-sm font-medium">自动处理上传文件</p>
                <p className="text-xs text-muted-foreground">
                  上传后自动进行文本提取和向量化
                </p>
              </div>
              <button
                onClick={() => setAutoSave(!autoSave)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  autoSave ? 'bg-primary' : 'bg-input'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-background transition-transform ${
                    autoSave ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </CardContent>
        </Card>

        {/* 界面设置 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items中心">
              <Palette className="h-5 w-5 mr-2" />
              界面设置
            </CardTitle>
            <CardDescription>
              个性化您的使用体验
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items中心 justify之间">
              <div>
                <p className="text-sm font-medium">主题模式</p>
                <p className="text-xs text-muted-foreground">
                  当前: {theme === 'dark' ? '暗色' : '亮色'}模式
                </p>
              </div>
              <Button variant="outline" onClick={toggleTheme}>
                切换主题
              </Button>
            </div>
            
            <div className="flex items中心 justify之间">
              <div>
                <p className="text-sm font-medium">桌面通知</p>
                <p className="text-xs text-muted-foreground">
                  接收处理完成和错误通知
                </p>
              </div>
              <button
                onClick={() => setNotifications(!notifications)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notifications ? 'bg-primary' : 'bg-input'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-background transition-transform ${
                    notifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">
                {t('interfaceLanguage')}
              </label>
              <select 
                className="w-全 p-2 border border-input bg-background rounded-md"
                value={language}
                onChange={(e) => setLanguage(e.target.value as 'zh-CN' | 'en')}
              >
                <option value="zh-CN">简体中文</option>
                <option value="en">English</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* 系统信息 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items中心">
              <Info className="h-5 w-5 mr-2" />
              系统信息
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify之间 text-sm">
              <span className="text-muted-foreground">版本</span>
              <span>v1.0.0</span>
            </div>
            <div className="flex justify之间 text-sm">
              <span className="text-muted-foreground">构建时间</span>
              <span>2024-01-15</span>
            </div>
            <div className="flex justify之间 text-sm">
              <span className="text-muted-foreground">数据库状态</span>
              <span className="text-green-500">已连接</span>
            </div>
            <div className="flex justify之间 text-sm">
              <span className="text-muted-foreground">存储空间</span>
              <span>2.3GB / 10GB</span>
            </div>
          </CardContent>
        </Card>

        {/* 保存按钮 */}
        <div className="flex justify-end">
          <Button onClick={handleSave} className="w-32">
            <Save className="h-4 w-4 mr-2" />
            保存设置
          </Button>
        </div>
      </div>
    </div>
  )
}
