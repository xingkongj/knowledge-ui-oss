import { create } from 'zustand'
import { SearchResult } from '@/lib/api'

interface FileItem {
  id: string
  name: string
  type: string
  size: number
  uploadDate: string
  status: 'uploaded' | 'processing' | 'indexed'
  content?: string
}

interface ChatMessage {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: string
  metadata?: {
    model?: string
    context_used?: number
    search_results?: SearchResult[]
  }
}

interface ChatSession {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: string
}

interface ApiState {
  isLoading: boolean
  error: string | null
  lastUpdated: Date | null
}

interface AppState {
  // 文件管理
  files: FileItem[]
  uploadProgress: number
  isUploading: boolean
  
  // 聊天
  currentSession: ChatSession | null
  chatSessions: ChatSession[]
  isTyping: boolean
  
  // 搜索
  searchQuery: string
  searchResults: any[]
  isSearching: boolean
  
  // API状态管理
  api: ApiState
  
  // 主题和设置
  theme: 'light' | 'dark'
  language: 'zh-CN' | 'en'
  sidebarCollapsed: boolean
  
  // Actions
  addFile: (file: FileItem) => void
  removeFile: (fileId: string) => void
  setUploadProgress: (progress: number) => void
  setIsUploading: (uploading: boolean) => void
  
  createChatSession: () => void
  setCurrentSession: (session: ChatSession | null) => void
  addMessage: (sessionId: string, message: ChatMessage) => void
  setIsTyping: (typing: boolean) => void
  
  setSearchQuery: (query: string) => void
  setSearchResults: (results: any[]) => void
  setIsSearching: (searching: boolean) => void
  
  // API状态管理
  setApiLoading: (loading: boolean) => void
  setApiError: (error: string | null) => void
  setApiLastUpdated: (date: Date | null) => void
  clearApiError: () => void
  
  toggleTheme: () => void
  setLanguage: (language: 'zh-CN' | 'en') => void
  toggleSidebar: () => void
}

export const useAppStore = create<AppState>((set) => ({
  // Initial state
  files: [],
  uploadProgress: 0,
  isUploading: false,
  
  currentSession: null,
  chatSessions: [],
  isTyping: false,
  
  searchQuery: '',
  searchResults: [],
  isSearching: false,
  
  // API状态
  api: {
    isLoading: false,
    error: null,
    lastUpdated: null
  },
  
  theme: 'dark',
  language: 'zh-CN',
  sidebarCollapsed: false,
  
  // Actions
  addFile: (file) => set((state) => ({
    files: [...state.files, file]
  })),
  
  removeFile: (fileId) => set((state) => ({
    files: state.files.filter(f => f.id !== fileId)
  })),
  
  setUploadProgress: (progress) => set({ uploadProgress: progress }),
  setIsUploading: (uploading) => set({ isUploading: uploading }),
  
  createChatSession: () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: '新对话',
      messages: [],
      createdAt: new Date().toISOString()
    }
    set((state) => ({
      chatSessions: [newSession, ...state.chatSessions],
      currentSession: newSession
    }))
  },
  
  setCurrentSession: (session) => set({ currentSession: session }),
  
  addMessage: (sessionId, message) => set((state) => ({
    chatSessions: state.chatSessions.map(session =>
      session.id === sessionId
        ? { ...session, messages: [...session.messages, message] }
        : session
    ),
    currentSession: state.currentSession?.id === sessionId
      ? { ...state.currentSession, messages: [...state.currentSession.messages, message] }
      : state.currentSession
  })),
  
  setIsTyping: (typing) => set({ isTyping: typing }),
  
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSearchResults: (results) => set({ searchResults: results }),
  setIsSearching: (searching) => set({ isSearching: searching }),

  // API状态管理
  setApiLoading: (loading) => set((state) => ({
    api: { ...state.api, isLoading: loading }
  })),
  
  setApiError: (error) => set((state) => ({
    api: { ...state.api, error }
  })),
  
  setApiLastUpdated: (date) => set((state) => ({
    api: { ...state.api, lastUpdated: date }
  })),
  
  clearApiError: () => set((state) => ({
    api: { ...state.api, error: null }
  })),

  toggleTheme: () => set((state) => ({
    theme: state.theme === 'light' ? 'dark' : 'light'
  })),
  
  setLanguage: (language) => set({ language }),
  
  toggleSidebar: () => set((state) => ({
    sidebarCollapsed: !state.sidebarCollapsed
  }))
}))
