// API 服务层 - 定义所有后端接口的调用函数
import { useAppStore } from '@/store/useAppStore'

const BASE_URL = 'http://localhost:8000'

// 通用API请求函数，包含错误处理和状态管理
export async function apiRequest<T>(
  url: string, 
  options: RequestInit = {},
  useGlobalState = true
): Promise<T> {
  const { setApiLoading, setApiError, setApiLastUpdated, clearApiError } = useAppStore.getState()
  
  if (useGlobalState) {
    setApiLoading(true)
    clearApiError()
  }

  try {
    const response = await fetch(`${BASE_URL}${url}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      const errorText = await response.text()
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`
      
      try {
        const errorData = JSON.parse(errorText)
        errorMessage = errorData.detail || errorData.message || errorMessage
      } catch {
        errorMessage = errorText || errorMessage
      }
      
      throw new Error(errorMessage)
    }

    const data = await response.json()
    
    if (useGlobalState) {
      setApiLastUpdated(new Date())
    }
    
    return data
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '网络请求失败'
    
    if (useGlobalState) {
      setApiError(errorMessage)
    }
    
    throw error
  } finally {
    if (useGlobalState) {
      setApiLoading(false)
    }
  }
}

// 类型定义
export interface DocumentInput {
  documents: string[]
  metadatas?: Record<string, any>[]
}

export interface DocumentResponse {
  success: boolean
  message: string
  document_ids: string[]
  count: number
}

export interface DeleteRequest {
  document_ids: string[]
}

export interface DeleteResponse {
  success: boolean
  message: string
  deleted_count: number
}

export interface SearchRequest {
  query: string
  n_results?: number
  min_score?: number
}

export interface SearchResult {
  document: string
  metadata: Record<string, any>
  score: number
}

export interface SearchResponse {
  success: boolean
  query: string
  results: SearchResult[]
  total_found: number
  error?: string
}

// 后端实际返回的搜索结果格式
export interface RawSearchResults {
  query: string
  documents: string[]
  metadatas: Record<string, any>[]
  scores: number[]
}

export interface ChatRequest {
  question: string
  use_search?: boolean
  n_results?: number
  min_score?: number
  max_tokens?: number
}

export interface ChatResponse {
  success: boolean
  question: string
  answer: string
  search_results?: SearchResult[]
  context_used: number
  model: string
  error?: string
}

export interface QwenChatRequest {
  question: string
  history?: [string, string][]
  use_search?: boolean
  n_results?: number
  min_score?: number
  max_new_tokens?: number
  temperature?: number
  top_p?: number
  repetition_penalty?: number
}

export interface QwenChatResponse {
  success: boolean
  question: string
  answer: string
  search_results?: RawSearchResults
  context_used: number
  model: string
  history_length: number
  error?: string
}

export interface HealthResponse {
  status: string
  message: string
  collection_info?: {
    collection_name: string
    document_count: number
    embedding_model: string
  }
}

export interface CollectionInfo {
  collection_name: string
  document_count: number
  embedding_model: string
}

export interface ModelInfo {
  model_name: string
  model_path?: string
  is_initialized: boolean
  device: string
  model_size: string
}

// 系统管理 API
export const systemApi = {
  // 健康检查
  health: (): Promise<HealthResponse> =>
    apiRequest('/system/health'),

  // 获取集合信息
  info: (): Promise<CollectionInfo> =>
    apiRequest('/system/info'),

  // 重置数据库
  reset: (): Promise<string> =>
    apiRequest('/system/reset', { method: 'POST' }),

  // 简单ping
  ping: (): Promise<string> =>
    apiRequest('/ping'),
}

// 文档管理 API
export const documentsApi = {
  // 上传文档
  upload: (data: DocumentInput): Promise<DocumentResponse> =>
    apiRequest('/documents/upload', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // 删除文档
  delete: (data: DeleteRequest): Promise<DeleteResponse> =>
    apiRequest('/documents/delete', {
      method: 'DELETE',
      body: JSON.stringify(data),
    }),
}

// 语义搜索 API
export const searchApi = {
  // 语义搜索
  semantic: (data: SearchRequest): Promise<SearchResponse> =>
    apiRequest('/search/semantic', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
}

// 聊天问答 API
export const chatApi = {
  // 聊天问答 (OpenAI)
  ask: (data: ChatRequest): Promise<ChatResponse> =>
    apiRequest('/chat/ask', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
}

// Qwen 本地聊天 API
export const qwenApi = {
  // Qwen 聊天
  chat: (data: QwenChatRequest): Promise<QwenChatResponse> =>
    apiRequest('/qwen/chat', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Qwen 聊天 + 搜索增强
  chatWithSearch: (data: QwenChatRequest): Promise<QwenChatResponse> =>
    apiRequest('/qwen/chat-with-search', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // 获取模型信息
  modelInfo: (): Promise<ModelInfo> =>
    apiRequest('/qwen/model-info'),
}

// 导出所有 API
export const api = {
  system: systemApi,
  documents: documentsApi,
  search: searchApi,
  chat: chatApi,
  qwen: qwenApi,
}

export default api
