import { InteractiveContentGenerator } from './svgGenerator'

export class PrebuiltContentManager {
  private contentGenerator = new InteractiveContentGenerator()
  private cache = new Map<string, string>()

  /**
   * 加载预制交互内容
   * 优先级：缓存 > localStorage > 文件系统
   */
  async loadPrebuiltContent(courseId: string, chapterId: string): Promise<string | null> {
    const cacheKey = `${courseId}-${chapterId}`
    
    // 1. 检查内存缓存
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!
    }

    // 2. 检查localStorage缓存
    const cachedContent = this.contentGenerator.loadFromLocalStorage(courseId, chapterId)
    if (cachedContent) {
      this.cache.set(cacheKey, cachedContent)
      return cachedContent
    }

    // 3. 从文件系统加载
    const fileContent = await this.contentGenerator.loadPrebuiltContent(courseId, chapterId)
    if (fileContent) {
      // 保存到缓存
      this.cache.set(cacheKey, fileContent)
      this.contentGenerator.saveToLocalStorage(courseId, chapterId, fileContent)
      return fileContent
    }

    return null
  }

  /**
   * 检查是否存在预制内容
   */
  async checkPrebuiltExists(courseId: string, chapterId: string): Promise<boolean> {
    const cacheKey = `${courseId}-${chapterId}`
    
    // 检查缓存
    if (this.cache.has(cacheKey)) {
      return true
    }

    // 检查localStorage
    const cachedContent = this.contentGenerator.loadFromLocalStorage(courseId, chapterId)
    if (cachedContent) {
      this.cache.set(cacheKey, cachedContent)
      return true
    }

    // 检查文件系统
    return await this.contentGenerator.checkPrebuiltExists(courseId, chapterId)
  }

  /**
   * 预加载课程的预制交互内容
   */
  async preloadCourseContent(courseId: string, chapterIds: string[]): Promise<void> {
    const loadPromises = chapterIds.map(async (chapterId) => {
      try {
        const content = await this.loadPrebuiltContent(courseId, chapterId)
        if (content) {
          console.log(`预加载预制交互内容成功: ${courseId}/${chapterId}`)
        }
      } catch (error) {
        console.warn(`预加载预制交互内容失败: ${courseId}/${chapterId}`, error)
      }
    })

    await Promise.all(loadPromises)
  }

  /**
   * 清理缓存
   */
  clearCache(courseId?: string, chapterId?: string): void {
    if (courseId && chapterId) {
      // 清理特定章节的缓存
      const cacheKey = `${courseId}-${chapterId}`
      this.cache.delete(cacheKey)
      
      // 清理localStorage
      const storageKey = `interactive-svg-${courseId}-${chapterId}`
      try {
        localStorage.removeItem(storageKey)
      } catch (error) {
        console.warn('清理localStorage失败:', error)
      }
    } else if (courseId) {
      // 清理整个课程的缓存
      const keysToDelete = Array.from(this.cache.keys()).filter(key => key.startsWith(`${courseId}-`))
      keysToDelete.forEach(key => this.cache.delete(key))
      
      // 清理localStorage中的课程相关数据
      try {
        const keys = Object.keys(localStorage)
        const courseKeys = keys.filter(key => key.startsWith(`interactive-content-${courseId}-`))
        courseKeys.forEach(key => localStorage.removeItem(key))
      } catch (error) {
        console.warn('清理localStorage失败:', error)
      }
    } else {
      // 清理所有缓存
      this.cache.clear()
    }
  }

  /**
   * 获取缓存状态
   */
  getCacheStatus(): { total: number; courses: string[] } {
    const courses = new Set<string>()
    this.cache.forEach((_, key) => {
      const courseId = key.split('-')[0]
      courses.add(courseId)
    })
    
    return {
      total: this.cache.size,
      courses: Array.from(courses)
    }
  }

  /**
   * 批量检查多个章节的预制内容
   */
  async batchCheckPrebuilt(courseId: string, chapterIds: string[]): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {}
    
    const checkPromises = chapterIds.map(async (chapterId) => {
      const exists = await this.checkPrebuiltExists(courseId, chapterId)
      results[chapterId] = exists
    })

    await Promise.all(checkPromises)
    return results
  }
}

export default new PrebuiltContentManager()
