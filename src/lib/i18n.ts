export type Language = 'zh-CN' | 'en'

export interface Translations {
  [key: string]: string
}

// 中文翻译
export const zhCN: Translations = {
  // 应用基础
  appName: '智能知识库',
  version: '版本',
  
  // 导航菜单
  dashboard: '仪表板',
  fileManager: '文件管理',
  search: '搜索',
  chat: '聊天',
  settings: '设置',
  
  // 设置页面
  settingsTitle: '设置',
  settingsDescription: '配置您的知识库系统参数和偏好设置',
  
  // 外观设置
  interfaceLanguage: '界面语言',
  
  // 通用
  save: '保存',
  cancel: '取消',
  loading: '加载中...',
  error: '错误',
  success: '成功'
}

// 英文翻译
export const en: Translations = {
  // 应用基础
  appName: 'Smart Knowledge Base',
  version: 'Version',
  
  // 导航菜单
  dashboard: 'Dashboard',
  fileManager: 'File Manager',
  search: 'Search',
  chat: 'Chat',
  settings: 'Settings',
  
  // 设置页面
  settingsTitle: 'Settings',
  settingsDescription: 'Configure your knowledge base system parameters and preferences',
  
  // 外观设置
  interfaceLanguage: 'Interface Language',
  
  // 通用
  save: 'Save',
  cancel: 'Cancel',
  loading: 'Loading...',
  error: 'Error',
  success: 'Success'
}

// 翻译映射
export const translations: Record<Language, Translations> = {
  'zh-CN': zhCN,
  'en': en
}

// 获取翻译文本的函数
export function getTranslation(language: Language, key: string): string {
  return translations[language]?.[key] || key
}
