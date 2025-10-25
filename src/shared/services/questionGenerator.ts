// 题目生成服务

import { createKimiAPI } from '@/shared/api/kimi'
import { QuestionType, QuestionDifficulty } from '@/types/course'

interface GeneratedQuestion {
  type: QuestionType
  content: string
  options?: string[]
  answer: string
  explanation: string
  difficulty: QuestionDifficulty
}

interface QuestionGenerationResult {
  questions: GeneratedQuestion[]
}

export class QuestionGenerator {
  private kimiAPI = createKimiAPI()

  // 流式生成题目
  async generateQuestionsStream(
    fileId: string,
    chapterTitle: string,
    questionConfigs: Array<{ type: QuestionType; count: number }>,
    options: {
      language?: string
      difficulty?: QuestionDifficulty
    },
    onChunk: (chunk: string, isComplete: boolean) => void
  ): Promise<GeneratedQuestion[]> {
    try {
      let fileContent = ''
      
      // 如果有文件ID，尝试获取文件内容
      if (fileId && fileId.trim() !== '') {
        try {
          fileContent = await this.kimiAPI.getFileContent(fileId)
        } catch (error) {
          console.warn('获取文件内容失败，将使用默认内容:', error)
          fileContent = this.getDefaultContent(chapterTitle)
        }
      } else {
        // 没有文件ID时使用默认内容
        fileContent = this.getDefaultContent(chapterTitle)
      }
      
      // 计算总题目数
      const totalCount = questionConfigs.reduce((sum, config) => sum + config.count, 0)
      
      // 构建题型要求
      const typeRequirements = questionConfigs.map(config => 
        `${this.getTypeLabel(config.type)} ${config.count}道`
      ).join('、')
      
      // 语言提示
      const languagePrompt = this.getLanguagePrompt(options.language || 'zh-CN')
      
      const prompt = `
基于上传的文档内容，为章节"${chapterTitle}"生成${totalCount}道题目。

文档内容：
${fileContent.substring(0, 6000)} ${fileContent.length > 6000 ? '...(内容过长，已截取前6000字符)' : ''}

题目要求：
${typeRequirements}

${languagePrompt}

请按照以下JSON格式生成题目：
{
  "questions": [
    {
      "type": "single|multiple|judge|fill|essay",
      "content": "题目内容",
      "options": ["选项A", "选项B", "选项C", "选项D"],
      "answer": "正确答案",
      "explanation": "详细解析",
      "difficulty": "${options.difficulty || 'medium'}"
    }
  ]
}

要求：
1. 严格按照JSON格式输出
2. 题目内容要清晰明确
3. 答案要准确，基于文档内容
4. 解析要详细，帮助学习者理解
5. 判断题答案只能是"正确"或"错误"
6. 填空题用___表示填空位置
`

      let jsonBuffer = ''
      
      await this.kimiAPI.chatStream({
        model: 'moonshot-v1-128k',
        messages: [
          {
            role: 'system',
            content: '你是 Kimi，由 Moonshot AI 提供的人工智能助手。请严格按照JSON格式返回结果，不要添加任何markdown标记。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3
      }, (chunk: string) => {
        jsonBuffer += chunk
        onChunk(jsonBuffer, false)
      })
      
      // 标记完成
      onChunk(jsonBuffer, true)
      
      // 解析最终结果
      return this.parseQuestionsFromJson(jsonBuffer)
    } catch (error) {
      console.error('流式生成题目失败:', error)
      throw error
    }
  }

  // 基于文件ID生成题目
  async generateQuestions(
    fileId: string, 
    chapterTitle: string, 
    questionCount: number = 5,
    options?: {
      types?: QuestionType[]
      difficulties?: QuestionDifficulty[]
    }
  ): Promise<GeneratedQuestion[]> {
    try {
      // 获取文件内容
      const fileContent = await this.kimiAPI.getFileContent(fileId)
      
      const typeStr = options?.types?.join('、') || '单选题、多选题、判断题、填空题'
      const difficultyStr = options?.difficulties?.join('、') || '简单、中等、困难'
      
      const prompt = `
基于上传的文档内容，为章节"${chapterTitle}"生成${questionCount}道题目。

文档内容：
${fileContent.substring(0, 6000)} ${fileContent.length > 6000 ? '...(内容过长，已截取前6000字符)' : ''}

请按照以下JSON格式生成题目：
{
  "questions": [
    {
      "type": "single|multiple|judge|fill|essay",
      "content": "题目内容",
      "options": ["选项A", "选项B", "选项C", "选项D"],
      "answer": "正确答案",
      "explanation": "详细解析",
      "difficulty": "easy|medium|hard"
    }
  ]
}

要求：
1. 题目类型要多样化，包括：${typeStr}
2. 难度要适中，包括：${difficultyStr}
3. 答案要准确，基于文档内容
4. 解析要详细，帮助学习者理解
5. 题目内容要清晰明确
6. 选项要合理，避免明显错误
7. 判断题答案只能是"正确"或"错误"
8. 填空题要明确填空位置，用___表示
9. 题目要基于文档实际内容，不能虚构
10. 每道题都要有明确的答案和解析
`

      const response = await this.kimiAPI.chat({
        model: 'moonshot-v1-128k',
        messages: [
          {
            role: 'system',
            content: '你是 Kimi，由 Moonshot AI 提供的人工智能助手，你更擅长中文和英文的对话。你会为用户提供安全，有帮助，准确的回答。请严格按照JSON格式返回结果。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3
      })

      const responseContent = response.choices[0].message.content
      
      try {
        // 尝试解析JSON
        let result: QuestionGenerationResult
        try {
          result = JSON.parse(responseContent)
        } catch {
          // 如果直接解析失败，尝试提取JSON部分
          const jsonMatch = responseContent.match(/\{[\s\S]*\}/)
          if (jsonMatch) {
            result = JSON.parse(jsonMatch[0])
          } else {
            throw new Error('无法解析AI返回的题目')
          }
        }
        
        // 验证返回的数据结构
        if (!result.questions || !Array.isArray(result.questions)) {
          throw new Error('AI返回的题目格式不正确')
        }
        
        // 验证每道题目的格式
        const validQuestions = result.questions.filter(q => 
          q.type && q.content && q.answer && q.explanation && q.difficulty
        )
        
        if (validQuestions.length === 0) {
          throw new Error('没有生成有效的题目')
        }
        
        return validQuestions
      } catch (error) {
        console.error('解析AI生成题目失败:', error)
        console.error('AI返回内容:', responseContent)
        
        // 返回默认题目
        return [{
          type: QuestionType.SINGLE,
          content: '请根据文档内容回答相关问题。',
          options: ['选项A', '选项B', '选项C', '选项D'],
          answer: '选项A',
          explanation: '请参考文档内容进行答题。',
          difficulty: QuestionDifficulty.MEDIUM
        }]
      }
    } catch (error) {
      console.error('生成题目失败:', error)
      throw new Error(`生成题目失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  // 生成特定类型的题目
  async generateQuestionsByType(
    fileId: string,
    chapterTitle: string,
    questionType: QuestionType,
    count: number = 3
  ): Promise<GeneratedQuestion[]> {
    try {
      // 获取文件内容
      const fileContent = await this.kimiAPI.getFileContent(fileId)
      
      let typeDescription = ''
      switch (questionType) {
        case 'single':
          typeDescription = '单选题（每题4个选项，只有一个正确答案）'
          break
        case 'multiple':
          typeDescription = '多选题（每题4个选项，可能有多个正确答案）'
          break
        case 'judge':
          typeDescription = '判断题（只有"正确"或"错误"两个选项）'
          break
        case 'fill':
          typeDescription = '填空题（在空白处填入正确答案，用___表示填空位置）'
          break
        case 'essay':
          typeDescription = '简答题（需要简要回答，答案要简洁明了）'
          break
      }
      
      const prompt = `
基于上传的文档内容，为章节"${chapterTitle}"生成${count}道${typeDescription}。

文档内容：
${fileContent.substring(0, 6000)} ${fileContent.length > 6000 ? '...(内容过长，已截取前6000字符)' : ''}

请按照以下JSON格式生成题目：
{
  "questions": [
    {
      "type": "${questionType}",
      "content": "题目内容",
      ${questionType !== 'judge' && questionType !== 'essay' ? '"options": ["选项A", "选项B", "选项C", "选项D"],' : ''}
      "answer": "正确答案",
      "explanation": "详细解析",
      "difficulty": "easy|medium|hard"
    }
  ]
}

要求：
1. 题目类型必须是：${questionType}
2. 题目内容要清晰明确
3. 答案要准确，基于文档内容
4. 解析要详细，帮助学习者理解
5. 难度要适中
6. 题目要基于文档实际内容，不能虚构
7. ${questionType === 'judge' ? '判断题答案只能是"正确"或"错误"' : ''}
8. ${questionType === 'fill' ? '填空题用___表示填空位置' : ''}
`

      const response = await this.kimiAPI.chat({
        model: 'moonshot-v1-128k',
        messages: [
          {
            role: 'system',
            content: '你是 Kimi，由 Moonshot AI 提供的人工智能助手，你更擅长中文和英文的对话。你会为用户提供安全，有帮助，准确的回答。请严格按照JSON格式返回结果。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3
      })

      const responseContent = response.choices[0].message.content
      
      try {
        // 尝试解析JSON
        let result: QuestionGenerationResult
        try {
          result = JSON.parse(responseContent)
        } catch {
          // 如果直接解析失败，尝试提取JSON部分
          const jsonMatch = responseContent.match(/\{[\s\S]*\}/)
          if (jsonMatch) {
            result = JSON.parse(jsonMatch[0])
          } else {
            throw new Error('无法解析AI返回的题目')
          }
        }
        
        // 验证返回的数据结构
        if (!result.questions || !Array.isArray(result.questions)) {
          throw new Error('AI返回的题目格式不正确')
        }
        
        // 验证每道题目的格式
        const validQuestions = result.questions.filter(q => 
          q.type === questionType && q.content && q.answer && q.explanation && q.difficulty
        )
        
        if (validQuestions.length === 0) {
          throw new Error('没有生成有效的题目')
        }
        
        return validQuestions
      } catch (error) {
        console.error('解析AI生成题目失败:', error)
        console.error('AI返回内容:', responseContent)
        
        // 返回默认题目
        return [{
          type: questionType,
          content: '请根据文档内容回答相关问题。',
          ...(questionType !== 'judge' && questionType !== 'essay' ? {
            options: ['选项A', '选项B', '选项C', '选项D']
          } : {}),
          answer: questionType === 'judge' ? '正确' : '请参考文档内容',
          explanation: '请参考文档内容进行答题。',
          difficulty: QuestionDifficulty.MEDIUM
        }]
      }
    } catch (error) {
      console.error('生成题目失败:', error)
      throw new Error(`生成题目失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  // 优化题目
  async optimizeQuestion(
    fileId: string,
    question: GeneratedQuestion,
    feedback?: string
  ): Promise<GeneratedQuestion> {
    try {
      // 获取文件内容
      const fileContent = await this.kimiAPI.getFileContent(fileId)
      
      const prompt = `
基于以下文档内容和题目，请优化这道题目：

文档内容：
${fileContent.substring(0, 4000)} ${fileContent.length > 4000 ? '...(内容过长，已截取前4000字符)' : ''}

当前题目：
${JSON.stringify(question, null, 2)}

${feedback ? `用户反馈：${feedback}` : ''}

第二个问题：请按照以下JSON格式返回优化后的题目：
{
  "type": "题目类型",
  "content": "题目内容",
  "options": ["选项A", "选项B", "选项C", "选项D"],
  "answer": "正确答案",
  "explanation": "详细解析",
  "difficulty": "难度级别"
}

优化要求：
1. 保持题目类型不变
2. 根据用户反馈进行相应调整
3. 确保题目内容与文档高度相关
4. 答案要准确，解析要详细
5. 题目表述要清晰明确
`

      const response = await this.kimiAPI.chat({
        model: 'moonshot-v1-128k',
        messages: [
          {
            role: 'system',
            content: '你是 Kimi，由 Moonshot AI 提供的人工智能助手，你更擅长中文和英文的对话。你会为用户提供安全，有帮助，准确的回答。请严格按照JSON格式返回结果。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3
      })

      const responseContent = response.choices[0].message.content
      
      try {
        // 尝试解析JSON
        let optimizedQuestion: GeneratedQuestion
        try {
          optimizedQuestion = JSON.parse(responseContent)
        } catch {
          // 如果直接解析失败，尝试提取JSON部分
          const jsonMatch = responseContent.match(/\{[\s\S]*\}/)
          if (jsonMatch) {
            optimizedQuestion = JSON.parse(jsonMatch[0])
          } else {
            throw new Error('无法解析AI返回的优化题目')
          }
        }
        
        // 验证返回的数据结构
        if (!optimizedQuestion.type || !optimizedQuestion.content || !optimizedQuestion.answer) {
          throw new Error('AI返回的优化题目格式不正确')
        }
        
        return optimizedQuestion
      } catch (error) {
        console.error('解析AI优化题目失败:', error)
        console.error('AI返回内容:', responseContent)
        
        // 返回原始题目
        return question
      }
    } catch (error) {
      console.error('优化题目失败:', error)
      throw new Error(`优化题目失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  // 验证题目答案
  async validateQuestionAnswer(
    fileId: string,
    question: GeneratedQuestion,
    userAnswer: string
  ): Promise<{
    isCorrect: boolean
    explanation: string
    correctAnswer: string
  }> {
    try {
      // 获取文件内容
      const fileContent = await this.kimiAPI.getFileContent(fileId)
      
      const prompt = `
基于以下文档内容，请验证用户答案是否正确：

文档内容：
${fileContent.substring(0, 4000)} ${fileContent.length > 4000 ? '...(内容过长，已截取前4000字符)' : ''}

题目：${question.content}
正确答案：${question.answer}
用户答案：${userAnswer}

请按照以下JSON格式返回验证结果：
{
  "isCorrect": true|false,
  "explanation": "详细解析",
  "correctAnswer": "正确答案"
}

要求：
1. 准确判断用户答案是否正确
2. 提供详细的解析说明
3. 给出正确答案
4. 解析要基于文档内容
`

      const response = await this.kimiAPI.chat({
        model: 'moonshot-v1-128k',
        messages: [
          {
            role: 'system',
            content: '你是 Kimi，由 Moonshot AI 提供的人工智能助手，你更擅长中文和英文的对话。你会为用户提供安全，有帮助，准确的回答。请严格按照JSON格式返回结果。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1
      })

      const responseContent = response.choices[0].message.content
      
      try {
        // 尝试解析JSON
        let result: {
          isCorrect: boolean
          explanation: string
          correctAnswer: string
        }
        try {
          result = JSON.parse(responseContent)
        } catch {
          // 如果直接解析失败，尝试提取JSON部分
          const jsonMatch = responseContent.match(/\{[\s\S]*\}/)
          if (jsonMatch) {
            result = JSON.parse(jsonMatch[0])
          } else {
            throw new Error('无法解析AI返回的验证结果')
          }
        }
        
        return result
      } catch (error) {
        console.error('解析AI验证结果失败:', error)
        console.error('AI返回内容:', responseContent)
        
        // 返回默认验证结果
        const isCorrect = userAnswer === question.answer
        return {
          isCorrect,
          explanation: question.explanation,
          correctAnswer: question.answer
        }
      }
    } catch (error) {
      console.error('验证题目答案失败:', error)
      throw new Error(`验证题目答案失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  // 基于上传文件生成题目
  async generateQuestionsFromFile(
    file: File,
    topic: string,
    questionCount: number = 5,
    options?: {
      types?: QuestionType[]
      difficulties?: QuestionDifficulty[]
    }
  ): Promise<GeneratedQuestion[]> {
    try {
      // 上传文件到Kimi
      await this.kimiAPI.uploadFile(file)
      
      const typeStr = options?.types?.join('、') || '单选题、多选题、判断题、填空题'
      const difficultyStr = options?.difficulties?.join('、') || '简单、中等、困难'
      
      const prompt = `
基于上传的文档内容，为主题"${topic}"生成${questionCount}道题目。

请按照以下JSON格式生成题目：
{
  "questions": [
    {
      "type": "single|multiple|judge|fill|essay",
      "content": "题目内容",
      "options": ["选项A", "选项B", "选项C", "选项D"],
      "answer": "正确答案",
      "explanation": "详细解析",
      "difficulty": "easy|medium|hard"
    }
  ]
}

要求：
1. 题目类型要多样化，包括：${typeStr}
2. 难度要适中，包括：${difficultyStr}
3. 答案要准确，基于文档内容
4. 解析要详细，帮助学习者理解
5. 题目内容要清晰明确
6. 选项要合理，避免明显错误
7. 判断题答案只能是"正确"或"错误"
8. 填空题要明确填空位置，用___表示
9. 题目要基于文档实际内容，不能虚构
10. 每道题都要有明确的答案和解析
`

      const response = await this.kimiAPI.chat({
        model: 'moonshot-v1-128k',
        messages: [
          {
            role: 'system',
            content: '你是 Kimi，由 Moonshot AI 提供的人工智能助手，你更擅长中文和英文的对话。你会为用户提供安全，有帮助，准确的回答。请严格按照JSON格式返回结果。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3
      })

      const responseContent = response.choices[0].message.content
      
      try {
        // 尝试解析JSON
        let result: QuestionGenerationResult
        try {
          result = JSON.parse(responseContent)
        } catch {
          // 如果直接解析失败，尝试提取JSON部分
          const jsonMatch = responseContent.match(/\{[\s\S]*\}/)
          if (jsonMatch) {
            result = JSON.parse(jsonMatch[0])
          } else {
            throw new Error('无法解析AI返回的题目')
          }
        }
        
        // 验证返回的数据结构
        if (!result.questions || !Array.isArray(result.questions)) {
          throw new Error('AI返回的题目格式不正确')
        }
        
        // 验证每道题目的格式
        const validQuestions = result.questions.filter(q => 
          q.type && q.content && q.answer && q.explanation && q.difficulty
        )
        
        if (validQuestions.length === 0) {
          throw new Error('没有生成有效的题目')
        }
        
        return validQuestions
      } catch (error) {
        console.error('解析AI生成题目失败:', error)
        console.error('AI返回内容:', responseContent)
        
        // 返回默认题目
        return [{
          type: QuestionType.SINGLE,
          content: '请根据文档内容回答相关问题。',
          options: ['选项A', '选项B', '选项C', '选项D'],
          answer: '选项A',
          explanation: '请参考文档内容进行答题。',
          difficulty: QuestionDifficulty.MEDIUM
        }]
      }
    } catch (error) {
      console.error('生成题目失败:', error)
      throw new Error(`生成题目失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  // 基于文本输入生成题目
  async generateQuestionsFromText(
    content: string,
    topic: string,
    questionCount: number = 5,
    options?: {
      types?: QuestionType[]
      difficulties?: QuestionDifficulty[]
    }
  ): Promise<GeneratedQuestion[]> {
    try {
      const typeStr = options?.types?.join('、') || '单选题、多选题、判断题、填空题'
      const difficultyStr = options?.difficulties?.join('、') || '简单、中等、困难'
      
      const prompt = `
基于以下文本内容，为主题"${topic}"生成${questionCount}道题目。

文本内容：
${content.substring(0, 6000)} ${content.length > 6000 ? '...(内容过长，已截取前6000字符)' : ''}

请按照以下JSON格式生成题目：
{
  "questions": [
    {
      "type": "single|multiple|judge|fill|essay",
      "content": "题目内容",
      "options": ["选项A", "选项B", "选项C", "选项D"],
      "answer": "正确答案",
      "explanation": "详细解析",
      "difficulty": "easy|medium|hard"
    }
  ]
}

要求：
1. 题目类型要多样化，包括：${typeStr}
2. 难度要适中，包括：${difficultyStr}
3. 答案要准确，基于文本内容
4. 解析要详细，帮助学习者理解
5. 题目内容要清晰明确
6. 选项要合理，避免明显错误
7. 判断题答案只能是"正确"或"错误"
8. 填空题要明确填空位置，用___表示
9. 题目要基于文本实际内容，不能虚构
10. 每道题都要有明确的答案和解析
`

      const response = await this.kimiAPI.chat({
        model: 'moonshot-v1-128k',
        messages: [
          {
            role: 'system',
            content: '你是 Kimi，由 Moonshot AI 提供的人工智能助手，你更擅长中文和英文的对话。你会为用户提供安全，有帮助，准确的回答。请严格按照JSON格式返回结果。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3
      })

      const responseContent = response.choices[0].message.content
      
      try {
        // 尝试解析JSON
        let result: QuestionGenerationResult
        try {
          result = JSON.parse(responseContent)
        } catch {
          // 如果直接解析失败，尝试提取JSON部分
          const jsonMatch = responseContent.match(/\{[\s\S]*\}/)
          if (jsonMatch) {
            result = JSON.parse(jsonMatch[0])
          } else {
            throw new Error('无法解析AI返回的题目')
          }
        }
        
        // 验证返回的数据结构
        if (!result.questions || !Array.isArray(result.questions)) {
          throw new Error('AI返回的题目格式不正确')
        }
        
        // 验证每道题目的格式
        const validQuestions = result.questions.filter(q => 
          q.type && q.content && q.answer && q.explanation && q.difficulty
        )
        
        if (validQuestions.length === 0) {
          throw new Error('没有生成有效的题目')
        }
        
        return validQuestions
      } catch (error) {
        console.error('解析AI生成题目失败:', error)
        console.error('AI返回内容:', responseContent)
        
        // 返回默认题目
        return [{
          type: QuestionType.SINGLE,
          content: '请根据文本内容回答相关问题。',
          options: ['选项A', '选项B', '选项C', '选项D'],
          answer: '选项A',
          explanation: '请参考文本内容进行答题。',
          difficulty: QuestionDifficulty.MEDIUM
        }]
      }
    } catch (error) {
      console.error('生成题目失败:', error)
      throw new Error(`生成题目失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  // 流式生成题目（基于上传文件）
  async generateQuestionsFromFileStream(
    file: File,
    topic: string,
    questionConfigs: Array<{ type: QuestionType; count: number }>,
    options: {
      language?: string
      difficulty?: QuestionDifficulty
    },
    onChunk: (chunk: string, isComplete: boolean) => void
  ): Promise<GeneratedQuestion[]> {
    try {
      // 先上传文件获取文件ID
      await this.kimiAPI.uploadFile(file)
      
      // 计算总题目数
      const totalCount = questionConfigs.reduce((sum, config) => sum + config.count, 0)
      
      // 构建题型要求
      const typeRequirements = questionConfigs.map(config => 
        `${this.getTypeLabel(config.type)} ${config.count}道`
      ).join('、')
      
      // 语言提示
      const languagePrompt = this.getLanguagePrompt(options.language || 'zh-CN')
      
      const prompt = `
基于上传的文件内容，为主题"${topic}"生成${totalCount}道题目。

题目要求：
${typeRequirements}

${languagePrompt}

请按照以下JSON格式生成题目：
{
  "questions": [
    {
      "type": "single|multiple|judge|fill|essay",
      "content": "题目内容",
      "options": ["选项A", "选项B", "选项C", "选项D"],
      "answer": "正确答案",
      "explanation": "详细解析",
      "difficulty": "${options.difficulty || 'medium'}"
    }
  ]
}

要求：
1. 严格按照JSON格式输出
2. 题目内容要清晰明确
3. 答案要准确，基于文件内容
4. 解析要详细，帮助学习者理解
5. 判断题答案只能是"正确"或"错误"
6. 填空题用___表示填空位置
7. 直接输出JSON体，不要输出其他多余的内容
`

      let jsonBuffer = ''
      
      await this.kimiAPI.chatStream({
        model: 'moonshot-v1-128k',
        messages: [
          {
            role: 'system',
            content: '你是 Kimi，由 Moonshot AI 提供的人工智能助手。请严格按照JSON格式返回结果，不要添加任何markdown标记。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3
      }, (chunk: string) => {
        jsonBuffer += chunk
        onChunk(jsonBuffer, false)
      })
      
      // 标记完成
      onChunk(jsonBuffer, true)
      
      // 解析最终结果
      return this.parseQuestionsFromJson(jsonBuffer)
    } catch (error) {
      console.error('流式生成题目失败:', error)
      throw error
    }
  }

  // 流式生成题目（基于文本输入）
  async generateQuestionsFromTextStream(
    content: string,
    topic: string,
    questionConfigs: Array<{ type: QuestionType; count: number }>,
    options: {
      language?: string
      difficulty?: QuestionDifficulty
    },
    onChunk: (chunk: string, isComplete: boolean) => void
  ): Promise<GeneratedQuestion[]> {
    try {
      // 计算总题目数
      const totalCount = questionConfigs.reduce((sum, config) => sum + config.count, 0)
      
      // 构建题型要求
      const typeRequirements = questionConfigs.map(config => 
        `${this.getTypeLabel(config.type)} ${config.count}道`
      ).join('、')
      
      // 语言提示
      const languagePrompt = this.getLanguagePrompt(options.language || 'zh-CN')
      
      const prompt = `
基于以下内容，为主题"${topic}"生成${totalCount}道题目。

内容：
${content.substring(0, 6000)} ${content.length > 6000 ? '...(内容过长，已截取前6000字符)' : ''}

题目要求：
${typeRequirements}

${languagePrompt}

请按照以下JSON格式生成题目：
{
  "questions": [
    {
      "type": "single|multiple|judge|fill|essay",
      "content": "题目内容",
      "options": ["选项A", "选项B", "选项C", "选项D"],
      "answer": "正确答案",
      "explanation": "详细解析",
      "difficulty": "${options.difficulty || 'medium'}"
    }
  ]
}

要求：
1. 严格按照JSON格式输出
2. 题目内容要清晰明确
3. 答案要准确，基于提供的内容
4. 解析要详细，帮助学习者理解
5. 判断题答案只能是"正确"或"错误"
6. 填空题用___表示填空位置
`

      let jsonBuffer = ''
      
      await this.kimiAPI.chatStream({
        model: 'moonshot-v1-128k',
        messages: [
          {
            role: 'system',
            content: '你是 Kimi，由 Moonshot AI 提供的人工智能助手。请严格按照JSON格式返回结果，不要添加任何markdown标记。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3
      }, (chunk: string) => {
        jsonBuffer += chunk
        onChunk(jsonBuffer, false)
      })
      
      // 标记完成
      onChunk(jsonBuffer, true)
      
      // 解析最终结果
      return this.parseQuestionsFromJson(jsonBuffer)
    } catch (error) {
      console.error('流式生成题目失败:', error)
      throw error
    }
  }

  // 获取题型标签
  private getTypeLabel(type: QuestionType): string {
    const labels = {
      single: '单选题',
      multiple: '多选题',
      judge: '判断题',
      fill: '填空题',
      essay: '简答题'
    }
    return labels[type] || type
  }

  // 获取语言提示
  private getLanguagePrompt(language: string): string {
    const prompts: Record<string, string> = {
      'zh-CN': '请使用简体中文生成题目内容、选项、答案和解析。',
      'zh-TW': '請使用繁體中文生成題目內容、選項、答案和解析。',
      'en': 'Please generate questions, options, answers, and explanations in English.'
    }
    return prompts[language] || prompts['zh-CN']
  }

  // 解析JSON结果
  private parseQuestionsFromJson(jsonStr: string): GeneratedQuestion[] {
    // 清理JSON字符串
    let cleanJson = jsonStr.trim()
    if (cleanJson.startsWith('```json')) {
      cleanJson = cleanJson.replace(/^```json\s*/, '').replace(/\s*```$/, '')
    } else if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.replace(/^```\s*/, '').replace(/\s*```$/, '')
    }
    
    const result: QuestionGenerationResult = JSON.parse(cleanJson)
    
    if (!result.questions || !Array.isArray(result.questions)) {
      throw new Error('AI返回的题目格式不正确')
    }
    
    return result.questions.filter(q => 
      q.type && q.content && q.answer && q.explanation && q.difficulty
    )
  }

  // 获取默认内容（当没有文件时使用）
  private getDefaultContent(chapterTitle: string): string {
    const contentMap: Record<string, string> = {
      'Vue.js 简介与安装': `
Vue.js 是一个用于构建用户界面的渐进式框架。Vue 被设计为可以自底向上逐层应用。Vue 的核心库只关注视图层，不仅易于上手，还便于与第三方库或既有项目整合。

Vue.js 的特点：
1. 渐进式框架：可以逐步采用，不需要重写整个项目
2. 响应式数据绑定：数据变化时自动更新视图
3. 组件化开发：可复用的组件提高开发效率
4. 虚拟DOM：提高渲染性能
5. 指令系统：简化DOM操作

安装方式：
- CDN引入
- NPM安装
- 脚手架工具Vue CLI
- Vite构建工具

Vue实例是Vue应用的根实例，通过new Vue()创建。每个Vue实例都有data、methods、computed等选项。
      `,
      '模板语法与指令': `
Vue.js 使用基于 HTML 的模板语法，允许开发者声明式地将 DOM 绑定至底层 Vue 实例的数据。

模板语法包括：
1. 插值：{{ }} 双大括号语法
2. 指令：v- 前缀的特殊属性
3. 表达式：在模板中可以使用JavaScript表达式

常用指令：
- v-if / v-else / v-show：条件渲染
- v-for：列表渲染
- v-model：双向数据绑定
- v-bind：属性绑定
- v-on：事件监听
- v-text / v-html：文本内容绑定

计算属性computed用于处理复杂逻辑，具有缓存特性。侦听器watch用于响应数据变化。
      `,
      '组件化开发': `
组件是Vue.js最强大的特性之一。组件可以扩展HTML元素，封装可重用的代码。

组件的特点：
1. 可复用性：一次定义，多处使用
2. 封装性：内部逻辑和样式独立
3. 可组合性：组件可以嵌套使用
4. 数据隔离：每个组件实例有独立的作用域

组件注册方式：
- 全局注册：Vue.component()
- 局部注册：在components选项中注册

组件通信：
- 父传子：props
- 子传父：$emit
- 兄弟组件：事件总线或Vuex
- 跨级组件：provide/inject

组件生命周期：
- created：实例创建后
- mounted：DOM挂载后
- updated：数据更新后
- destroyed：实例销毁前
      `,
      '高级类型系统': `
TypeScript的高级类型系统提供了强大的类型操作能力，让开发者能够创建更精确和灵活的类型定义。

高级类型包括：
1. 联合类型（Union Types）：使用 | 操作符
2. 交叉类型（Intersection Types）：使用 & 操作符
3. 字面量类型（Literal Types）：具体的字符串或数字值
4. 类型别名（Type Aliases）：使用type关键字
5. 接口（Interfaces）：定义对象结构
6. 泛型（Generics）：类型参数化

类型守卫和类型断言：
- typeof 类型守卫
- instanceof 类型守卫
- 用户定义的类型守卫
- 类型断言 as 语法

映射类型和条件类型：
- Partial<T>：所有属性变为可选
- Required<T>：所有属性变为必需
- Pick<T, K>：选择特定属性
- Omit<T, K>：排除特定属性
      `,
      '泛型编程': `
泛型是TypeScript中最重要的特性之一，它允许在定义函数、接口或类时不预先指定具体的类型，而在使用时再指定类型。

泛型的基本概念：
1. 类型参数：使用尖括号<>定义
2. 泛型约束：使用extends关键字
3. 默认类型参数：为泛型参数提供默认值
4. 泛型接口：接口也可以使用泛型
5. 泛型类：类也可以使用泛型

泛型函数示例：
function identity<T>(arg: T): T {
  return arg;
}

泛型接口示例：
interface GenericInterface<T> {
  value: T;
  getValue(): T;
}

泛型约束示例：
interface Lengthwise {
  length: number;
}

function loggingIdentity<T extends Lengthwise>(arg: T): T {
  console.log(arg.length);
  return arg;
}
      `,
      '装饰器与元编程': `
装饰器是TypeScript中一个强大的特性，它允许在类声明、方法、属性或参数上添加元数据。

装饰器的基本概念：
1. 装饰器工厂：返回装饰器函数的函数
2. 装饰器组合：多个装饰器可以组合使用
3. 装饰器执行顺序：从外到内，从下到上

装饰器类型：
- 类装饰器：应用于类构造函数
- 方法装饰器：应用于方法
- 属性装饰器：应用于属性
- 参数装饰器：应用于参数

元编程概念：
- 反射：在运行时检查和修改程序结构
- 元数据：描述其他数据的数据
- 注解：为代码添加元数据信息

实际应用：
- 依赖注入
- 路由配置
- 验证规则
- 日志记录
- 性能监控
      `
    }

    return contentMap[chapterTitle] || `
基于章节"${chapterTitle}"的内容生成题目。

这是一个示例课程章节，包含相关的知识点和概念。请根据章节主题生成相应的练习题，包括：

1. 基础概念理解
2. 重要知识点掌握
3. 实际应用能力
4. 问题解决能力

题目应该覆盖章节的核心内容，难度适中，能够有效检验学习效果。
    `
  }
}

export default QuestionGenerator
