import cloudinary from 'cloudinary'

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function uploadImageToCloudinary(imageBuffer: Buffer, filename: string): Promise<string | null> {
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    console.warn('Cloudinary not configured, skipping upload')
    return null
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.v2.uploader.upload_stream(
      {
        folder: 'rou-video-app',
        public_id: filename,
        resource_type: 'image',
        format: 'jpg',
        quality: 'auto',
        width: 1024,
        crop: 'limit',
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error)
          reject(error)
        } else {
          resolve(result?.secure_url || null)
        }
      }
    )

    stream.end(imageBuffer)
  })
}
