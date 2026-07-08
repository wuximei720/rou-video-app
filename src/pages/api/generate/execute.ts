import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/db'
import { generateVideo, waitForVideo } from '@/services/seedance'
import { processVideo } from '@/services/video'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { id } = req.body

    const generation = await prisma.videoGeneration.findUnique({
      where: { id },
    })

    if (!generation) {
      return res.status(404).json({ error: '记录不存在' })
    }

    if (generation.status === 'completed') {
      return res.status(200).json({
        id: generation.id,
        status: generation.status,
        processedVideoUrl: generation.processedVideoUrl,
      })
    }

    if (generation.status === 'generating') {
      return res.status(200).json({
        id: generation.id,
        status: generation.status,
      })
    }

    await prisma.videoGeneration.update({
      where: { id },
      data: { status: 'generating' },
    })

    res.status(202).json({
      id,
      status: 'generating',
      message: '视频生成任务已提交，请通过 /api/status 轮询查询进度',
    })

    await executeVideoGeneration(id)
  } catch (error) {
    console.error('Execute error:', error)
    if (req.body.id) {
      try {
        await prisma.videoGeneration.update({
          where: { id: req.body.id },
          data: { status: 'failed' },
        })
      } catch (e) {
        console.error('Failed to update status:', e)
      }
    }
    res.status(500).json({ error: '视频生成失败' })
  }
}

async function executeVideoGeneration(id: string) {
  try {
    const generation = await prisma.videoGeneration.findUnique({
      where: { id },
    })

    if (!generation) {
      return
    }

    const scenes = JSON.parse(generation.scenes) as Array<{ prompt: string; duration: number; description: string }>

    let imageUrls: string[] | undefined
    if (generation.referenceImageUrl) {
      const url = generation.referenceImageUrl
      if (url.startsWith('http://') || url.startsWith('https://')) {
        imageUrls = [url]
      } else {
        console.warn('Skipping reference image - invalid URL format:', url)
      }
    }

    const videoUrl = await generateVideo({
      prompt: scenes.map(s => s.prompt).join(' | '),
      imageUrls,
      aspectRatio: '9:16',
      duration: 12,
      resolution: '720p',
      generateAudio: true,
    })

    const { videoUrl: generatedVideoUrl, lastFrameUrl } = await waitForVideo(videoUrl.taskId)

    let processedUrl = generatedVideoUrl
    try {
      const subtitles = scenes.map(s => s.description)
      const durations = scenes.map(s => s.duration)
      processedUrl = await processVideo(generatedVideoUrl, subtitles, durations, undefined, 'warm')
    } catch (processError) {
      console.warn('Video processing skipped (ffmpeg not available):', processError)
    }

    await prisma.videoGeneration.update({
      where: { id },
      data: {
        generatedVideoUrl,
        processedVideoUrl: processedUrl,
        thumbnailUrl: lastFrameUrl,
        status: 'completed',
      },
    })
  } catch (error) {
    console.error('Video generation execution error:', error)
    try {
      await prisma.videoGeneration.update({
        where: { id },
        data: { status: 'failed' },
      })
    } catch (e) {
      console.error('Failed to update status:', e)
    }
  }
}
