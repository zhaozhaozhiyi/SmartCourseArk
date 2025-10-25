// Markdown流式解析器
import { marked } from 'marked'

export interface MarkdownParseResult {
  courseTitle: string
  courseDescription: string
  difficulty: string
  objectives: string[]
  chapters: Array<{
    order: number
    title: string
    description: string
    duration: number
  }>
}

export class MarkdownStreamParser {
  private markdownBuffer = ''
  private lastParsedLength = 0

  constructor(
    private onUpdate: (result: Partial<MarkdownParseResult>) => void
  ) {
    // 配置marked选项
    marked.setOptions({
      gfm: true,
      breaks: true,
      pedantic: false,
      sanitize: false,
      smartLists: true,
      smartypants: false
    })
  }

  // 添加新的Markdown内容
  addChunk(chunk: string): void {
    this.markdownBuffer += chunk
    this.parseIncremental()
  }

  // 设置完整的Markdown内容
  setMarkdown(markdown: string): void {
    this.markdownBuffer = markdown
    this.parseIncremental()
  }

  // 标记完成
  markComplete(): MarkdownParseResult {
    const result = this.parseFullMarkdown(this.markdownBuffer)
    this.onUpdate(result)
    return result
  }

  // 增量解析
  private parseIncremental(): void {
    const newContent = this.markdownBuffer.slice(this.lastParsedLength)
    if (newContent.length === 0) return

    // 尝试解析新增的内容
    const partialResult = this.parsePartialMarkdown(newContent)
    if (partialResult) {
      this.onUpdate(partialResult)
    }

    this.lastParsedLength = this.markdownBuffer.length
  }

  // 解析部分Markdown内容
  private parsePartialMarkdown(content: string): Partial<MarkdownParseResult> | null {
    const result: Partial<MarkdownParseResult> = {}

    // 解析课程标题
    const titleMatch = content.match(/^#\s+(.+)$/m)
    if (titleMatch) {
      result.courseTitle = titleMatch[1].trim()
    }

    // 解析课程描述
    const descMatch = content.match(/^## 课程描述\s*\n(.+?)(?=\n## |$)/s)
    if (descMatch) {
      result.courseDescription = descMatch[1].trim()
    }

    // 解析难度级别
    const levelMatch = content.match(/^## 难度级别\s*\n\*\*级别：\*\*\s*(.+)$/m)
    if (levelMatch) {
      result.difficulty = levelMatch[1].trim()
    }

    // 解析学习目标
    const objectivesMatch = content.match(/^## 学习目标\s*\n((?:- .+\n?)+)/s)
    if (objectivesMatch) {
      const objectives = objectivesMatch[1].split('\n')
        .filter(line => line.trim().startsWith('- '))
        .map(line => line.replace(/^-\s*/, '').trim())
        .filter(obj => obj)
      result.objectives = objectives
    }

    // 解析章节
    const chapters: Array<{
      order: number
      title: string
      description: string
      duration: number
    }> = []
    
    const chapterRegex = /^### 第(\d+)章：(.+)\n\*\*描述：\*\*\s*(.+)\n\*\*时长：\*\*\s*(\d+)分钟/gm
    let match
    while ((match = chapterRegex.exec(content)) !== null) {
      chapters.push({
        order: parseInt(match[1]),
        title: match[2].trim(),
        description: match[3].trim(),
        duration: parseInt(match[4])
      })
    }

    if (chapters.length > 0) {
      result.chapters = chapters
    }

    // 只有当有实际内容时才返回结果
    return Object.keys(result).length > 0 ? result : null
  }

  // 解析完整的Markdown内容
  private parseFullMarkdown(markdown: string): MarkdownParseResult {
    // 解析课程标题
    const titleMatch = markdown.match(/^#\s+(.+)$/m)
    const courseTitle = titleMatch ? titleMatch[1].trim() : '未命名课程'

    // 解析课程描述
    const descMatch = markdown.match(/^## 课程描述\s*\n(.+?)(?=\n## |$)/s)
    const courseDescription = descMatch ? descMatch[1].trim() : '课程描述'

    // 解析难度级别
    const levelMatch = markdown.match(/^## 难度级别\s*\n\*\*级别：\*\*\s*(.+)$/m)
    const difficulty = levelMatch ? levelMatch[1].trim() : '中级'

    // 解析学习目标
    const objectivesMatch = markdown.match(/^## 学习目标\s*\n((?:- .+\n?)+)/s)
    const objectives = objectivesMatch 
      ? objectivesMatch[1].split('\n')
          .filter(line => line.trim().startsWith('- '))
          .map(line => line.replace(/^-\s*/, '').trim())
          .filter(obj => obj)
      : []

    // 解析章节
    const chapters: Array<{
      order: number
      title: string
      description: string
      duration: number
    }> = []
    
    const chapterRegex = /^### 第(\d+)章：(.+)\n\*\*描述：\*\*\s*(.+)\n\*\*时长：\*\*\s*(\d+)分钟/gm
    let match
    while ((match = chapterRegex.exec(markdown)) !== null) {
      chapters.push({
        order: parseInt(match[1]),
        title: match[2].trim(),
        description: match[3].trim(),
        duration: parseInt(match[4])
      })
    }

    return {
      courseTitle,
      courseDescription,
      difficulty,
      objectives,
      chapters
    }
  }

  // 重置解析器
  reset(): void {
    this.markdownBuffer = ''
    this.lastParsedLength = 0
  }

  // 获取当前Markdown内容
  getCurrentMarkdown(): string {
    return this.markdownBuffer
  }
}

export default MarkdownStreamParser
