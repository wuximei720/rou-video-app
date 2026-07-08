import type { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { image } = req.body

    if (!image || !image.startsWith('data:image/')) {
      return res.status(400).json({ error: '无效的图片数据' })
    }

    const base64Data = image.split(',')[1]
    const buffer = Buffer.from(base64Data, 'base64')
    const ext = image.split(';')[0].split('/')[1] || 'jpg'
    const filename = `${Date.now()}.${ext}`

    const uploadDir = path.join(process.cwd(), 'data', 'uploads')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    const filePath = path.join(uploadDir, filename)
    fs.writeFileSync(filePath, buffer)

    const protocol = req.headers['x-forwarded-proto'] || 'http'
    const host = req.headers['host'] || 'localhost:3000'
    const fullUrl = `${protocol}://${host}/api/uploads/${filename}`

    res.status(200).json({
      path: fullUrl,
      filename,
      isLocal: !req.headers['x-forwarded-proto'],
    })
  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({ error: '上传失败' })
  }
}
