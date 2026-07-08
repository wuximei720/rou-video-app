import React, { useState, useRef } from 'react'
import { Play, Pause, Download, RotateCcw, RefreshCw } from 'lucide-react'

interface VideoPreviewProps {
  videoUrl: string
  onRegenerate: () => void
}

export default function VideoPreview({ videoUrl, onRegenerate }: VideoPreviewProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play().catch(err => {
          console.error('Play error:', err)
          setError('无法播放视频，请尝试下载')
        })
      }
    }
  }

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = videoUrl
    link.download = `video_${Date.now()}.mp4`
    link.click()
  }

  const handleReload = () => {
    if (videoRef.current) {
      setError(null)
      setIsLoading(true)
      videoRef.current.load()
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 fade-in">
      <h2 className="text-xl font-bold text-gray-800 mb-4">视频预览</h2>

      <div className="video-container mb-4 rounded-xl overflow-hidden bg-black">
        {error ? (
          <div className="flex flex-col items-center justify-center py-12 text-white">
            <RefreshCw size={32} className="text-red-400 mb-3" />
            <p className="text-gray-300 mb-2">{error}</p>
            <button
              onClick={handleReload}
              className="px-4 py-2 bg-primary-500 hover:bg-primary-600 rounded-lg text-white text-sm"
            >
              重新加载
            </button>
          </div>
        ) : (
          <div className="relative">
            <video
              ref={videoRef}
              src={videoUrl}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onLoadedData={() => {
                setIsLoading(false)
                setError(null)
              }}
              onError={(e) => {
                console.error('Video error:', e)
                setError('视频加载失败，请尝试下载')
                setIsLoading(false)
              }}
              className="w-full h-auto"
              controls
              playsInline
              muted
              preload="auto"
            />

            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="w-12 h-12 border-4 border-primary-400 border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            <div className={`absolute inset-0 flex items-center justify-center transition-opacity ${!isPlaying && !isLoading ? 'opacity-100' : 'opacity-0'}`}>
              <button
                onClick={handlePlayPause}
                className="w-16 h-16 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
              >
                {isPlaying ? <Pause size={28} /> : <Play size={28} fill="currentColor" />}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleDownload}
          className="flex-1 py-3 px-4 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
        >
          <Download size={18} />
          导出 MP4
        </button>
        <button
          onClick={onRegenerate}
          className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
        >
          <RotateCcw size={18} />
          重新生成
        </button>
      </div>
    </div>
  )
}
