import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/db'
import { analyzeScenes } from '@/services/llm'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { userInput, referenceImageUrl } = req.body

    if (!userInput) {
      return res.status(400).json({ error: '用户输入不能为空' })
    }

    const scenes = await analyzeScenes(userInput)

    const generation = await prisma.videoGeneration.create({
      data: {
        userInput,
        referenceImageUrl,
        scenes: JSON.stringify(scenes),
        status: 'analyzed',
      },
    })

    res.status(200).json({
      id: generation.id,
      status: 'analyzed',
      scenes,
    })
  } catch (error) {
    console.error('Generation error:', error)
    res.status(500).json({ error: '生成视频时发生错误' })
  }
}
