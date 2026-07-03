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

    for (let i = 0; i < scenes.length; i++) {
      const scene = scenes[i]
      try {
        const imageUrls = generation.referenceImageUrl
          ? [generation.referenceImageUrl]
          : undefined

        const videoResponse = await generateVideo({
          prompt: scene.prompt,
          imageUrls,
          aspectRatio: '9:16',
          duration: scene.duration,
        })

        const videoUrl = await waitForVideo(videoResponse.taskId)

        await prisma.videoGeneration.update({
          where: { id },
          data: {
            generatedVideoUrl: videoUrl,
            status: 'processing',
          },
        })

        const subtitles = scenes.map(s => s.description)
        const durations = scenes.map(s => s.duration)
        const processedUrl = await processVideo(videoUrl, subtitles, durations, undefined, 'warm')

        await prisma.videoGeneration.update({
          where: { id },
          data: {
            processedVideoUrl: processedUrl,
            status: 'completed',
          },
        })

        return
      } catch (error) {
        console.error(`Scene ${i + 1} failed:`, error)
        continue
      }
    }

    await prisma.videoGeneration.update({
      where: { id },
      data: { status: 'failed' },
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
