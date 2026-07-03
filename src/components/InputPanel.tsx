import React, { useState, useCallback } from 'react'
import { Upload, Image, X } from 'lucide-react'

interface InputPanelProps {
  onSubmit: (userInput: string, imageUrl: string | null) => void
  isLoading: boolean
}

export default function InputPanel({ onSubmit, isLoading }: InputPanelProps) {
  const [userInput, setUserInput] = useState('')
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setImageUrl(event.target?.result as string)
      }
      reader.readAsDataURL(file)
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

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setImageUrl(event.target?.result as string)
      }
      reader.readAsDataURL(file)
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
          <Image size={18} />
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
          
          {imageUrl ? (
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
                支持 JPG、PNG 格式
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
