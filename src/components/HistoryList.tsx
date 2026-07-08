import React, { useState, useEffect, useRef } from 'react'
import { History, Trash2, Eye, Clock } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface HistoryItem {
  id: string
  userInput: string
  referenceImageUrl: string | null
  processedVideoUrl: string | null
  thumbnailUrl: string | null
  status: string
  createdAt: string
  scenes: Array<{ id: number; description: string; shotType: string; duration: number; prompt: string }>
}

interface HistoryListProps {
  onSelect: (item: HistoryItem) => void
}

export default function HistoryList({ onSelect }: HistoryListProps) {
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const initializedRef = useRef(false)

  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true
      fetchHistory()
    }
  }, [])

  const fetchHistory = async () => {
    try {
      const response = await fetch('/api/history')
      const data = await response.json()
      setHistory(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to fetch history:', error)
      setHistory([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await fetch('/api/history', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      setHistory(history.filter(item => item.id !== id))
    } catch (error) {
      console.error('Failed to delete:', error)
    }
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-gray-100 text-gray-600',
    analyzing: 'bg-blue-100 text-blue-600',
    generating: 'bg-yellow-100 text-yellow-600',
    processing: 'bg-purple-100 text-purple-600',
    completed: 'bg-green-100 text-green-600',
    failed: 'bg-red-100 text-red-600',
  }

  const statusLabels: Record<string, string> = {
    pending: '待处理',
    analyzing: '分析中',
    generating: '生成中',
    processing: '处理中',
    completed: '已完成',
    failed: '失败',
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 fade-in">
      <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <span className="w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center text-white">
          <History size={18} />
        </span>
        历史记录
      </h2>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="w-8 h-8 border-2 border-primary-400 border-t-transparent rounded-full loading-spinner mx-auto mb-2" />
          <p className="text-gray-400 text-sm">加载中...</p>
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-8">
          <History className="mx-auto text-gray-300 mb-2" size={48} />
          <p className="text-gray-400">暂无历史记录</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {history.map((item) => (
            <div
              key={item.id}
              className="scene-card p-4 flex items-center gap-3"
            >
              {item.processedVideoUrl ? (
                <div
                  className="w-16 h-28 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity relative"
                  onClick={() => onSelect(item)}
                >
                  {item.thumbnailUrl ? (
                    <img
                      src={item.thumbnailUrl}
                      alt="视频缩略图"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <video
                      src={item.processedVideoUrl}
                      poster=""
                      className="w-full h-full object-cover"
                      muted
                      playsInline
                    />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <svg viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                      <polygon points="23 7 16 12 23 17 23 7"></polygon>
                      <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                    </svg>
                  </div>
                </div>
              ) : (
                <div className="w-16 h-28 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <VideoIcon size={24} className="text-gray-400" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <p className="text-gray-700 font-medium truncate">{item.userInput}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className={`px-1.5 py-0.5 rounded-full text-xs ${statusColors[item.status] || 'bg-gray-100 text-gray-600'}`}>
                    {statusLabels[item.status] || item.status}
                  </span>
                  <span className="text-xs text-gray-400 flex items-center gap-0.5">
                    <Clock size={9} />
                    {formatDate(new Date(item.createdAt))}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {item.processedVideoUrl && (
                  <button
                    onClick={() => onSelect(item)}
                    className="w-8 h-8 bg-primary-50 rounded-full flex items-center justify-center text-primary-500 hover:bg-primary-100 transition-colors"
                    title="预览"
                  >
                    <Eye size={14} />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(item.id)}
                  className="w-8 h-8 bg-red-50 rounded-full flex items-center justify-center text-red-500 hover:bg-red-100 transition-colors"
                  title="删除"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function VideoIcon({ size, className }: { size: number; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={size} height={size} className={className}>
      <polygon points="23 7 16 12 23 17 23 7"></polygon>
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
    </svg>
  )
}
