import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import {
  FileText,
  Upload,
  Trash2,
  Search,
  AlertCircle,
  CheckCircle,
  Eye,
  Download,
  Image,
  File
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { useAppStore } from '@/store/useAppStore'
import { api, DocumentInput } from '@/lib/api'

function FileManager() {
  const { files, addFile, removeFile } = useAppStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [statusMessage, setStatusMessage] = useState('')
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setIsUploading(true)
    setUploadProgress(0)
    setUploadStatus('idle')
    
    try {
      const documents: string[] = []
      const metadatas: Record<string, any>[] = []
      
      // 读取所有文件内容
      for (const file of acceptedFiles) {
        const content = await readFileContent(file)
        documents.push(content)
        metadatas.push({
          filename: file.name,
          size: file.size,
          type: file.type,
          upload_date: new Date().toISOString()
        })
        
        // 更新进度
        setUploadProgress((documents.length / acceptedFiles.length) * 50)
      }
      
      // 调用API上传文档
      const uploadData: DocumentInput = {
        documents,
        metadatas
      }
      
      const response = await api.documents.upload(uploadData)
      
      if (response.success) {
        // 添加文件到本地状态
        acceptedFiles.forEach((file, index) => {
          addFile({
            id: response.document_ids[index] || Date.now().toString() + index,
            name: file.name,
            size: file.size,
            type: file.type,
            uploadDate: new Date().toISOString(),
            content: documents[index],
            status: 'uploaded'
          })
        })
        
        setUploadProgress(100)
        setUploadStatus('success')
        setStatusMessage(`成功上传 ${response.count} 个文档`)
      } else {
        throw new Error('上传失败')
      }
    } catch (error) {
      console.error('文档上传失败:', error)
      setUploadStatus('error')
      setStatusMessage(error instanceof Error ? error.message : '上传失败')
    } finally {
      setIsUploading(false)
      // 3秒后清除状态消息
      setTimeout(() => {
        setUploadStatus('idle')
        setStatusMessage('')
        setUploadProgress(0)
      }, 3000)
    }
  }, [addFile])

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = () => reject(new Error('文件读取失败'))
      reader.readAsText(file)
    })
  }

  const handleDeleteFile = async (fileId: string, fileName: string) => {
    setIsDeleting(fileId)
    
    try {
      const response = await api.documents.delete({
        document_ids: [fileId]
      })
      
      if (response.success) {
        removeFile(fileId)
        setStatusMessage(`成功删除文档: ${fileName}`)
        setUploadStatus('success')
      } else {
        throw new Error('删除失败')
      }
    } catch (error) {
      console.error('文档删除失败:', error)
      setUploadStatus('error')
      setStatusMessage(error instanceof Error ? error.message : '删除失败')
    } finally {
      setIsDeleting(null)
      // 3秒后清除状态消息
      setTimeout(() => {
        setUploadStatus('idle')
        setStatusMessage('')
      }, 3000)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    }
  })

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return Image
    if (type.includes('pdf') || type.includes('document')) return FileText
    return File
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">文件管理</h1>
        <p className="text-muted-foreground">
          上传、管理和预览您的知识文档
        </p>
      </div>

      {/* 文件上传区域 */}
      <Card>
        <CardHeader>
          <CardTitle>上传文件</CardTitle>
          <CardDescription>
            支持 PDF、Word、文本文件和图片格式
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/25 hover:border-primary/50'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            {isDragActive ? (
              <p className="text-lg">释放文件以上传...</p>
            ) : (
              <div>
                <p className="text-lg mb-2">拖拽文件到此处，或点击选择文件</p>
                <p className="text-sm text-muted-foreground">
                  支持 PDF、DOC、DOCX、TXT、MD、CSV 和图片文件
                </p>
              </div>
            )}
          </div>
          {/* 上传进度和状态 */}
          {(isUploading || uploadStatus !== 'idle') && (
            <div className={`mt-4 p-4 rounded-lg ${
              uploadStatus === 'success' ? 'bg-green-50' : 
              uploadStatus === 'error' ? 'bg-red-50' : 'bg-blue-50'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {isUploading && <Upload className="h-4 w-4 text-blue-600" />}
                {uploadStatus === 'success' && <CheckCircle className="h-4 w-4 text-green-600" />}
                {uploadStatus === 'error' && <AlertCircle className="h-4 w-4 text-red-600" />}
                <span className={`text-sm font-medium ${
                  uploadStatus === 'success' ? 'text-green-900' : 
                  uploadStatus === 'error' ? 'text-red-900' : 'text-blue-900'
                }`}>
                  {isUploading ? '正在上传文件...' : statusMessage}
                </span>
              </div>
              {isUploading && (
                <Progress value={uploadProgress} className="w全" />
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 文件列表 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify之间">
            <div>
              <CardTitle>文件列表</CardTitle>
              <CardDescription>
                已上传 {files.length} 个文件
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="搜索文件..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredFiles.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg text-muted-foreground">
                {files.length === 0 ? '还没有上传任何文件' : '没有找到匹配的文件'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredFiles.map((file) => {
                const FileIcon = getFileIcon(file.type)
                return (
                  <div
                    key={file.id}
                    className="flex items-center justify之间 p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items中心 space-x-3">
                      <FileIcon className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{file.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatFileSize(file.size)} • {new Date(file.uploadDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items中心 space-x-2">
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteFile(file.id, file.name)}
                        disabled={isDeleting === file.id}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default FileManager
