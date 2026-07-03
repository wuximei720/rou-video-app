import axios from 'axios'

export interface Scene {
  id: number
  description: string
  shotType: string
  duration: number
  prompt: string
}

const DOUBAO_API_KEY = process.env.DOUBAO_API_KEY || ''
const DOUBAO_BASE_URL = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions'

const SCENE_ANALYSIS_PROMPT = `
你是一位专业的生活记录短视频导演。请根据用户的文字描述，拆解成多个生活化分镜场景。

要求：
1. 将内容拆解为3-5个分镜，每个分镜描述一个具体的生活场景
2. 每个分镜需要包含：场景描述、镜头类型（全景/中景/特写/近景）、时长（2-4秒）
3. 生成真实日常实拍风格的Prompt，强调生活化、自然、真实感
4. 风格要求：温暖、治愈、日常、柔和光线、手机实拍质感
5. 输出为JSON格式，包含scenes数组

示例格式：
{
  "scenes": [
    {
      "id": 1,
      "description": "清晨阳光透过窗帘洒在床上",
      "shotType": "全景",
      "duration": 3,
      "prompt": "Morning sunlight gently filtering through sheer curtains onto a cozy bed, soft warm lighting, realistic bedroom interior, peaceful atmosphere, phone camera quality"
    }
  ]
}

用户输入：
`

export async function analyzeScenes(userInput: string): Promise<Scene[]> {
  try {
    const response = await axios.post(
      DOUBAO_BASE_URL,
      {
        model: process.env.DOUBAO_MODEL_ID || 'doubao-seed-2-0-lite-260428',
        messages: [
          {
            role: 'system',
            content: SCENE_ANALYSIS_PROMPT,
          },
          {
            role: 'user',
            content: userInput,
          },
        ],
        max_tokens: 2000,
        temperature: 0.7,
      },
      {
        headers: {
          'Authorization': `Bearer ${DOUBAO_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 60000,
      }
    )

    const content = response.data.choices[0].message.content

    try {
      const jsonStart = content.indexOf('{')
      const jsonEnd = content.lastIndexOf('}') + 1
      const jsonString = content.substring(jsonStart, jsonEnd)
      const result = JSON.parse(jsonString)

      if (result.scenes && Array.isArray(result.scenes)) {
        return result.scenes
      }
    } catch (e) {
      console.warn('Failed to parse JSON response, trying fallback')
    }

    return fallbackScenes(userInput)
  } catch (error) {
    console.error('LLM API error:', error)
    return fallbackScenes(userInput)
  }
}

function fallbackScenes(userInput: string): Scene[] {
  return [
    {
      id: 1,
      description: '生活场景开始',
      shotType: '全景',
      duration: 3,
      prompt: `Beautiful daily life scene, ${userInput}, soft natural lighting, realistic everyday moments, warm and cozy atmosphere, phone camera quality, vertical 9:16 aspect ratio`,
    },
    {
      id: 2,
      description: '生活场景细节',
      shotType: '中景',
      duration: 3,
      prompt: `Close up of daily life details, ${userInput}, soft natural lighting, realistic everyday moments, warm and cozy atmosphere, phone camera quality, vertical 9:16 aspect ratio`,
    },
    {
      id: 3,
      description: '生活场景结束',
      shotType: '特写',
      duration: 2,
      prompt: `Intimate close up shot of daily life, ${userInput}, soft natural lighting, realistic everyday moments, warm and cozy atmosphere, phone camera quality, vertical 9:16 aspect ratio`,
    },
  ]
}
