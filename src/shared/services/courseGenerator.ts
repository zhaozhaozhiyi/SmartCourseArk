// 课程生成服务

import { createKimiAPI } from '@/shared/api/kimi'

interface CourseOutline {
  courseTitle: string
  courseDescription: string
  chapters: Array<{
    title: string
    description: string
    content: string
    duration: number
    order: number
  }>
  learningObjectives: string[]
  prerequisites: string[]
}

export class CourseGenerator {
  private kimiAPI = createKimiAPI()

  // 基于文件ID生成课程大纲
  async generateCourseOutline(fileId: string, courseTitle: string): Promise<CourseOutline> {
    try {
      // 获取文件内容
      const fileContent = await this.kimiAPI.getFileContent(fileId)
      
      const prompt = `
基于上传的文档内容，为课程"${courseTitle}"生成详细的课程大纲。

文档内容：
${fileContent.substring(0, 8000)} ${fileContent.length > 8000 ? '...(内容过长，已截取前8000字符)' : ''}

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
6. 内容要基于文档实际内容，不能虚构
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
        
        // 返回默认大纲
        return {
          courseTitle: courseTitle || '智能课程',
          courseDescription: '基于上传文档生成的智能课程，内容涵盖文档中的核心知识点。',
          chapters: [
            {
              title: '第一章：概述',
              description: '介绍课程的基本概念和主要内容',
              content: '本章节将介绍课程的基本概念、学习目标和主要内容安排。\n\n学习要点：\n- 理解课程背景\n- 明确学习目标\n- 掌握课程结构',
              duration: 30,
              order: 1
            }
          ],
          learningObjectives: [
            '掌握课程核心知识点',
            '能够理解并应用所学内容'
          ],
          prerequisites: ['基本的学习能力和理解能力']
        }
      }
    } catch (error) {
      console.error('生成课程大纲失败:', error)
      throw new Error(`生成课程大纲失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  // 流式生成章节内容
  async generateChapterContentStream(
    fileId: string,
    chapterTitle: string, 
    chapterDescription: string,
    onChunk: (chunk: string) => void
  ): Promise<void> {
    try {
      // 获取文件内容
      const fileContent = await this.kimiAPI.getFileContent(fileId)
      
      const prompt = `
请为以下章节生成详细的学习内容：

章节标题：${chapterTitle}
章节描述：${chapterDescription}

相关文档内容：
${fileContent.substring(0, 6000)} ${fileContent.length > 6000 ? '...(内容过长，已截取前6000字符)' : ''}

要求：
1. 内容要详细、易懂，适合在线学习
2. 包含具体的知识点和例子
3. 使用Markdown格式
4. 内容要基于文档实际内容，不能虚构
5. 结构要清晰，包含标题、要点、例子等
6. 语言要专业但易懂
`

      await this.kimiAPI.chatStream({
        model: 'moonshot-v1-128k',
        messages: [
          {
            role: 'system',
            content: '你是 Kimi，由 Moonshot AI 提供的人工智能助手，你更擅长中文和英文的对话。你会为用户提供安全，有帮助，准确的回答。请使用Markdown格式输出内容。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.5
      }, onChunk)
    } catch (error) {
      console.error('流式生成章节内容失败:', error)
      throw new Error(`生成章节内容失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  // 生成章节内容（非流式）
  async generateChapterContent(
    fileId: string,
    chapterTitle: string, 
    chapterDescription: string
  ): Promise<string> {
    try {
      // 获取文件内容
      const fileContent = await this.kimiAPI.getFileContent(fileId)
      
      const prompt = `
请为以下章节生成详细的学习内容：

章节标题：${chapterTitle}
章节描述：${chapterDescription}

相关文档内容：
${fileContent.substring(0, 6000)} ${fileContent.length > 6000 ? '...(内容过长，已截取前6000字符)' : ''}

要求：
1. 内容要详细、易懂，适合在线学习
2. 包含具体的知识点和例子
3. 使用Markdown格式
4. 内容要基于文档实际内容，不能虚构
5. 结构要清晰，包含标题、要点、例子等
6. 语言要专业但易懂
7. 内容长度控制在1000-2000字之间
`

      const response = await this.kimiAPI.chat({
        model: 'moonshot-v1-128k',
        messages: [
          {
            role: 'system',
            content: '你是 Kimi，由 Moonshot AI 提供的人工智能助手，你更擅长中文和英文的对话。你会为用户提供安全，有帮助，准确的回答。请使用Markdown格式输出内容。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.5
      })

      return response.choices[0].message.content
    } catch (error) {
      console.error('生成章节内容失败:', error)
      throw new Error(`生成章节内容失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  // 优化课程大纲
  async optimizeCourseOutline(
    fileId: string,
    currentOutline: CourseOutline,
    feedback?: string
  ): Promise<CourseOutline> {
    try {
      // 获取文件内容
      const fileContent = await this.kimiAPI.getFileContent(fileId)
      
      const prompt = `
基于以下文档内容和当前课程大纲，请优化课程大纲：

文档内容：
${fileContent.substring(0, 4000)} ${fileContent.length > 4000 ? '...(内容过长，已截取前4000字符)' : ''}

当前课程大纲：
${JSON.stringify(currentOutline, null, 2)}

${feedback ? `用户反馈：${feedback}` : ''}

请按照以下JSON格式返回优化后的课程大纲：
{
  "courseTitle": "课程标题",
  "courseDescription": "课程描述",
  "chapters": [
    {
      "title": "章节标题",
      "description": "章节描述",
      "content": "章节详细内容",
      "duration": 预计学习时长（分钟）,
      "order": 章节顺序
    }
  ],
  "learningObjectives": ["学习目标1", "学习目标2"],
  "prerequisites": ["前置要求1", "前置要求2"]
}

优化要求：
1. 保持原有的章节结构，但可以调整内容
2. 根据用户反馈进行相应调整
3. 确保内容与文档高度相关
4. 保持学习目标的明确性
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
            throw new Error('无法解析AI返回的优化课程大纲')
          }
        }
        
        return outline
      } catch (error) {
        console.error('解析AI优化课程大纲失败:', error)
        console.error('AI返回内容:', responseContent)
        
        // 返回原始大纲
        return currentOutline
      }
    } catch (error) {
      console.error('优化课程大纲失败:', error)
      throw new Error(`优化课程大纲失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  // 生成课程摘要
  async generateCourseSummary(fileId: string): Promise<string> {
    try {
      // 获取文件内容
      const fileContent = await this.kimiAPI.getFileContent(fileId)
      
      const prompt = `
请为以下文档内容生成一个简洁的课程摘要（150-250字）：

${fileContent.substring(0, 4000)} ${fileContent.length > 4000 ? '...(内容过长，已截取前4000字符)' : ''}

要求：
1. 摘要要准确概括文档的主要内容
2. 语言要简洁明了，适合作为课程描述
3. 突出文档的核心价值和要点
4. 适合学习者了解课程内容
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
      console.error('生成课程摘要失败:', error)
      return '无法生成课程摘要，请查看文档内容。'
    }
  }
}

export default CourseGenerator
