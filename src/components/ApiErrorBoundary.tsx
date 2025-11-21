import { useEffect } from 'react'
import { AlertCircle, X } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'

export function ApiErrorBoundary() {
  const { api, clearApiError } = useAppStore()

  useEffect(() => {
    if (api.error) {
      // 10秒后自动清除错误
      const timer = setTimeout(() => {
        clearApiError()
      }, 10000)

      return () => clearTimeout(timer)
    }
  }, [api.error, clearApiError])

  if (!api.error) return null

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-red-800">
              API调用失败
            </h3>
            <p className="text-sm text-red-700 mt-1">
              {api.error}
            </p>
          </div>
          <button
            onClick={clearApiError}
            className="text-red-400 hover:text-red-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
