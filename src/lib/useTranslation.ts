import { useAppStore } from '@/store/useAppStore'
import { getTranslation, Language } from './i18n'

// 国际化Hook
export function useTranslation() {
  const language = useAppStore(state => state.language)
  
  // 获取翻译文本的函数
  const t = (key: string): string => {
    return getTranslation(language as Language, key)
  }
  
  return { t, language }
}
