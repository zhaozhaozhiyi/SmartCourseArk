import { createKimiAPI } from '@/shared/api/kimi'
import { getRecommendedModel } from '@/shared/constants/kimiModels'
import DOMPurify from 'dompurify'

export class InteractiveContentGenerator {
  private kimiAPI = createKimiAPI()

  /**
   * 生成交互式HTML内容
   */
  async generateInteractiveContent(
    courseTitle: string,
    chapterTitle: string,
    chapterDescription: string,
    chapterContent: string
  ): Promise<string> {
    const prompt = this.buildPrompt(courseTitle, chapterTitle, chapterDescription, chapterContent)
    
    try {
      const response = await this.kimiAPI.chat({
        model: getRecommendedModel('svg'),
        messages: [
          {
            role: 'system',
            content: '你是一个专业的交互式学习内容生成专家，专门为教育课程创建可交互的HTML学习内容。你需要根据章节内容智能选择最合适的内容类型：教育图表、流程图、概念图、交互式演示、动画插图等。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000
      })

      return this.extractAndSanitizeContent(response.choices[0].message.content)
    } catch (error) {
      console.error('交互式内容生成失败:', error)
      throw new Error('生成交互式内容失败，请检查网络连接或稍后重试')
    }
  }

  /**
   * 构建提示词
   */
  private buildPrompt(
    courseTitle: string,
    chapterTitle: string,
    chapterDescription: string,
    chapterContent: string
  ): string {
    return `
请为以下课程章节生成一个交互式的HTML学习内容：

**课程信息：**
- 课程：${courseTitle}
- 章节：${chapterTitle}
- 描述：${chapterDescription}
- 内容：${chapterContent}

**生成要求：**
1. 根据章节内容智能选择最合适的内容类型：
   - 如果是概念性内容，生成教育图表（带标注的图表、流程图、概念图）
   - 如果是过程性内容，生成分步动画（交互式演示、步骤说明）
   - 如果是实验性内容，生成交互式实验演示
   - 如果是数据性内容，生成可视化图表

2. HTML内容必须包含以下特性：
   - 使用CSS动画和过渡效果实现交互
   - 支持鼠标悬停效果（使用CSS :hover伪类）
   - 包含清晰的视觉层次和颜色搭配
   - 适合教育场景的交互设计
   - 内容大小自适应父容器

3. 技术要求：
   - 生成完整的HTML代码，包含HTML结构、CSS样式
   - 使用相对单位和百分比确保响应式
   - 容器大小限制为父容器的100%宽高
   - 使用CSS动画和过渡效果，不要使用JavaScript
   - 不要包含onclick、onmouseover等内联事件处理器
   - 确保代码可以直接在浏览器中运行

4. 布局要求：
   - 内容容器使用 width: 100%; height: 100%;
   - 使用 flexbox 或 grid 布局
   - 确保内容在父容器内居中显示
   - 支持不同屏幕尺寸的响应式设计

5. 教育价值：
   - 内容要生动有趣，符合教育目的
   - 包含知识点标注和解释
   - 适合学生年龄和学习水平
   - 有助于理解和记忆

6. 安全要求：
   - 不要包含任何JavaScript代码
   - 不要使用内联事件处理器
   - 只使用CSS实现交互效果
   - 确保内容安全，无XSS风险

请直接返回完整的HTML代码，不要包含任何markdown格式标记。
    `.trim()
  }

  /**
   * 提取并清理HTML内容
   */
  private extractAndSanitizeContent(content: string): string {
    // 首先尝试提取完整的HTML结构
    const htmlMatch = content.match(/<html[\s\S]*?<\/html>/i)
    if (htmlMatch) {
      return this.sanitizeContent(htmlMatch[0])
    }
    
    // 尝试提取body内容
    const bodyMatch = content.match(/<body[\s\S]*?<\/body>/i)
    if (bodyMatch) {
      return this.sanitizeContent(bodyMatch[0])
    }
    
    // 尝试提取div容器
    const divMatch = content.match(/<div[\s\S]*?<\/div>/i)
    if (divMatch) {
      return this.sanitizeContent(divMatch[0])
    }
    
    // 如果都没有，返回清理后的原始内容
    return this.sanitizeContent(content)
  }

  /**
   * 清理内容，确保安全性
   */
  private sanitizeContent(content: string): string {
    // 先移除所有script标签和JavaScript代码
    const cleanedContent = content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
    
    return DOMPurify.sanitize(cleanedContent, {
      ADD_TAGS: [
        // HTML结构标签
        'div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'section', 'article', 'header', 'footer', 'main',
        'ul', 'ol', 'li', 'dl', 'dt', 'dd', 'table', 'tr', 'td', 'th', 'thead', 'tbody', 'tfoot',
        'a', 'img', 'br', 'hr', 'strong', 'em', 'b', 'i', 'u', 's', 'small', 'mark', 'del', 'ins',
        // SVG标签
        'svg', 'path', 'circle', 'rect', 'line', 'polygon', 'polyline', 'g', 'text', 'animate', 'animateTransform', 
        'defs', 'clipPath', 'mask', 'pattern', 'linearGradient', 'radialGradient', 'stop',
        // 样式标签
        'style', 'link'
      ],
      ADD_ATTR: [
        // 通用属性
        'class', 'id', 'style', 'title', 'lang', 'dir', 'data-*', 'aria-*', 'role', 'tabindex',
        // 布局属性
        'width', 'height', 'max-width', 'max-height', 'min-width', 'min-height',
        // SVG属性
        'viewBox', 'xmlns', 'fill', 'stroke', 'stroke-width', 'stroke-dasharray', 'd', 'cx', 'cy', 'r', 'x', 'y', 'transform',
        // 图片属性
        'src', 'alt', 'loading', 'decoding'
      ],
      ALLOW_DATA_ATTR: true,
      ALLOW_UNKNOWN_PROTOCOLS: false,
      FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'input', 'button', 'textarea', 'select'],
      FORBID_ATTR: ['onclick', 'onmouseover', 'onmouseout', 'onmousedown', 'onmouseup', 'onmousemove', 'onmouseleave', 'onmouseenter', 'onload', 'onerror']
    })
  }

  /**
   * 从文件系统加载预制内容
   */
  async loadPrebuiltContent(courseId: string, chapterId: string): Promise<string | null> {
    try {
      const response = await fetch(`/interactive-svg/${courseId}/${chapterId}.html`)
      if (response.ok) {
        const content = await response.text()
        return this.sanitizeContent(content)
      }
    } catch (error) {
      console.log(`未找到预制交互内容: ${courseId}/${chapterId}`)
    }
    return null
  }

  /**
   * 检查是否存在预制内容
   */
  async checkPrebuiltExists(courseId: string, chapterId: string): Promise<boolean> {
    try {
      const response = await fetch(`/interactive-svg/${courseId}/${chapterId}.html`, { method: 'HEAD' })
      return response.ok
    } catch (error) {
      return false
    }
  }

  /**
   * 保存到localStorage缓存
   */
  saveToLocalStorage(courseId: string, chapterId: string, content: string): void {
    const key = `interactive-content-${courseId}-${chapterId}`
    try {
      localStorage.setItem(key, content)
    } catch (error) {
      console.warn('保存到localStorage失败:', error)
    }
  }

  /**
   * 从localStorage加载缓存
   */
  loadFromLocalStorage(courseId: string, chapterId: string): string | null {
    const key = `interactive-content-${courseId}-${chapterId}`
    try {
      return localStorage.getItem(key)
    } catch (error) {
      console.warn('从localStorage加载失败:', error)
      return null
    }
  }
}

export default new InteractiveContentGenerator()
