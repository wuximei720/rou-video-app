import type { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { filename } = req.query
    const uploadDir = path.join(process.cwd(), 'data', 'uploads')
    const filePath = path.join(uploadDir, String(filename))

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: '文件不存在' })
    }

    const fileBuffer = fs.readFileSync(filePath)
    const ext = path.extname(filePath).toLowerCase()

    const contentTypeMap: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
    }

    res.setHeader('Content-Type', contentTypeMap[ext] || 'application/octet-stream')
    res.status(200).send(fileBuffer)
  } catch (error) {
    console.error('File serve error:', error)
    res.status(500).json({ error: '文件读取失败' })
  }
}
