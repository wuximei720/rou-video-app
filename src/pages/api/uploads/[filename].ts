import type { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { filename } = req.query

  if (!filename || typeof filename !== 'string') {
    return res.status(400).json({ error: 'Invalid filename' })
  }

  const uploadDir = path.join(process.cwd(), 'data', 'uploads')
  const filePath = path.join(uploadDir, filename)

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' })
  }

  const fileBuffer = fs.readFileSync(filePath)
  const ext = path.extname(filename).toLowerCase()

  let contentType = 'image/jpeg'
  if (ext === '.png') contentType = 'image/png'
  if (ext === '.gif') contentType = 'image/gif'
  if (ext === '.webp') contentType = 'image/webp'

  res.setHeader('Content-Type', contentType)
  res.setHeader('Cache-Control', 'public, max-age=31536000')
  res.status(200).send(fileBuffer)
}
