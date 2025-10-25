// 文档解析服务

import { createKimiAPI } from '@/shared/api/kimi'
import type { CourseLevel } from '@/types/course'

interface DocumentAnalysis {
  summary: string
  keyPoints: string[]
  suggestedChapters: Array<{
    title: string
    description: string
    keyTopics: string[]
  }>
  difficulty: CourseLevel
  estimatedDuration: number
}

interface CourseOutline {
  courseTitle: string
  courseDescription: string
  difficulty?: CourseLevel
  chapters: Array<{
    title: string
    description: string
    content: string
    duration: string
    durationMinutes: number
    order: number
  }>
  learningObjectives: string[]
  prerequisites: string[]
}

export class DocumentParser {
  private kimiAPI = createKimiAPI()

  // 上传并解析文档
  async parseDocument(file: File): Promise<{
    fileId: string
    content: string
    analysis: DocumentAnalysis
  }> {
    try {
      // 1. 上传文件到Kimi
      const uploadResponse = await this.kimiAPI.uploadFile(file)
      
      // 2. 获取文件内容
      const content = await this.kimiAPI.getFileContent(uploadResponse.id)
      
      // 3. 分析文档内容
      const analysis = await this.analyzeDocument(content, file.name)
      
      return {
        fileId: uploadResponse.id,
        content,
        analysis
      }
    } catch (error) {
      console.error('文档解析失败:', error)
      throw new Error(`文档解析失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  // 分析文档内容
  private async analyzeDocument(content: string, filename: string): Promise<DocumentAnalysis> {
    const prompt = `
请分析以下文档内容，并提取关键信息：

文档名称：${filename}
文档内容：
${content.substring(0, 8000)} ${content.length > 8000 ? '...(内容过长，已截取前8000字符)' : ''}

请按照以下JSON格式返回分析结果：
{
  "summary": "文档摘要（100-200字）",
  "keyPoints": ["关键点1", "关键点2", "关键点3", "关键点4", "关键点5"],
  "suggestedChapters": [
    {
      "title": "章节标题",
      "description": "章节描述（50-100字）",
      "keyTopics": ["主题1", "主题2", "主题3"]
    }
  ],
  "difficulty": "beginner|intermediate|advanced",
  "estimatedDuration": 预计学习时长（分钟）
}

要求：
1. 根据文档内容确定合适的难度级别
2. 章节划分要合理，每章包含3-8个章节
3. 预计时长要符合实际学习需要
4. 关键点要突出文档的核心内容
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
      // 尝试解析JSON，如果失败则提取JSON部分
      let analysis: DocumentAnalysis
      try {
        analysis = JSON.parse(responseContent)
      } catch {
        // 如果直接解析失败，尝试提取JSON部分
        const jsonMatch = responseContent.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          analysis = JSON.parse(jsonMatch[0])
        } else {
          throw new Error('无法解析AI返回的分析结果')
        }
      }
      
      // 验证返回的数据结构
      if (!analysis.summary || !analysis.keyPoints || !analysis.suggestedChapters) {
        throw new Error('AI返回的分析结果格式不正确')
      }
      
      return analysis
    } catch (error) {
      console.error('解析AI分析结果失败:', error)
      console.error('AI返回内容:', responseContent)
      
      // 返回默认分析结果
      return {
        summary: '文档内容分析完成，但AI返回格式有误，请手动调整课程大纲。',
        keyPoints: ['文档内容需要进一步分析'],
        suggestedChapters: [
          {
            title: '第一章',
            description: '请根据文档内容调整章节内容',
            keyTopics: ['主题1', '主题2']
          }
        ],
        difficulty: 'intermediate' as CourseLevel,
        estimatedDuration: 60
      }
    }
  }

  // 流式生成课程大纲
  async generateCourseOutlineStream(
    _fileId: string, 
    courseTitle: string, 
    documentAnalysis: DocumentAnalysis,
    onChunk: (chunk: string) => void
  ): Promise<CourseOutline> {
    const prompt = `
基于以下文档分析结果，为课程"${courseTitle}"生成详细的课程大纲：

文档分析结果：
${JSON.stringify(documentAnalysis, null, 2)}

请按照以下JSON格式生成课程大纲：
{
  "courseTitle": "课程标题",
  "courseDescription": "课程描述（200-300字）",
  "chapters": [
    {
      "title": "章节标题",
      "description": "章节描述（100-150字）",
      "content": "章节详细内容（包含具体的知识点、例子和学习要点）",
      "duration": 预计学习时长（分钟）,
      "order": 章节顺序（从1开始）
    }
  ],
  "learningObjectives": ["学习目标1", "学习目标2", "学习目标3", "学习目标4"],
  "prerequisites": ["前置要求1", "前置要求2"]
}

要求：
1. 课程大纲要结构清晰，逻辑合理
2. 每个章节的内容要详细，包含具体的学习要点
3. 学习目标要明确，可衡量
4. 章节数量控制在5-10个之间
5. 总时长要合理，符合学习规律
`

    let fullResponse = ''
    
    await this.kimiAPI.chatStream({
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
      temperature: 0.4
    }, (chunk: string) => {
      fullResponse += chunk
      onChunk(chunk)
    })

    // 解析完整的JSON响应
    try {
      let outline: CourseOutline
      try {
        outline = JSON.parse(fullResponse)
      } catch {
        // 如果直接解析失败，尝试提取JSON部分
        const jsonMatch = fullResponse.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          outline = JSON.parse(jsonMatch[0])
        } else {
          throw new Error('无法解析AI返回的课程大纲')
        }
      }
      
      // 验证返回的数据结构
      if (!outline.courseTitle || !outline.chapters || !Array.isArray(outline.chapters)) {
        throw new Error('AI返回的课程大纲格式不正确')
      }
      
      return outline
    } catch (error) {
      console.error('解析AI课程大纲失败:', error)
      console.error('AI返回内容:', fullResponse)
      
      // 返回基于分析结果的默认大纲
      return {
        courseTitle: courseTitle || '智能课程',
        courseDescription: documentAnalysis.summary,
        chapters: documentAnalysis.suggestedChapters.map((chapter, index) => {
          const durationMinutes = Math.max(30, Math.round(documentAnalysis.estimatedDuration / documentAnalysis.suggestedChapters.length))
          return {
            title: chapter.title,
            description: chapter.description,
            content: `本章节将学习${chapter.keyTopics.join('、')}等内容。\n\n具体包括：\n${chapter.keyTopics.map(topic => `- ${topic}`).join('\n')}\n\n学习要点：\n- 理解核心概念\n- 掌握基本方法\n- 能够实际应用`,
            duration: `${durationMinutes}分钟`,
            durationMinutes: durationMinutes,
            order: index + 1
          }
        }),
        learningObjectives: [
          '掌握课程核心知识点',
          '能够理解并应用所学内容',
          '具备解决实际问题的能力'
        ],
        prerequisites: ['基本的学习能力和理解能力']
      }
    }
  }

  // 生成课程大纲
  async generateCourseOutline(_fileId: string, courseTitle: string, documentAnalysis: DocumentAnalysis): Promise<CourseOutline> {
    const prompt = `
基于以下文档分析结果，为课程"${courseTitle}"生成详细的课程大纲：

文档分析结果：
${JSON.stringify(documentAnalysis, null, 2)}

请按照以下JSON格式生成课程大纲：
{
  "courseTitle": "课程标题",
  "courseDescription": "课程描述（200-300字）",
  "chapters": [
    {
      "title": "章节标题",
      "description": "章节描述（100-150字）",
      "content": "章节详细内容（包含具体的知识点、例子和学习要点）",
      "duration": 预计学习时长（分钟）,
      "order": 章节顺序（从1开始）
    }
  ],
  "learningObjectives": ["学习目标1", "学习目标2", "学习目标3", "学习目标4"],
  "prerequisites": ["前置要求1", "前置要求2"]
}

要求：
1. 课程大纲要结构清晰，逻辑合理
2. 每个章节的内容要详细，包含具体的学习要点
3. 学习目标要明确，可衡量
4. 章节数量控制在5-10个之间
5. 总时长要合理，符合学习规律
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
      temperature: 0.4
    })

    const responseContent = response.choices[0].message.content
    
    try {
      // 尝试解析JSON
      let outline: CourseOutline
      try {
        outline = JSON.parse(responseContent)
      } catch {
        // 如果直接解析失败，尝试提取JSON部分
        const jsonMatch = responseContent.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          outline = JSON.parse(jsonMatch[0])
        } else {
          throw new Error('无法解析AI返回的课程大纲')
        }
      }
      
      // 验证返回的数据结构
      if (!outline.courseTitle || !outline.chapters || !Array.isArray(outline.chapters)) {
        throw new Error('AI返回的课程大纲格式不正确')
      }
      
      return outline
    } catch (error) {
      console.error('解析AI课程大纲失败:', error)
      console.error('AI返回内容:', responseContent)
      
      // 返回基于分析结果的默认大纲
      return {
        courseTitle: courseTitle || '智能课程',
        courseDescription: documentAnalysis.summary,
        chapters: documentAnalysis.suggestedChapters.map((chapter, index) => {
          const durationMinutes = Math.max(30, Math.round(documentAnalysis.estimatedDuration / documentAnalysis.suggestedChapters.length))
          return {
            title: chapter.title,
            description: chapter.description,
            content: `本章节将学习${chapter.keyTopics.join('、')}等内容。\n\n具体包括：\n${chapter.keyTopics.map(topic => `- ${topic}`).join('\n')}\n\n学习要点：\n- 理解核心概念\n- 掌握基本方法\n- 能够实际应用`,
            duration: `${durationMinutes}分钟`,
            durationMinutes: durationMinutes,
            order: index + 1
          }
        }),
        learningObjectives: [
          '掌握课程核心知识点',
          '能够理解并应用所学内容',
          '具备解决实际问题的能力'
        ],
        prerequisites: ['基本的学习能力和理解能力']
      }
    }
  }

  // 流式生成课程JSON内容
  async generateCourseJsonStream(
    file: File,
    onJsonUpdate: (jsonStr: string, isComplete: boolean) => void
  ): Promise<CourseOutline> {
    try {
      // 1. 上传文件到Kimi
      const uploadResponse = await this.kimiAPI.uploadFile(file)
      
      // 2. 获取文件内容
      const content = await this.kimiAPI.getFileContent(uploadResponse.id)
      
      // 3. 分析文档内容（暂时不使用，直接生成JSON）
      // const analysis = await this.analyzeDocument(content, file.name)
      
      // 4. 生成课程JSON
      const jsonPrompt = `
请基于以下文档内容，生成课程信息的JSON格式。请严格按照以下JSON格式输出，不要添加任何其他内容，不要修改格式，直接输出：

{
  "courseTitle": "课程标题",
  "courseDescription": "课程描述（200-300字）",
  "difficulty": "初级/中级/高级",
  "learningObjectives": [
    "学习目标1",
    "学习目标2", 
    "学习目标3",
    "学习目标4",
    "学习目标5"
  ],
  "chapters": [
    {
      "order": 1,
      "title": "章节标题",
      "description": "章节描述（100-150字）",
      "duration": "30分钟",
      "durationMinutes": 30,
      "content": "章节详细内容"
    }
  ]
}

要求：
1. 根据文档内容确定合适的难度级别
2. 章节划分要合理，每章包含3-8个章节
3. 预计时长要符合实际学习需要
4. 关键点要突出文档的核心内容
5. 学习目标要明确，可衡量
6. 章节数量控制在5-10个之间
7. 总时长要合理，符合学习规律

文档内容：
${content}
`

      let jsonBuffer = ''
      
      await this.kimiAPI.chatStream({
        model: 'moonshot-v1-128k',
        messages: [
          {
            role: 'user',
            content: jsonPrompt
          }
        ]
      }, (chunk: string) => {
        jsonBuffer += chunk
        onJsonUpdate(jsonBuffer, false)
      })
      
      onJsonUpdate(jsonBuffer, true)
      
      // 解析JSON为CourseOutline
      return this.parseJsonToOutline(jsonBuffer)
    } catch (error) {
      console.error('流式生成课程JSON失败:', error)
      throw error
    }
  }

  // 解析JSON为CourseOutline
  private parseJsonToOutline(jsonStr: string): CourseOutline {
    try {
      // 清理JSON字符串，移除可能的markdown代码块标记
      let cleanJson = jsonStr.trim()
      if (cleanJson.startsWith('```json')) {
        cleanJson = cleanJson.replace(/^```json\s*/, '').replace(/\s*```$/, '')
      } else if (cleanJson.startsWith('```')) {
        cleanJson = cleanJson.replace(/^```\s*/, '').replace(/\s*```$/, '')
      }
      
      const courseData = JSON.parse(cleanJson)
      
      return {
        courseTitle: courseData.courseTitle || '未命名课程',
        courseDescription: courseData.courseDescription || '课程描述',
        difficulty: courseData.difficulty || '中级',
        chapters: courseData.chapters || [],
        learningObjectives: courseData.learningObjectives || [],
        prerequisites: courseData.prerequisites || []
      }
    } catch (error) {
      console.error('解析JSON失败:', error)
      console.error('JSON内容:', jsonStr)
      
      // 返回默认大纲
      return {
        courseTitle: '解析失败',
        courseDescription: 'JSON解析失败，请检查格式',
        difficulty: '中级' as CourseLevel,
        chapters: [],
        learningObjectives: [],
        prerequisites: []
      }
    }
  }

  // 流式生成课程Markdown内容
  async generateCourseWithMarkdownStream(
    fileId: string,
    onMarkdownUpdate: (markdown: string, isComplete: boolean) => void
  ): Promise<CourseOutline> {
    try {
      const content = await this.kimiAPI.getFileContent(fileId)
      
      const prompt = `
请基于以下文档内容，生成课程信息的Markdown格式。请严格按照以下格式输出，不要添加任何其他内容，不要修改格式，直接输出：

# 课程标题
[在这里生成课程标题]

## 课程描述
[在这里生成课程描述，200-300字]

## 难度级别
[初级/中级/高级]

## 学习目标
- [第一个学习目标]
- [第二个学习目标]
- [第三个学习目标]
- [第四个学习目标]
- [第五个学习目标]

## 课程章节

### 第1章：[章节标题]
**描述：** [章节描述，100-150字]
**时长：** [预计时长]分钟

### 第2章：[章节标题]
**描述：** [章节描述，100-150字]
**时长：** [预计时长]分钟

### 第3章：[章节标题]
**描述：** [章节描述，100-150字]
**时长：** [预计时长]分钟

### 第4章：[章节标题]
**描述：** [章节描述，100-150字]
**时长：** [预计时长]分钟

更多章节...

文档内容：
${content.substring(0, 50000)} ${content.length > 50000 ? '...(内容过长，已截取前50000字符)' : ''}
`

      let markdownBuffer = ''

      await this.kimiAPI.chatStream({
        model: 'moonshot-v1-128k',
        messages: [
          {
            role: 'system',
            content: '你是 Kimi，由 Moonshot AI 提供的人工智能助手。请严格按照用户要求的Markdown格式输出课程信息。必须完全按照提供的模板格式输出，不要添加任何额外的内容、说明或解释。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3
      }, (chunk: string) => {
        markdownBuffer += chunk
        onMarkdownUpdate(markdownBuffer, false)
      })

      // 标记完成
      onMarkdownUpdate(markdownBuffer, true)

      // 解析最终Markdown内容
      return this.parseMarkdownToOutline(markdownBuffer)
    } catch (error) {
      console.error('流式生成课程Markdown失败:', error)
      throw error
    }
  }

  // 解析Markdown为课程大纲
  private parseMarkdownToOutline(markdown: string): CourseOutline {
    // 解析课程标题 - 从 "# 课程标题" 到 "## 课程描述" 之间的内容
    const titleMatch = markdown.match(/#\s*课程标题\s*\n(.+?)(?=\n##\s*课程描述)/s)
    const courseTitle = titleMatch ? titleMatch[1].trim() : '未命名课程'

    // 解析课程描述 - 从 "## 课程描述" 到 "## 难度级别" 之间的内容
    const descMatch = markdown.match(/##\s*课程描述\s*\n(.+?)(?=\n##\s*难度级别)/s)
    const courseDescription = descMatch ? descMatch[1].trim() : '课程描述'

    // 解析难度级别 - 从 "## 难度级别" 到 "## 学习目标" 之间的内容
    const levelMatch = markdown.match(/##\s*难度级别\s*\n(.+?)(?=\n##\s*学习目标)/s)
    const difficulty = levelMatch ? levelMatch[1].trim() : '中级'

    // 解析学习目标 - 从 "## 学习目标" 到下一个 "##" 或文档结尾之间的内容
    const objectivesMatch = markdown.match(/##\s*学习目标\s*\n(.+?)(?=\n##|$)/s)
    const objectives = objectivesMatch 
      ? objectivesMatch[1].split('\n')
          .filter(line => line.trim().startsWith('- '))
          .map(line => line.replace(/^-\s*/, '').trim())
          .filter(obj => obj)
      : []

    // 解析章节
    const chapters = []
    // 更灵活的正则：支持多种章节格式，包括方括号和普通格式，处理可能的空行和格式变化
    const chapterRegex = /###\s*第(\d+)章：\s*\[?([^\n\]]+?)\]?\s*[\r\n\s]*\*\*描述：\*\*\s*([^\n\r]+?)\s*[\r\n\s]*\*\*时长：\*\*\s*([^\n\r]+?)(?=[\r\n]|$)/gs
    
    console.log('开始解析章节，Markdown内容:', markdown.substring(0, 500) + '...')
    console.log('章节正则表达式:', chapterRegex)
    
    let match
    while ((match = chapterRegex.exec(markdown)) !== null) {
      console.log('匹配到章节:', match)
      const durationText = match[4].trim()
      const durationMatch = durationText.match(/(\d+)/)
      
      chapters.push({
        order: parseInt(match[1]),
        title: match[2].trim(),
        description: match[3].trim(),
        duration: durationText,               // 完整时长文本（如"30分钟"）
        durationMinutes: durationMatch ? parseInt(durationMatch[1]) : 0,  // 数字时长（如30）
        content: ''
      })
    }
    
    // 如果没有匹配到章节，尝试备用解析方法
    if (chapters.length === 0) {
      console.log('主正则表达式未匹配到章节，尝试备用方法...')
      const fallbackRegex = /###\s*第(\d+)章[：:]\s*(.+?)\s*\n.*?\*\*描述[：:]\*\*\s*(.+?)\s*\n.*?\*\*时长[：:]\*\*\s*(.+?)(?=\n|$)/gs
      let fallbackMatch
      while ((fallbackMatch = fallbackRegex.exec(markdown)) !== null) {
        console.log('备用方法匹配到章节:', fallbackMatch)
        const durationText = fallbackMatch[4].trim()
        const durationMatch = durationText.match(/(\d+)/)
        
        chapters.push({
          order: parseInt(fallbackMatch[1]),
          title: fallbackMatch[2].trim(),
          description: fallbackMatch[3].trim(),
          duration: durationText,
          durationMinutes: durationMatch ? parseInt(durationMatch[1]) : 0,
          content: ''
        })
      }
    }
    
    console.log('最终解析到的章节数量:', chapters.length)

    return {
      courseTitle,
      courseDescription,
      difficulty: difficulty as CourseLevel,
      chapters,
      learningObjectives: objectives,
      prerequisites: []
    }
  }

  // 解析最终大纲（保留旧方法以兼容）
  private parseFinalOutline(buffer: string): CourseOutline {
    const titleMatch = buffer.match(/【课程标题】\s*\n(.*?)(?=\n【|$)/s)
    const descMatch = buffer.match(/【课程描述】\s*\n(.*?)(?=\n【|$)/s)
    const levelMatch = buffer.match(/【难度级别】\s*\n(.*?)(?=\n【|$)/s)
    const objectivesMatch = buffer.match(/【学习目标】\s*\n(.*?)(?=\n【|$)/s)
    
    const courseTitle = titleMatch ? titleMatch[1].trim() : '未命名课程'
    const courseDescription = descMatch ? descMatch[1].trim() : '课程描述'
    const difficulty = levelMatch ? levelMatch[1].trim() : '中级'
    
    const objectives = objectivesMatch 
      ? objectivesMatch[1].split('\n')
          .filter(line => line.trim().match(/^\d+\./))
          .map(line => line.replace(/^\d+\.\s*/, '').trim())
          .filter(obj => obj)
      : []
    
    // 解析章节
    const chapters = []
    const chapterRegex = /第(\d+)章：([^\n]+)\n([^\n]+)\n\[预计时长：(\d+)分钟\]/g
    let match
    while ((match = chapterRegex.exec(buffer)) !== null) {
      chapters.push({
        order: parseInt(match[1]),
        title: match[2].trim(),
        description: match[3].trim(),
        duration: `${match[4]}分钟`,
        durationMinutes: parseInt(match[4]),
        content: ''
      })
    }

    return {
      courseTitle,
      courseDescription,
      difficulty: difficulty as CourseLevel,
      chapters,
      learningObjectives: objectives,
      prerequisites: []
    }
  }

  // 获取文档摘要
  async getDocumentSummary(fileId: string): Promise<string> {
    try {
      const content = await this.kimiAPI.getFileContent(fileId)
      
      const prompt = `
请为以下文档内容生成一个简洁的摘要（100-200字）：

${content.substring(0, 4000)} ${content.length > 4000 ? '...(内容过长，已截取前4000字符)' : ''}

要求：
1. 摘要要准确概括文档的主要内容
2. 语言要简洁明了
3. 突出文档的核心价值和要点
`

      const response = await this.kimiAPI.chat({
        model: 'moonshot-v1-128k',
        messages: [
          {
            role: 'system',
            content: '你是 Kimi，由 Moonshot AI 提供的人工智能助手，你更擅长中文和英文的对话。你会为用户提供安全，有帮助，准确的回答。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3
      })

      return response.choices[0].message.content
    } catch (error) {
      console.error('获取文档摘要失败:', error)
      return '无法生成文档摘要，请查看文档内容。'
    }
  }

  // 为单个章节生成更详细的AI内容
  async enrichChapterContent(
    courseTitle: string,
    chapterTitle: string,
    chapterDescription: string,
    fileId?: string
  ): Promise<string> {
    try {
      const prompt = `请为课程"${courseTitle}"的章节"${chapterTitle}"生成详细的学习内容。

章节描述：${chapterDescription}

请生成包含以下要素的详细学习内容：
1. 章节概述和学习目标
2. 核心知识点和概念解释
3. 详细的讲解内容（包含实例和案例）
4. 重点难点分析
5. 学习要点总结
6. 思考题或练习题

要求：
- 内容要详细、易懂、有层次
- 使用Markdown格式
- 内容长度控制在2000-5000字
- 适合在线学习阅读
- 语言要专业但通俗易懂

${fileId ? `\n\n参考文档ID: ${fileId}` : ''}`

      const response = await this.kimiAPI.chat({
        messages: [{ role: 'user', content: prompt }],
        model: 'moonshot-v1-128k',
        temperature: 0.7
      })

      return response.choices[0].message.content || ''
    } catch (error) {
      console.error('生成章节详细内容失败:', error)
      throw new Error(`生成章节详细内容失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  // 从原始文档中提取章节内容（基于章节标题切分）
  extractChapterContentFromDocument(
    documentContent: string,
    chapterTitle: string
  ): string {
    try {
      // 尝试多种匹配模式来找到章节内容
      const patterns = [
        // 匹配 "## 章节标题" 或 "### 章节标题" 格式
        new RegExp(`(?:^|\n)(?:#{2,3}\\s*${this.escapeRegExp(chapterTitle)}.*?)(?=\n(?:#{1,3}\\s|$))`, 'gs'),
        // 匹配 "第X章 章节标题" 格式
        new RegExp(`(?:^|\n)(?:第\\d+章\\s*${this.escapeRegExp(chapterTitle)}.*?)(?=\n(?:第\\d+章|#{1,3}\\s|$))`, 'gs'),
        // 匹配 "X. 章节标题" 格式
        new RegExp(`(?:^|\n)(?:\\d+\\.\\s*${this.escapeRegExp(chapterTitle)}.*?)(?=\n(?:\\d+\\.|#{1,3}\\s|$))`, 'gs')
      ]

      for (const pattern of patterns) {
        const match = documentContent.match(pattern)
        if (match && match[0]) {
          let content = match[0].trim()
          
          // 清理内容，移除标题行
          content = content.replace(new RegExp(`^#{1,3}\\s*${this.escapeRegExp(chapterTitle)}.*$`, 'm'), '')
          content = content.replace(new RegExp(`^第\\d+章\\s*${this.escapeRegExp(chapterTitle)}.*$`, 'm'), '')
          content = content.replace(new RegExp(`^\\d+\\.\\s*${this.escapeRegExp(chapterTitle)}.*$`, 'm'), '')
          
          return content.trim()
        }
      }

      // 如果没有找到匹配的章节，返回空字符串
      return ''
    } catch (error) {
      console.error('提取章节内容失败:', error)
      return ''
    }
  }

  // 转义正则表达式特殊字符
  private escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }
}

export default DocumentParser
