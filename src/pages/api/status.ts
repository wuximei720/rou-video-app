import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { id } = req.query
      const generation = await prisma.videoGeneration.findUnique({
        where: { id: String(id) },
      })

      if (!generation) {
        return res.status(404).json({ error: '记录不存在' })
      }

      res.status(200).json(generation)
    } catch (error) {
      console.error('Get status error:', error)
      res.status(500).json({ error: '获取状态失败' })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}
