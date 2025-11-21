import { useState, useEffect } from 'react'
import { FileText, MessageSquare, Search, TrendingUp, Clock, Database, Activity, AlertCircle, CheckCircle, Loader2, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/store/useAppStore'
import { api, HealthResponse, CollectionInfo, ModelInfo } from '@/lib/api'

export default function Dashboard() {
  const { files, chatSessions } = useAppStore()
  const [healthData, setHealthData] = useState<HealthResponse | null>(null)
  const [collectionInfo, setCollectionInfo] = useState<CollectionInfo | null>(null)
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchSystemData = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // 并行获取系统信息
      const [health, collection, model] = await Promise.allSettled([
        api.system.health(),
        api.system.info(),
        api.qwen.modelInfo()
      ])

      if (health.status === 'fulfilled') {
        setHealthData(health.value)
      }

      if (collection.status === 'fulfilled') {
        setCollectionInfo(collection.value)
      }

      if (model.status === 'fulfilled') {
        setModelInfo(model.value)
      }

      setLastUpdated(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取系统信息失败')
      console.error('Dashboard data fetch error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSystemData()
    // 每30秒自动刷新一次
    const interval = setInterval(fetchSystemData, 30000)
    return () => clearInterval(interval)
  }, [])

  const stats = [
    {
      title: '文档总数',
      value: collectionInfo?.document_count?.toString() || files.length.toString(),
      description: '向量数据库中的文档数量',
      icon: FileText,
      color: 'text-blue-500'
    },
    {
      title: '对话会话',
      value: chatSessions.length.toString(),
      description: '聊天会话总数',
      icon: MessageSquare,
      color: 'text-green-500'
    },
    {
      title: '向量维度',
      value: collectionInfo?.embedding_model || 'N/A',
      description: '嵌入模型信息',
      icon: Search,
      color: 'text-purple-500'
    },
    {
      title: '系统状态',
      value: healthData?.status === 'healthy' ? '正常' : '异常',
      description: '后端服务状态',
      icon: Activity,
      color: healthData?.status === 'healthy' ? 'text-green-500' : 'text-red-500'
    }
  ]

  const recentActivity = [
    {
      type: 'upload',
      title: '上传了新文档',
      description: 'AI技术发展报告.pdf',
      time: '2小时前',
      icon: FileText
    },
    {
      type: 'chat',
      title: '开始新对话',
      description: '关于机器学习的讨论',
      time: '4小时前',
      icon: MessageSquare
    },
    {
      type: 'search',
      title: '执行搜索',
      description: '搜索关键词: "深度学习"',
      time: '6小时前',
      icon: Search
    }
  ]

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">仪表板</h1>
          <p className="text-muted-foreground">
            欢迎使用知识管理系统
          </p>
        </div>
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="text-sm text-muted-foreground">
              最后更新: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={fetchSystemData}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            刷新
          </Button>
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-red-700">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* 快速操作 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>快速操作</span>
            </CardTitle>
            <CardDescription>
              常用功能快速入口
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-2">
              <button className="flex items-center space-x-3 rounded-lg border border-border p-3 text-left hover:bg-accent transition-colors">
                <FileText className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="font-medium">上传文档</p>
                  <p className="text-sm text-muted-foreground">添加新的知识文档</p>
                </div>
              </button>
              <button className="flex items-center space-x-3 rounded-lg border border-border p-3 text左 hover:bg-accent transition-colors">
                <MessageSquare className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium">开始对话</p>
                  <p className="text-sm text-muted-foreground">与AI助手聊天</p>
                </div>
              </button>
              <button className="flex items-center space-x-3 rounded-lg border border-border p-3 text左 hover:bg-accent transition-colors">
                <Search className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="font-medium">智能搜索</p>
                  <p className="text-sm text-muted-foreground">语义搜索知识库</p>
                </div>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* 系统状态 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>系统状态</span>
            </CardTitle>
            <CardDescription>
              后端服务和模型状态
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 健康状态 */}
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center space-x-3">
                {healthData?.status === 'healthy' ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                )}
                <div>
                  <p className="font-medium">后端服务</p>
                  <p className="text-sm text-muted-foreground">
                    {healthData?.message || '状态未知'}
                  </p>
                </div>
              </div>
              <Badge variant={healthData?.status === 'healthy' ? 'default' : 'destructive'}>
                {healthData?.status === 'healthy' ? '正常' : '异常'}
              </Badge>
            </div>

            {/* 数据库状态 */}
            <div className="flex items-center justify之间 p-3 rounded-lg border">
              <div className="flex items-center space-x-3">
                <Database className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="font-medium">向量数据库</p>
                  <p className="text-sm text-muted-foreground">
                    {collectionInfo ? `${collectionInfo.document_count} 个文档` : '连接中...'}
                  </p>
                </div>
              </div>
              <Badge variant={collectionInfo ? 'default' : 'secondary'}>
                {collectionInfo ? '已连接' : '连接中'}
              </Badge>
            </div>

            {/* 模型状态 */}
            <div className="flex items-center justify之间 p-3 rounded-lg border">
              <div className="flex items-center space-x-3">
                <MessageSquare className="h-5 w-5 text紫色-500" />
                <div>
                  <p className="font-medium">Qwen模型</p>
                  <p className="text-sm text-muted-foreground">
                    {modelInfo?.model_name || '未初始化'}
                  </p>
                </div>
              </div>
              <Badge variant={modelInfo ? 'default' : 'secondary'}>
                {modelInfo ? '已加载' : '未加载'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-1">
        {/* 最近活动 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>最近活动</span>
            </CardTitle>
            <CardDescription>
              您的最新操作记录
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="rounded-full bg-muted p-2">
                    <activity.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">{activity.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {activity.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
