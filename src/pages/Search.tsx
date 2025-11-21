import { useState } from 'react'
import { Search as SearchIcon, FileText, Loader2, Zap, Clock, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { api, SearchResult } from '@/lib/api'

export default function Search() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchParams, setSearchParams] = useState({
    n_results: 5,
    min_score: 0.3
  })
  const [searchType, setSearchType] = useState<'semantic' | 'keyword'>('semantic')
  const [recentSearches] = useState([
    '深度学习算法',
    '机器学习模型',
    '人工智能发展',
    '数据科学方法',
    '神经网络架构'
  ])

  const handleSearch = async () => {
    if (!query.trim()) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await api.search.semantic({
        query: query.trim(),
        n_results: searchParams.n_results,
        min_score: searchParams.min_score
      })
      
      if (response.success) {
        setResults(response.results)
      } else {
        setError(response.error || '搜索失败')
        setResults([])
      }
    } catch (err) {
      console.error('搜索错误:', err)
      setError(err instanceof Error ? err.message : '搜索请求失败')
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">智能搜索</h1>
        <p className="text-muted-foreground">
          使用语义搜索和关键词搜索快速找到相关知识
        </p>
      </div>

      {/* 搜索区域 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <SearchIcon className="h-5 w-5" />
            <span>搜索知识库</span>
          </CardTitle>
          <CardDescription>
            支持自然语言查询和精确关键词搜索
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 搜索类型选择 */}
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium">搜索类型:</span>
            <div className="flex space-x-2">
              <Button
                variant={searchType === 'semantic' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSearchType('semantic')}
                className="flex items-center space-x-1"
              >
                <Zap className="h-4 w-4" />
                <span>语义搜索</span>
              </Button>
              <Button
                variant={searchType === 'keyword' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSearchType('keyword')}
                className="flex items-center space-x-1"
              >
                <SearchIcon className="h-4 w-4" />
                <span>关键词搜索</span>
              </Button>
            </div>
          </div>

          {/* 搜索参数配置 */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">结果数量:</span>
              <select
                value={searchParams.n_results}
                onChange={(e) => setSearchParams(prev => ({ ...prev, n_results: parseInt(e.target.value) }))}
                className="border rounded px-2 py-1"
              >
                <option value={5}>5个</option>
                <option value={10}>10个</option>
                <option value={15}>15个</option>
                <option value={20}>20个</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">最小相似度:</span>
              <select
                value={searchParams.min_score}
                onChange={(e) => setSearchParams(prev => ({ ...prev, min_score: parseFloat(e.target.value) }))}
                className="border rounded px-2 py-1"
              >
                <option value={0.1}>10%</option>
                <option value={0.3}>30%</option>
                <option value={0.5}>50%</option>
                <option value={0.7}>70%</option>
              </select>
            </div>
          </div>

          {/* 搜索输入框 */}
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={
                  searchType === 'semantic' 
                    ? "例如: 什么是深度学习？" 
                    : "输入关键词..."
                }
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch} disabled={isLoading}>
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  搜索中
                </div>
              ) : (
                <>
                  <SearchIcon className="w-4 h-4 mr-2" />
                  搜索
                </>
              )}
            </Button>
          </div>

          {/* 最近搜索 */}
          <div>
            <p className="text-sm font-medium mb-2 flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>最近搜索</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((term, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setQuery(term)}
                  className="text-xs"
                >
                  {term}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 错误提示 */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 搜索结果 */}
      {(results.length > 0 || isLoading) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify之间">
              <span>搜索结果</span>
              {!isLoading && (
                <span className="text-sm font-normal text-muted-foreground">
                  找到 {results.length} 个结果
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-muted rounded w全 mb-1"></div>
                    <div className="h-3 bg-muted rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className="border border-border rounded-lg p-4 hover:bg-accent/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify之间 mb-2">
                      <h3 className="font-semibold text-lg">
                        {result.metadata?.filename || `文档 ${index + 1}`}
                      </h3>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <span className="bg-primary/10 text-primary px-2 py-1 rounded">
                          {Math.round(result.score * 100)}% 匹配
                        </span>
                      </div>
                    </div>
                    <p className="text-muted-foreground mb-3 line-clamp-2">
                      {result.document.length > 200 
                        ? result.document.substring(0, 200) + '...' 
                        : result.document}
                    </p>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      <span>
                        大小: {result.metadata?.size ? `${(result.metadata.size / 1024).toFixed(1)} KB` : '未知'}
                      </span>
                      <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
                        {result.metadata?.type || 'document'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 搜索提示 */}
      {results.length === 0 && !isLoading && !error && (
        <Card>
          <CardContent className="text-center py-8">
            <SearchIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">开始搜索知识库</h3>
            <p className="text-muted-foreground mb-4">
              使用自然语言描述您要查找的内容，或输入关键词进行精确搜索
            </p>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>💡 语义搜索示例: "如何提高机器学习模型的准确性？"</p>
              <p>🔍 关键词搜索示例: "深度学习 神经网络"</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
