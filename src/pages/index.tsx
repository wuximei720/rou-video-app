import React, { useState, useEffect, useCallback } from 'react'
import { Film, Sparkles } from 'lucide-react'
import InputPanel from '@/components/InputPanel'
import ScenePreview from '@/components/ScenePreview'
import VideoPreview from '@/components/VideoPreview'
import HistoryList from '@/components/HistoryList'
import type { Scene } from '@/services/llm'

interface HistoryItem {
  id: string
  userInput: string
  scenes: Scene[]
  processedVideoUrl: string | null
}

type GenerationStatus = 'idle' | 'uploading' | 'analyzing' | 'generating' | 'processing' | 'completed' | 'error'

export default function Home() {
  const [status, setStatus] = useState<GenerationStatus>('idle')
  const [scenes, setScenes] = useState<Scene[]>([])
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [currentGenerationId, setCurrentGenerationId] = useState<string | null>(null)

  const uploadImage = useCallback(async (imageDataUrl: string): Promise<string | null> => {
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageDataUrl }),
      })
      const data = await response.json()
      if (data.error) {
        throw new Error(data.error)
      }
      return data.path
    } catch (error) {
      console.error('Image upload failed:', error)
      return null
    }
  }, [])

  const handleSubmit = useCallback(async (userInput: string, imageDataUrl: string | null) => {
    setStatus('uploading')
    setError(null)
    setVideoUrl(null)

    try {
      let imagePath: string | undefined
      if (imageDataUrl) {
        const uploadedPath = await uploadImage(imageDataUrl)
        imagePath = uploadedPath ?? undefined
      }

      setStatus('analyzing')

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userInput, referenceImageUrl: imagePath }),
      })

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      setScenes(data.scenes)
      setCurrentGenerationId(data.id)

      await fetch('/api/generate/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: data.id }),
      })

      setStatus('generating')
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成失败')
      setStatus('error')
    }
  }, [uploadImage])

  useEffect(() => {
    if (currentGenerationId && status === 'generating') {
      const interval = setInterval(async () => {
        try {
          const response = await fetch(`/api/status?id=${currentGenerationId}`)
          const data = await response.json()

          if (data.error) {
            throw new Error(data.error)
          }

          switch (data.status) {
            case 'completed':
              if (data.processedVideoUrl) {
                setVideoUrl(data.processedVideoUrl)
                setStatus('completed')
              }
              break
            case 'processing':
              setStatus('processing')
              break
            case 'failed':
              setError('视频生成失败')
              setStatus('error')
              break
          }
        } catch (err) {
          console.error('Status check error:', err)
        }
      }, 5000)

      return () => clearInterval(interval)
    }
  }, [currentGenerationId, status])

  const handleRegenerate = useCallback(() => {
    setStatus('idle')
    setVideoUrl(null)
    setScenes([])
    setError(null)
  }, [])

  const handleHistorySelect = useCallback((item: HistoryItem) => {
    setScenes(item.scenes)
    setVideoUrl(item.processedVideoUrl)
    setStatus(item.processedVideoUrl ? 'completed' : 'idle')
  }, [])

  return (
    <div className="min-h-screen">
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center">
              <Film className="text-white" size={22} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">生活记录短视频 Agent</h1>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <Sparkles size={10} className="text-primary-400" />
                基于火山方舟 Seedance 2.0
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {status === 'idle' && (
              <InputPanel onSubmit={handleSubmit} isLoading={false} />
            )}

            {status === 'uploading' && (
              <div className="bg-white rounded-2xl shadow-lg p-8 text-center fade-in">
                <div className="w-16 h-16 border-4 border-primary-400 border-t-transparent rounded-full loading-spinner mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">正在上传图片...</h3>
                <p className="text-gray-500 text-sm">请稍候，图片上传中</p>
              </div>
            )}

            {status === 'analyzing' && (
              <div className="bg-white rounded-2xl shadow-lg p-8 text-center fade-in">
                <div className="w-16 h-16 border-4 border-primary-400 border-t-transparent rounded-full loading-spinner mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">AI 正在分析您的生活记录...</h3>
                <p className="text-gray-500 text-sm">正在拆解分镜，生成真实日常风格的拍摄脚本</p>
              </div>
            )}

            {scenes.length > 0 && status !== 'idle' && (
              <ScenePreview scenes={scenes} />
            )}

            {status === 'generating' && (
              <div className="bg-white rounded-2xl shadow-lg p-8 text-center fade-in">
                <div className="w-16 h-16 border-4 border-primary-400 border-t-transparent rounded-full loading-spinner mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">正在生成视频...</h3>
                <p className="text-gray-500 text-sm">调用 Seedance 2.0 生成 9:16 竖屏视频，请稍候</p>
                <div className="mt-4 flex justify-center gap-2">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-2 h-2 bg-primary-400 rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 0.2}s` }}
                    />
                  ))}
                </div>
              </div>
            )}

            {status === 'processing' && (
              <div className="bg-white rounded-2xl shadow-lg p-8 text-center fade-in">
                <div className="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full loading-spinner mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">视频后处理中...</h3>
                <p className="text-gray-500 text-sm">正在添加字幕、背景音乐和生活滤镜</p>
              </div>
            )}

            {videoUrl && status === 'completed' && (
              <VideoPreview videoUrl={videoUrl} onRegenerate={handleRegenerate} />
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center fade-in">
                <p className="text-red-600 font-medium">{error}</p>
                <button
                  onClick={handleRegenerate}
                  className="mt-4 py-2 px-4 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                >
                  重新尝试
                </button>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <HistoryList onSelect={handleHistorySelect} />
          </div>
        </div>
      </main>

      <footer className="bg-white/50 border-t border-gray-100 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <p className="text-center text-gray-400 text-sm">
            生活记录短视频 Agent · 基于火山方舟 Seedance 2.0
          </p>
        </div>
      </footer>
    </div>
  )
}
