import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/db'
import type { VideoGeneration } from '@prisma/client'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const history = await prisma.videoGeneration.findMany({
        orderBy: { createdAt: 'desc' },
        take: 20,
      })

      const formattedHistory = history.map((item: VideoGeneration) => ({
        ...item,
        scenes: JSON.parse(item.scenes),
      }))

      res.status(200).json(formattedHistory)
    } catch (error) {
      console.error('Get history error:', error)
      res.status(500).json({ error: '获取历史记录失败' })
    }
  } else if (req.method === 'DELETE') {
    try {
      const { id } = req.body
      await prisma.videoGeneration.delete({ where: { id } })
      res.status(200).json({ success: true })
    } catch (error) {
      console.error('Delete history error:', error)
      res.status(500).json({ error: '删除记录失败' })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}
