import React, { useState, useCallback } from 'react'
import { Upload, Image as ImageIcon, X } from 'lucide-react'

interface InputPanelProps {
  onSubmit: (userInput: string, imageUrl: string | null) => void
  isLoading: boolean
}

const MAX_IMAGE_SIZE = 1 * 1024 * 1024

function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        let quality = 0.9
        const targetSize = MAX_IMAGE_SIZE
        let canvas = document.createElement('canvas')
        let ctx = canvas.getContext('2d')
        
        if (!ctx) {
          reject(new Error('无法创建画布上下文'))
          return
        }

        let width = img.width
        let height = img.height
        const maxDimension = 2048
        
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = (height / width) * maxDimension
            width = maxDimension
          } else {
            width = (width / height) * maxDimension
            height = maxDimension
          }
        }

        canvas.width = width
        canvas.height = height
        ctx.drawImage(img, 0, 0, width, height)

        let compressedDataUrl = canvas.toDataURL('image/jpeg', quality)
        
        while (compressedDataUrl.length * 0.75 > targetSize && quality > 0.1) {
          quality -= 0.1
          compressedDataUrl = canvas.toDataURL('image/jpeg', quality)
        }

        resolve(compressedDataUrl)
      }
      img.onerror = () => reject(new Error('图片加载失败'))
      img.src = event.target?.result as string
    }
    reader.onerror = () => reject(new Error('文件读取失败'))
    reader.readAsDataURL(file)
  })
}

export default function InputPanel({ onSubmit, isLoading }: InputPanelProps) {
  const [userInput, setUserInput] = useState('')
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isCompressing, setIsCompressing] = useState(false)

  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setIsCompressing(true)
      try {
        const compressedUrl = await compressImage(file)
        setImageUrl(compressedUrl)
      } catch (error) {
        console.error('图片压缩失败:', error)
        const reader = new FileReader()
        reader.onload = (event) => {
          setImageUrl(event.target?.result as string)
        }
        reader.readAsDataURL(file)
      } finally {
        setIsCompressing(false)
      }
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith('image/')) {
      setIsCompressing(true)
      try {
        const compressedUrl = await compressImage(file)
        setImageUrl(compressedUrl)
      } catch (error) {
        console.error('图片压缩失败:', error)
        const reader = new FileReader()
        reader.onload = (event) => {
          setImageUrl(event.target?.result as string)
        }
        reader.readAsDataURL(file)
      } finally {
        setIsCompressing(false)
      }
    }
  }, [])

  const handleSubmit = useCallback(() => {
    if (userInput.trim()) {
      onSubmit(userInput.trim(), imageUrl)
    }
  }, [userInput, imageUrl, onSubmit])

  const removeImage = useCallback(() => {
    setImageUrl(null)
  }, [])

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 fade-in">
      <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <span className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center text-white">
            <ImageIcon size={18} />
          </span>
        记录今日生活
      </h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">
            今天发生了什么？
          </label>
          <textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="描述你的一天，比如：早上起来做了一顿丰盛的早餐，阳光透过窗户洒在餐桌上..."
            className="w-full h-32 px-4 py-3 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">
            上传参考图片（可选）
          </label>
          
          {isCompressing ? (
            <div className="rounded-xl p-8 text-center bg-gray-50">
              <div className="w-10 h-10 border-4 border-primary-400 border-t-transparent rounded-full loading-spinner mx-auto mb-3" />
              <p className="text-gray-500 text-sm">正在压缩图片...</p>
            </div>
          ) : imageUrl ? (
            <div className="relative rounded-xl overflow-hidden border-2 border-primary-300">
              <img src={imageUrl} alt="参考图片" className="w-full h-40 object-cover" />
              <button
                onClick={removeImage}
                className="absolute top-2 right-2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div
              className={`upload-area rounded-xl p-6 text-center cursor-pointer ${isDragging ? 'dragover' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById('image-upload')?.click()}
            >
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={isLoading}
              />
              <Upload className="mx-auto text-primary-400 mb-2" size={32} />
              <p className="text-gray-500 text-sm">
                点击或拖拽图片到这里上传
              </p>
              <p className="text-gray-400 text-xs mt-1">
                支持 JPG、PNG 格式（自动压缩至 1MB 以下）
              </p>
            </div>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={isLoading || !userInput.trim()}
          className="btn-primary w-full py-3 px-6 rounded-xl text-white font-semibold flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full loading-spinner" />
              生成中...
            </>
          ) : (
            '生成短视频'
          )}
        </button>
      </div>
    </div>
  )
}
