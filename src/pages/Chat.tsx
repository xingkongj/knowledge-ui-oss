import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, AlertCircle, Loader2, Plus, MessageSquare, Trash2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/store/useAppStore'
import { api, ChatRequest, QwenChatRequest, RawSearchResults, SearchResult, ChatResponse, QwenChatResponse } from '@/lib/api'

// 转换RawSearchResults为SearchResult数组的辅助函数
function convertRawSearchResults(rawResults: RawSearchResults): SearchResult[] {
  if (!rawResults || !rawResults.documents) return []
  
  return rawResults.documents.map((document, index) => ({
    document,
    metadata: rawResults.metadatas?.[index] || {},
    score: rawResults.scores?.[index] || 0
  }))
}

// 获取搜索结果的辅助函数
function getSearchResults(response: ChatResponse | QwenChatResponse): SearchResult[] | undefined {
  if (!response.search_results) return undefined
  
  // 如果是数组类型（ChatResponse），直接返回
  if (Array.isArray(response.search_results)) {
    return response.search_results as SearchResult[]
  }
  
  // 如果是RawSearchResults类型（QwenChatResponse），进行转换
  return convertRawSearchResults(response.search_results as RawSearchResults)
}

export default function Chat() {
  const {
    currentSession,
    chatSessions,
    createChatSession,
    setCurrentSession,
    addMessage
  } = useAppStore()
  
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [chatModel, setChatModel] = useState<'openai' | 'qwen'>('qwen')
  const [useSearch, setUseSearch] = useState(true)
  const [chatParams, setChatParams] = useState({
    n_results: 3,
    min_score: 0.3,
    max_tokens: 500,
    temperature: 0.7,
    top_p: 0.9,
    repetition_penalty: 1.1
  })
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [currentSession?.messages])

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !currentSession || isLoading) return

    const userMessage = {
      id: Date.now().toString(),
      type: 'user' as const,
      content: inputMessage,
      timestamp: new Date().toISOString()
    }

    addMessage(currentSession.id, userMessage)
    const question = inputMessage
    setInputMessage('')
    setIsLoading(true)
    setError(null)

    try {
      let response
      
      if (chatModel === 'openai') {
        const chatRequest: ChatRequest = {
          question,
          use_search: useSearch,
          n_results: chatParams.n_results,
          min_score: chatParams.min_score,
          max_tokens: chatParams.max_tokens
        }
        response = await api.chat.ask(chatRequest)
      } else {
        // 获取聊天历史
        const history = currentSession?.messages
          .slice(-10) // 只取最近10条消息
          .reduce((acc, msg, index, arr) => {
            if (msg.type === 'user') {
              const nextMsg = arr[index + 1]
              if (nextMsg && nextMsg.type === 'assistant') {
                acc.push([msg.content, nextMsg.content])
              }
            }
            return acc
          }, [] as [string, string][])

        const qwenRequest: QwenChatRequest = {
          question,
          history: history || [],
          use_search: useSearch,
          n_results: chatParams.n_results,
          min_score: chatParams.min_score,
          max_new_tokens: chatParams.max_tokens,
          temperature: chatParams.temperature,
          top_p: chatParams.top_p,
          repetition_penalty: chatParams.repetition_penalty
        }
        
        response = useSearch 
          ? await api.qwen.chatWithSearch(qwenRequest)
          : await api.qwen.chat(qwenRequest)
      }

      if (response.success && response.answer) {
        const aiMessage = {
          id: (Date.now() + 1).toString(),
          type: 'assistant' as const,
          content: response.answer,
          timestamp: new Date().toISOString(),
          metadata: {
            model: response.model,
            search_results: getSearchResults(response),
            context_used: response.context_used
          }
        }
        addMessage(currentSession.id, aiMessage)
      } else {
        throw new Error(response.error || '聊天请求失败')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '聊天请求失败')
      console.error('Chat error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] space-x-6">
      {/* 左侧聊天历史 */}
      <div className="w-80 flex flex-col">
        <div className="flex items-center justify之间 mb-4">
          <h2 className="text-xl font-semibold">对话历史</h2>
          <Button onClick={createChatSession} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            新对话
          </Button>
        </div>

        {/* 聊天配置 */}
        <div className="p-4 border rounded-lg mb-4 bg-muted/30">
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">聊天模型</label>
              <select
                value={chatModel}
                onChange={(e) => setChatModel(e.target.value as 'openai' | 'qwen')}
                className="w-全 mt-1 border rounded px-2 py-1 text-sm"
              >
                <option value="qwen">Qwen (本地)</option>
                <option value="openai">OpenAI GPT</option>
              </select>
            </div>
            
            <div className="flex items中心 gap-2">
              <input
                type="checkbox"
                id="useSearch"
                checked={useSearch}
                onChange={(e) => setUseSearch(e.target.checked)}
              />
              <label htmlFor="useSearch" className="text-sm">启用搜索增强</label>
            </div>

            {useSearch && (
              <div className="space-y-2 text-xs">
                <div>
                  <label>搜索结果数: {chatParams.n_results}</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={chatParams.n_results}
                    onChange={(e) => setChatParams(prev => ({ ...prev, n_results: parseInt(e.target.value) }))}
                    className="w-全"
                  />
                </div>
                <div>
                  <label>最小相似度: {(chatParams.min_score * 100).toFixed(0)}%</label>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.1"
                    value={chatParams.min_score}
                    onChange={(e) => setChatParams(prev => ({ ...prev, min_score: parseFloat(e.target.value) }))}
                    className="w-全"
                  />
                </div>
              </div>
            )}

            {chatModel === 'qwen' && (
              <div className="space-y-2 text-xs">
                <div>
                  <label>温度: {chatParams.temperature}</label>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.1"
                    value={chatParams.temperature}
                    onChange={(e) => setChatParams(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                    className="w-全"
                  />
                </div>
                <div>
                  <label>Top-p: {chatParams.top_p}</label>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.1"
                    value={chatParams.top_p}
                    onChange={(e) => setChatParams(prev => ({ ...prev, top_p: parseFloat(e.target.value) }))}
                    className="w-全"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
        
        <Card className="flex-1 overflow-hidden">
          <CardContent className="p-0">
            <div className="h-全 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400 scroll-smooth">
              {chatSessions.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground">
                  <MessageSquare className="mx-auto h-12 w-12 mb-4" />
                  <p>还没有对话记录</p>
                  <p className="text-sm mt-2">点击"新对话"开始聊天</p>
                </div>
              ) : (
                <div className="space-y-1 p-2">
                  {chatSessions.map((session) => (
                    <div
                      key={session.id}
                      onClick={() => setCurrentSession(session)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        currentSession?.id === session.id
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-accent'
                      }`}
                    >
                      <div className="flex items中心 justify之间">
                        <p className="font-medium truncate">{session.title}</p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="text-xs opacity-70 mt-1">
                        {session.messages.length} 条消息
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 右侧聊天界面 */}
      <div className="flex-1 flex flex-col">
        {currentSession ? (
          <>
            {/* 聊天标题 */}
            <div className="flex items中心 justify之间 mb-4">
              <h1 className="text-2xl font-bold">{currentSession.title}</h1>
              <div className="text-sm text-muted-foreground">
                {currentSession.messages.length} 条消息
              </div>
            </div>

            {/* 消息区域 */}
            <Card className="flex-1 flex flex-col">
              <CardContent className="flex-1 p-0 flex flex-col">
                <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[calc(100vh-280px)] scroll-smooth chat-messages scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
                  {currentSession.messages.length === 0 ? (
                    <div className="text-center text-muted-foreground py-12">
                      <Bot className="mx-auto h-12 w-12 mb-4" />
                      <p className="text-lg">开始新的对话</p>
                      <p className="text-sm mt-2">我是您的AI助手，有什么可以帮助您的吗？</p>
                    </div>
                  ) : (
                    currentSession.messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            message.type === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <div className="flex items中心 space-x-2">
                            {message.type === 'assistant' && (
                              <Bot className="h-5 w-5 mt-0.5 flex-shrink-0" />
                            )}
                            <div className="flex-1">
                              <p className="whitespace-pre-wrap">{message.content}</p>
                              
                              {/* 显示AI回复的元数据 */}
                              {message.type === 'assistant' && message.metadata && (
                                <div className="mt-3 space-y-2">
                                  {message.metadata.model && (
                                    <div className="flex items中心 gap-2">
                                      <Badge variant="secondary" className="text-xs">
                                        {message.metadata.model}
                                      </Badge>
                                      {message.metadata.context_used && (
                                        <Badge variant="outline" className="text-xs">
                                          使用了 {message.metadata.context_used} 个上下文
                                        </Badge>
                                      )}
                                    </div>
                                  )}
                                  
                                  {message.metadata.search_results && message.metadata.search_results.length > 0 && (
                                    <div className="mt-2">
                                      <details className="text-xs">
                                        <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                                          参考资料 ({message.metadata.search_results.length} 个)
                                        </summary>
                                        <div className="mt-2 space-y-1 pl-2 border-l-2 border-muted">
                                          {message.metadata.search_results.map((result, index) => (
                                            <div key={index} className="text-xs text-muted-foreground">
                                              <div className="font-medium">
                                                {result.metadata?.filename || `文档 ${index + 1}`}
                                              </div>
                                              <div className="truncate">
                                                {result.document.substring(0, 100)}...
                                              </div>
                                              <div className="text-xs opacity-70">
                                                相似度: {(result.score * 100).toFixed(1)}%
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </details>
                                    </div>
                                  )}
                                </div>
                              )}
                              
                              <p className={`text-xs mt-2 ${
                                message.type === 'user' 
                                  ? 'text-primary-foreground/70' 
                                  : 'text-muted-foreground'
                              }`}>
                                {formatTime(message.timestamp)}
                              </p>
                            </div>
                            {message.type === 'user' && (
                              <User className="h-5 w-5 mt-0.5 flex-shrink-0" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  
                  {/* AI正在输入指示器 */}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-muted rounded-lg p-3 max-w-[70%]">
                        <div className="flex items中心 space-x-2">
                          <Bot className="h-5 w-5" />
                          <div className="flex items中心 space-x-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-sm text-muted-foreground">
                              {chatModel === 'qwen' ? 'Qwen正在思考...' : 'GPT正在回复...'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>

                {/* 输入区域 */}
                <div className="border-t border-border p-4">
                  {error && (
                    <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-md flex items中心 gap-2 text-red-700 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      {error}
                    </div>
                  )}
                  <div className="flex space-x-2">
                    <Input
                      placeholder="输入您的问题..."
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="flex-1"
                      disabled={isLoading}
                    />
                    <Button 
                      onClick={handleSendMessage} 
                      disabled={!inputMessage.trim() || isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    按 Enter 发送消息，Shift + Enter 换行
                  </p>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card className="flex-1 flex items中心 justify中心">
            <CardContent className="text-center">
              <MessageSquare className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">选择或创建对话</h2>
              <p className="text-muted-foreground mb-4">
                从左侧选择一个对话，或创建新的对话开始聊天
              </p>
              <Button onClick={createChatSession}>
                <Plus className="h-4 w-4 mr-2" />
                开始新对话
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
