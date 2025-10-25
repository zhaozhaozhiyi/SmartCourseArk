// Kimi API 服务封装

interface KimiFileUploadResponse {
  id: string
  object: string
  bytes: number
  created_at: number
  filename: string
  purpose: string
}

interface KimiChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface KimiChatRequest {
  model: string
  messages: KimiChatMessage[]
  temperature?: number
  max_tokens?: number
  stream?: boolean
}

interface KimiChatResponse {
  id: string
  object: string
  created: number
  model: string
  choices: Array<{
    index: number
    message: {
      role: string
      content: string
    }
    finish_reason: string
  }>
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

interface KimiStreamChunk {
  id: string
  object: string
  created: number
  model: string
  choices: Array<{
    index: number
    delta: {
      content?: string
    }
    finish_reason?: string
  }>
}

class KimiAPI {
  private baseURL: string
  private apiKey: string

  constructor(apiKey: string, baseURL: string = 'https://api.moonshot.cn/v1') {
    this.apiKey = apiKey
    this.baseURL = baseURL
  }

  // 上传文件到Kimi
  async uploadFile(file: File): Promise<KimiFileUploadResponse> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('purpose', 'file-extract')

    const response = await fetch(`${this.baseURL}/files`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: formData
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`文件上传失败: ${response.status} ${response.statusText} - ${errorText}`)
    }

    return await response.json()
  }

  // 获取文件内容
  async getFileContent(fileId: string): Promise<string> {
    const response = await fetch(`${this.baseURL}/files/${fileId}/content`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`获取文件内容失败: ${response.status} ${response.statusText} - ${errorText}`)
    }

    return await response.text()
  }

  // 聊天对话API
  async chat(request: KimiChatRequest): Promise<KimiChatResponse> {
    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify(request)
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`API调用失败: ${response.status} ${response.statusText} - ${errorText}`)
    }

    return await response.json()
  }

  // 流式聊天API
  async chatStream(request: KimiChatRequest, onChunk: (chunk: string) => void): Promise<void> {
    const streamRequest = { ...request, stream: true }
    
    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify(streamRequest)
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`流式API调用失败: ${response.status} ${response.statusText} - ${errorText}`)
    }

    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error('无法读取响应流')
    }

    const decoder = new TextDecoder()
    let buffer = ''

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim()
            if (data === '[DONE]') return

            try {
              const parsed: KimiStreamChunk = JSON.parse(data)
              const content = parsed.choices?.[0]?.delta?.content
              if (content) {
                onChunk(content)
              }
            } catch (e) {
              console.warn('解析流数据失败:', e, '原始数据:', data)
            }
          }
        }
      }
    } finally {
      reader.releaseLock()
    }
  }

  // 检查API连接
  async checkConnection(): Promise<boolean> {
    try {
      const response = await this.chat({
        model: 'moonshot-v1-128k',
        messages: [
          {
            role: 'user',
            content: 'Hello'
          }
        ],
        max_tokens: 10
      })
      return response.choices.length > 0
    } catch (error) {
      console.error('API连接检查失败:', error)
      return false
    }
  }

  // 获取模型列表
  async getModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseURL}/models`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      })

      if (!response.ok) {
        throw new Error(`获取模型列表失败: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      return data.data?.map((model: any) => model.id) || []
    } catch (error) {
      console.error('获取模型列表失败:', error)
      return []
    }
  }
}

// 创建单例实例
let kimiInstance: KimiAPI | null = null

export const createKimiAPI = (): KimiAPI => {
  if (!kimiInstance) {
    const apiKey = import.meta.env.VITE_KIMI_API_KEY
    // 使用代理路径，避免跨域问题
    const baseURL = import.meta.env.VITE_KIMI_BASE_URL || '/v1'
    
    if (!apiKey) {
      throw new Error('未配置Kimi API密钥，请在环境变量中设置VITE_KIMI_API_KEY')
    }
    
    kimiInstance = new KimiAPI(apiKey, baseURL)
  }
  return kimiInstance
}

export default KimiAPI
