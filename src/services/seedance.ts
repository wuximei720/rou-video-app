import axios from 'axios'
import { delay } from '@/lib/utils'

interface VideoGenerationRequest {
  prompt: string
  imageUrls?: string[]
  aspectRatio?: string
  duration?: number
}

interface VideoGenerationResponse {
  taskId: string
  status: string
  videoUrl?: string
}

const ARK_API_KEY = process.env.ARK_API_KEY || ''
const SEEDANCE_MODEL_ID = process.env.SEEDANCE_MODEL_ID || 'doubao-seedance-2-0'
const BASE_URL = 'https://ark.cn-beijing.volces.com/api/v3'

export async function generateVideo(request: VideoGenerationRequest): Promise<VideoGenerationResponse> {
  const content: any[] = [{
    type: 'text',
    text: request.prompt,
  }]

  if (request.imageUrls && request.imageUrls.length > 0) {
    request.imageUrls.forEach(url => {
      content.push({
        type: 'image',
        image_url: url,
      })
    })
  }

  try {
    const response = await axios.post(
      `${BASE_URL}/contents/generations/tasks`,
      {
        model: SEEDANCE_MODEL_ID,
        content,
        aspect_ratio: request.aspectRatio || '9:16',
        duration: request.duration || 8,
      },
      {
        headers: {
          'Authorization': `Bearer ${ARK_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    )

    return {
      taskId: response.data.id,
      status: 'pending',
    }
  } catch (error) {
    console.error('Seedance API error:', error)
    throw new Error('Failed to submit video generation task')
  }
}

export async function checkVideoStatus(taskId: string): Promise<VideoGenerationResponse> {
  try {
    const response = await axios.get(
      `${BASE_URL}/contents/generations/tasks/${taskId}`,
      {
        headers: {
          'Authorization': `Bearer ${ARK_API_KEY}`,
        },
        timeout: 15000,
      }
    )

    const status = response.data.status
    const videoUrl = response.data.content?.[0]?.video_url

    return {
      taskId,
      status,
      videoUrl,
    }
  } catch (error) {
    console.error('Seedance status check error:', error)
    throw new Error('Failed to check video generation status')
  }
}

export async function waitForVideo(taskId: string, maxWait: number = 300): Promise<string> {
  const startTime = Date.now()

  while (Date.now() - startTime < maxWait * 1000) {
    const result = await checkVideoStatus(taskId)

    if (result.status === 'succeeded') {
      if (result.videoUrl) {
        return result.videoUrl
      }
      throw new Error('Video generation succeeded but no URL returned')
    }

    if (result.status === 'failed') {
      throw new Error('Video generation failed')
    }

    await delay(5000)
  }

  throw new Error('Video generation timed out')
}
