import ffmpeg from 'fluent-ffmpeg'
import axios from 'axios'
import fs from 'fs'
import path from 'path'

export async function downloadVideo(url: string, outputPath: string): Promise<string> {
  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream',
  })

  return new Promise((resolve, reject) => {
    const writer = fs.createWriteStream(outputPath)
    response.data.pipe(writer)
    writer.on('finish', () => resolve(outputPath))
    writer.on('error', reject)
  })
}

export async function addSubtitles(inputPath: string, outputPath: string, subtitles: string[], durations: number[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const srtPath = path.resolve(inputPath.replace('.mp4', '.srt'))
    let currentTime = 0
    const srtContent = subtitles.map((text, index) => {
      const startTime = formatTime(currentTime)
      const duration = durations[index] || 3
      currentTime += duration
      const endTime = formatTime(currentTime)
      return `${index + 1}\n${startTime} --> ${endTime}\n${text}\n`
    }).join('\n')

    fs.writeFileSync(srtPath, srtContent, 'utf-8')

    const escapedSrtPath = srtPath.replace(/\\/g, '/').replace(/'/g, "\\'")

    ffmpeg(inputPath)
      .outputOptions([
        `-vf`,
        `subtitles='${escapedSrtPath}':force_style='FontName=SimHei,FontSize=24,PrimaryColour=&HFFFFFF&,OutlineColour=&H000000&,Outline=1,Shadow=2,MarginV=20'`,
        '-c:v libx264',
        '-crf 18',
        '-preset slow',
        '-c:a aac',
        '-b:a 192k',
      ])
      .save(outputPath)
      .on('end', () => {
        if (fs.existsSync(srtPath)) {
          fs.unlinkSync(srtPath)
        }
        resolve(outputPath)
      })
      .on('error', (err) => {
        if (fs.existsSync(srtPath)) {
          fs.unlinkSync(srtPath)
        }
        reject(err)
      })
  })
}

export async function addBackgroundMusic(inputPath: string, outputPath: string, bgmPath?: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const command = ffmpeg(inputPath)

    if (bgmPath && fs.existsSync(bgmPath)) {
      command
        .input(bgmPath)
        .outputOptions([
          '-filter_complex', '[1:a]volume=0.3[a1];[0:a][a1]amix=inputs=2:duration=first:dropout_transition=3[aout]',
          '-map', '0:v',
          '-map', '[aout]',
          '-c:v libx264',
          '-crf 18',
          '-preset slow',
          '-c:a aac',
          '-b:a 192k',
        ])
    } else {
      command
        .outputOptions([
          '-c:v libx264',
          '-crf 18',
          '-preset slow',
          '-c:a copy',
        ])
    }

    command
      .save(outputPath)
      .on('end', () => resolve(outputPath))
      .on('error', reject)
  })
}

export async function applyFilter(inputPath: string, outputPath: string, filter: string = 'warm'): Promise<string> {
  return new Promise((resolve, reject) => {
    let filterComplex = ''

    switch (filter) {
      case 'warm':
        filterComplex = 'eq=contrast=1.05:saturation=1.1:brightness=0.05'
        break
      case 'cool':
        filterComplex = 'eq=contrast=1.05:saturation=0.9:brightness=0.02'
        break
      case 'cinematic':
        filterComplex = 'eq=contrast=1.1:saturation=1.15:brightness=0,vignette=PI*2'
        break
      default:
        filterComplex = 'eq=saturation=1.05'
    }

    ffmpeg(inputPath)
      .outputOptions([
        '-vf', filterComplex,
        '-c:v libx264',
        '-crf 18',
        '-preset slow',
        '-c:a copy',
      ])
      .save(outputPath)
      .on('end', () => resolve(outputPath))
      .on('error', reject)
  })
}

export async function processVideo(
  inputUrl: string,
  subtitles: string[] = [],
  durations: number[] = [],
  bgmPath?: string,
  filter: string = 'warm'
): Promise<string> {
  const tempDir = path.join(process.cwd(), 'public', 'temp')
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true })
  }

  const timestamp = Date.now()
  const downloadedPath = path.join(tempDir, `${timestamp}_downloaded.mp4`)
  const subtitledPath = path.join(tempDir, `${timestamp}_subtitled.mp4`)
  const bgmPathResult = path.join(tempDir, `${timestamp}_bgm.mp4`)
  const filteredPath = path.join(tempDir, `${timestamp}_filtered.mp4`)
  const finalPath = path.join(tempDir, `${timestamp}_final.mp4`)

  try {
    await downloadVideo(inputUrl, downloadedPath)

    if (subtitles.length > 0) {
      await addSubtitles(downloadedPath, subtitledPath, subtitles, durations)
    } else {
      fs.copyFileSync(downloadedPath, subtitledPath)
    }

    if (bgmPath) {
      await addBackgroundMusic(subtitledPath, bgmPathResult, bgmPath)
    } else {
      fs.copyFileSync(subtitledPath, bgmPathResult)
    }

    await applyFilter(bgmPathResult, filteredPath, filter)

    fs.copyFileSync(filteredPath, finalPath)

    return `/temp/${timestamp}_final.mp4`
  } catch (error) {
    console.error('Video processing error:', error)
    cleanupFiles([downloadedPath, subtitledPath, bgmPathResult, filteredPath, finalPath])
    return inputUrl
  }
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  const ms = Math.floor((seconds % 1) * 1000)

  return `${pad(h)}:${pad(m)}:${pad(s)}.${pad(ms, 3)}`
}

function pad(num: number, length: number = 2): string {
  return num.toString().padStart(length, '0')
}

function cleanupFiles(files: string[]) {
  files.forEach(file => {
    if (fs.existsSync(file)) {
      try {
        fs.unlinkSync(file)
      } catch (e) {
        console.warn(`Failed to delete file: ${file}`)
      }
    }
  })
}
