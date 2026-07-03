import React from 'react'
import { Play, Camera } from 'lucide-react'

interface Scene {
  id: number
  description: string
  shotType: string
  duration: number
  prompt: string
}

interface ScenePreviewProps {
  scenes: Scene[]
}

export default function ScenePreview({ scenes }: ScenePreviewProps) {
  const shotTypeColors: Record<string, string> = {
    '全景': 'bg-blue-100 text-blue-600',
    '中景': 'bg-green-100 text-green-600',
    '特写': 'bg-purple-100 text-purple-600',
    '近景': 'bg-orange-100 text-orange-600',
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 fade-in">
      <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <span className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center text-white">
          <Camera size={18} />
        </span>
        AI 分镜拆解
      </h2>

      <div className="space-y-3">
        {scenes.map((scene) => (
          <div key={scene.id} className="scene-card p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 text-xs font-bold">
                    {scene.id}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${shotTypeColors[scene.shotType] || 'bg-gray-100 text-gray-600'}`}>
                    {scene.shotType}
                  </span>
                  <span className="text-xs text-gray-400">
                    {scene.duration}秒
                  </span>
                </div>
                <p className="text-gray-700 font-medium">{scene.description}</p>
              </div>
              <button className="w-10 h-10 bg-primary-50 rounded-full flex items-center justify-center text-primary-500 hover:bg-primary-100 transition-colors">
                <Play size={16} fill="currentColor" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
