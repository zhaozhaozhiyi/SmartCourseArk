// 内容增强服务

import { createKimiAPI } from '@/shared/api/kimi'

interface ContentEnhancementOptions {
  style?: 'academic' | 'casual' | 'professional'
  length?: 'short' | 'medium' | 'long'
  includeExamples?: boolean
  includeSummary?: boolean
}

export class ContentEnhancer {
  private kimiAPI = createKimiAPI()

  // 增强章节内容
  async enhanceChapterContent(
    fileId: string,
    chapterTitle: string,
    originalContent: string,
    options: ContentEnhancementOptions = {}
  ): Promise<string> {
    try {
      // 获取文件内容
      const fileContent = await this.kimiAPI.getFileContent(fileId)
      
      const styleDesc = this.getStyleDescription(options.style)
      const lengthDesc = this.getLengthDescription(options.length)
      
      const prompt = `
基于以下文档内容，请增强章节"${chapterTitle}"的内容：

文档内容：
${fileContent.substring(0, 6000)} ${fileContent.length > 6000 ? '...(内容过长，已截取前6000字符)' : ''}

原始章节内容：
${originalContent}

请按照以下要求增强内容：
1. 保持原有内容的准确性
2. 使用${styleDesc}的语言风格
3. 内容长度要${lengthDesc}
4. ${options.includeExamples ? '包含具体的例子和案例' : '可以适当添加例子'}
5. ${options.includeSummary ? '在结尾添加章节总结' : '不需要添加总结'}
6. 使用Markdown格式
7. 结构要清晰，包含标题、要点、例子等
8. 语言要专业但易懂
9. 内容要基于文档实际内容，不能虚构
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
        temperature: 0.4
      })

      return response.choices[0].message.content
    } catch (error) {
      console.error('增强章节内容失败:', error)
      throw new Error(`增强章节内容失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  // 生成学习要点
  async generateLearningPoints(
    fileId: string,
    chapterTitle: string,
    content: string
  ): Promise<string[]> {
    try {
      // 获取文件内容
      const fileContent = await this.kimiAPI.getFileContent(fileId)
      
      const prompt = `
基于以下文档内容和章节内容，请为章节"${chapterTitle}"生成学习要点：

文档内容：
${fileContent.substring(0, 4000)} ${fileContent.length > 4000 ? '...(内容过长，已截取前4000字符)' : ''}

章节内容：
${content}

请按照以下JSON格式返回学习要点：
{
  "learningPoints": [
    "学习要点1",
    "学习要点2",
    "学习要点3",
    "学习要点4",
    "学习要点5"
  ]
}

要求：
1. 学习要点要简洁明了
2. 每个要点不超过20个字
3. 要点要突出章节的核心内容
4. 要点要基于文档实际内容
5. 要点数量控制在5-8个之间
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
        let result: { learningPoints: string[] }
        try {
          result = JSON.parse(responseContent)
        } catch {
          // 如果直接解析失败，尝试提取JSON部分
          const jsonMatch = responseContent.match(/\{[\s\S]*\}/)
          if (jsonMatch) {
            result = JSON.parse(jsonMatch[0])
          } else {
            throw new Error('无法解析AI返回的学习要点')
          }
        }
        
        // 验证返回的数据结构
        if (!result.learningPoints || !Array.isArray(result.learningPoints)) {
          throw new Error('AI返回的学习要点格式不正确')
        }
        
        return result.learningPoints
      } catch (error) {
        console.error('解析AI学习要点失败:', error)
        console.error('AI返回内容:', responseContent)
        
        // 返回默认学习要点
        return [
          '掌握章节核心概念',
          '理解关键知识点',
          '能够实际应用',
          '完成相关练习'
        ]
      }
    } catch (error) {
      console.error('生成学习要点失败:', error)
      throw new Error(`生成学习要点失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  // 生成章节总结
  async generateChapterSummary(
    fileId: string,
    chapterTitle: string,
    content: string
  ): Promise<string> {
    try {
      // 获取文件内容
      const fileContent = await this.kimiAPI.getFileContent(fileId)
      
      const prompt = `
基于以下文档内容和章节内容，请为章节"${chapterTitle}"生成一个简洁的总结：

文档内容：
${fileContent.substring(0, 4000)} ${fileContent.length > 4000 ? '...(内容过长，已截取前4000字符)' : ''}

章节内容：
${content}

要求：
1. 总结要简洁明了，控制在100-200字
2. 要突出章节的核心内容
3. 要基于文档实际内容
4. 语言要专业但易懂
5. 要包含章节的主要学习成果
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
      console.error('生成章节总结失败:', error)
      throw new Error(`生成章节总结失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  // 生成相关案例
  async generateRelatedCases(
    fileId: string,
    chapterTitle: string,
    content: string,
    count: number = 3
  ): Promise<string[]> {
    try {
      // 获取文件内容
      const fileContent = await this.kimiAPI.getFileContent(fileId)
      
      const prompt = `
基于以下文档内容和章节内容，请为章节"${chapterTitle}"生成${count}个相关案例：

文档内容：
${fileContent.substring(0, 4000)} ${fileContent.length > 4000 ? '...(内容过长，已截取前4000字符)' : ''}

章节内容：
${content}

请按照以下JSON格式返回相关案例：
{
  "cases": [
    "案例1描述",
    "案例2描述",
    "案例3描述"
  ]
}

要求：
1. 案例要贴近章节内容
2. 每个案例控制在50-100字
3. 案例要具体，有实际意义
4. 案例要基于文档实际内容
5. 案例要能帮助学习者理解章节内容
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
        let result: { cases: string[] }
        try {
          result = JSON.parse(responseContent)
        } catch {
          // 如果直接解析失败，尝试提取JSON部分
          const jsonMatch = responseContent.match(/\{[\s\S]*\}/)
          if (jsonMatch) {
            result = JSON.parse(jsonMatch[0])
          } else {
            throw new Error('无法解析AI返回的相关案例')
          }
        }
        
        // 验证返回的数据结构
        if (!result.cases || !Array.isArray(result.cases)) {
          throw new Error('AI返回的相关案例格式不正确')
        }
        
        return result.cases
      } catch (error) {
        console.error('解析AI相关案例失败:', error)
        console.error('AI返回内容:', responseContent)
        
        // 返回默认案例
        return [
          '相关案例1：请参考文档内容了解具体应用场景',
          '相关案例2：请参考文档内容了解实际应用方法',
          '相关案例3：请参考文档内容了解最佳实践'
        ]
      }
    } catch (error) {
      console.error('生成相关案例失败:', error)
      throw new Error(`生成相关案例失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  // 生成学习建议
  async generateLearningSuggestions(
    fileId: string,
    chapterTitle: string,
    content: string
  ): Promise<string[]> {
    try {
      // 获取文件内容
      const fileContent = await this.kimiAPI.getFileContent(fileId)
      
      const prompt = `
基于以下文档内容和章节内容，请为章节"${chapterTitle}"生成学习建议：

文档内容：
${fileContent.substring(0, 4000)} ${fileContent.length > 4000 ? '...(内容过长，已截取前4000字符)' : ''}

章节内容：
${content}

请按照以下JSON格式返回学习建议：
{
  "suggestions": [
    "学习建议1",
    "学习建议2",
    "学习建议3",
    "学习建议4"
  ]
}

要求：
1. 学习建议要实用具体
2. 每个建议控制在30-50字
3. 建议要基于章节内容特点
4. 建议要能帮助学习者更好地学习
5. 建议要基于文档实际内容
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
        let result: { suggestions: string[] }
        try {
          result = JSON.parse(responseContent)
        } catch {
          // 如果直接解析失败，尝试提取JSON部分
          const jsonMatch = responseContent.match(/\{[\s\S]*\}/)
          if (jsonMatch) {
            result = JSON.parse(jsonMatch[0])
          } else {
            throw new Error('无法解析AI返回的学习建议')
          }
        }
        
        // 验证返回的数据结构
        if (!result.suggestions || !Array.isArray(result.suggestions)) {
          throw new Error('AI返回的学习建议格式不正确')
        }
        
        return result.suggestions
      } catch (error) {
        console.error('解析AI学习建议失败:', error)
        console.error('AI返回内容:', responseContent)
        
        // 返回默认学习建议
        return [
          '认真阅读章节内容，理解核心概念',
          '结合实际案例，加深理解',
          '完成相关练习，巩固知识',
          '做好笔记，总结重点内容'
        ]
      }
    } catch (error) {
      console.error('生成学习建议失败:', error)
      throw new Error(`生成学习建议失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  // 获取样式描述
  private getStyleDescription(style?: string): string {
    switch (style) {
      case 'academic':
        return '学术严谨'
      case 'casual':
        return '轻松易懂'
      case 'professional':
        return '专业规范'
      default:
        return '专业易懂'
    }
  }

  // 获取长度描述
  private getLengthDescription(length?: string): string {
    switch (length) {
      case 'short':
        return '简洁明了'
      case 'long':
        return '详细全面'
      default:
        return '适中详细'
    }
  }
}

export default ContentEnhancer
