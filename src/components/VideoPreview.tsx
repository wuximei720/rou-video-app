import React, { useState } from 'react'
import { Play, Pause, Download, RotateCcw } from 'lucide-react'

interface VideoPreviewProps {
  videoUrl: string
  onRegenerate: () => void
}

export default function VideoPreview({ videoUrl, onRegenerate }: VideoPreviewProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [showControls, setShowControls] = useState(true)

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = videoUrl
    link.download = `video_${Date.now()}.mp4`
    link.click()
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 fade-in">
      <h2 className="text-xl font-bold text-gray-800 mb-4">视频预览</h2>

      <div className="video-container mb-4 relative" onMouseEnter={() => setShowControls(true)} onMouseLeave={() => setShowControls(false)}>
        <video
          src={videoUrl}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          className="w-full h-full"
          controls
        />

        <div className={`absolute inset-0 flex items-center justify-center transition-opacity ${showControls ? 'opacity-100' : 'opacity-0'}`}>
          <button
            onClick={handlePlayPause}
            className="w-16 h-16 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
          >
            {isPlaying ? <Pause size={28} /> : <Play size={28} fill="currentColor" />}
          </button>
        </div>
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
