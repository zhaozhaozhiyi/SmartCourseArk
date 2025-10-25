// LocalStorage 数据存储服务

import type { 
  Course, 
  Chapter, 
  Question, 
  QuestionBank,
  QuestionGroup,
  LearningRecord, 
  StudySession, 
  PracticeSession,
  LearningAnalytics
} from '@/types/course'

// 存储键前缀
const STORAGE_KEYS = {
  COURSES: 'courses',
  CHAPTERS: 'chapters', 
  QUESTIONS: 'questions',
  QUESTION_BANKS: 'question_banks',
  QUESTION_GROUPS: 'question_groups',
  LEARNING_RECORDS: 'learning_records',
  STUDY_SESSIONS: 'study_sessions',
  PRACTICE_SESSIONS: 'practice_sessions',
  LEARNING_ANALYTICS: 'learning_analytics',
  APP_VERSION: 'app_version'
} as const

// 当前应用版本
const CURRENT_VERSION = '1.0.0'

class StorageService {
  private userId: string

  constructor(userId: string = 'default') {
    this.userId = userId
    this.checkVersion()
  }

  // 检查版本并处理数据迁移
  private checkVersion() {
    const storedVersion = localStorage.getItem(STORAGE_KEYS.APP_VERSION)
    if (storedVersion !== CURRENT_VERSION) {
      // 版本更新，可以在这里处理数据迁移
      localStorage.setItem(STORAGE_KEYS.APP_VERSION, CURRENT_VERSION)
    }
  }

  // 生成带用户ID的存储键
  private getStorageKey(key: string): string {
    return `${key}_${this.userId}`
  }

  // 通用存储方法
  private setItem<T>(key: string, data: T): void {
    try {
      const serializedData = JSON.stringify(data)
      localStorage.setItem(this.getStorageKey(key), serializedData)
    } catch (error) {
      console.error('存储数据失败:', error)
      throw new Error('存储数据失败，请检查存储空间')
    }
  }

  // 通用读取方法
  private getItem<T>(key: string): T | null {
    try {
      const data = localStorage.getItem(this.getStorageKey(key))
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error('读取数据失败:', error)
      return null
    }
  }

  // 通用删除方法
  private removeItem(key: string): void {
    localStorage.removeItem(this.getStorageKey(key))
  }

  // 课程相关存储方法
  async saveCourse(course: Course): Promise<void> {
    const courses = await this.getCourses()
    const existingIndex = courses.findIndex(c => c.id === course.id)
    
    if (existingIndex >= 0) {
      courses[existingIndex] = { ...course, updatedAt: new Date().toISOString() }
    } else {
      courses.push({ ...course, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() })
    }
    
    this.setItem(STORAGE_KEYS.COURSES, courses)
  }

  async getCourses(): Promise<Course[]> {
    return this.getItem<Course[]>(STORAGE_KEYS.COURSES) || []
  }

  async getCourse(id: string): Promise<Course | null> {
    const courses = await this.getCourses()
    return courses.find(c => c.id === id) || null
  }

  async deleteCourse(id: string): Promise<void> {
    const courses = await this.getCourses()
    const filteredCourses = courses.filter(c => c.id !== id)
    this.setItem(STORAGE_KEYS.COURSES, filteredCourses)
    
    // 同时删除相关的章节、题目等
    await this.deleteChaptersByCourseId(id)
    await this.deleteQuestionsByCourseId(id)
    await this.deleteQuestionBanksByCourseId(id)
  }

  // 章节相关存储方法
  async saveChapter(chapter: Chapter): Promise<void> {
    const chapters = await this.getChapters()
    const existingIndex = chapters.findIndex(c => c.id === chapter.id)
    
    if (existingIndex >= 0) {
      chapters[existingIndex] = { ...chapter, updatedAt: new Date().toISOString() }
    } else {
      chapters.push({ ...chapter, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() })
    }
    
    this.setItem(STORAGE_KEYS.CHAPTERS, chapters)
  }

  // 保存章节交互式内容
  async saveChapterInteractiveContent(chapterId: string, content: string): Promise<void> {
    const chapters = await this.getChapters()
    const chapterIndex = chapters.findIndex(c => c.id === chapterId)
    
    if (chapterIndex >= 0) {
      chapters[chapterIndex] = {
        ...chapters[chapterIndex],
        interactiveContent: content,
        hasInteractiveContent: true,
        interactiveContentType: 'generated',
        updatedAt: new Date().toISOString()
      }
      this.setItem(STORAGE_KEYS.CHAPTERS, chapters)
    } else {
      throw new Error('章节不存在')
    }
  }

  // 获取章节交互式内容
  async getChapterInteractiveContent(chapterId: string): Promise<string | null> {
    const chapter = await this.getChapter(chapterId)
    return chapter?.interactiveContent || null
  }

  // 更新章节交互式内容状态
  async updateChapterInteractiveContentStatus(
    chapterId: string, 
    hasInteractiveContent: boolean, 
    interactiveContentType?: 'prebuilt' | 'generated'
  ): Promise<void> {
    const chapters = await this.getChapters()
    const chapterIndex = chapters.findIndex(c => c.id === chapterId)
    
    if (chapterIndex >= 0) {
      chapters[chapterIndex] = {
        ...chapters[chapterIndex],
        hasInteractiveContent,
        interactiveContentType,
        updatedAt: new Date().toISOString()
      }
      this.setItem(STORAGE_KEYS.CHAPTERS, chapters)
    }
  }

  async getChapters(): Promise<Chapter[]> {
    return this.getItem<Chapter[]>(STORAGE_KEYS.CHAPTERS) || []
  }

  async getChaptersByCourseId(courseId: string): Promise<Chapter[]> {
    const chapters = await this.getChapters()
    return chapters.filter(c => c.courseId === courseId).sort((a, b) => a.orderIndex - b.orderIndex)
  }

  async getChapter(id: string): Promise<Chapter | null> {
    const chapters = await this.getChapters()
    return chapters.find(c => c.id === id) || null
  }

  async deleteChapter(id: string): Promise<void> {
    const chapters = await this.getChapters()
    const filteredChapters = chapters.filter(c => c.id !== id)
    this.setItem(STORAGE_KEYS.CHAPTERS, filteredChapters)
  }

  async deleteChaptersByCourseId(courseId: string): Promise<void> {
    const chapters = await this.getChapters()
    const filteredChapters = chapters.filter(c => c.courseId !== courseId)
    this.setItem(STORAGE_KEYS.CHAPTERS, filteredChapters)
  }

  // 题目相关存储方法
  async saveQuestion(question: Question): Promise<void> {
    const questions = await this.getQuestions()
    const existingIndex = questions.findIndex(q => q.id === question.id)
    
    if (existingIndex >= 0) {
      questions[existingIndex] = { ...question, updatedAt: new Date().toISOString() }
    } else {
      questions.push({ ...question, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() })
    }
    
    this.setItem(STORAGE_KEYS.QUESTIONS, questions)
  }

  async getQuestions(): Promise<Question[]> {
    return this.getItem<Question[]>(STORAGE_KEYS.QUESTIONS) || []
  }

  async getQuestionsByBankId(bankId: string): Promise<Question[]> {
    const questions = await this.getQuestions()
    return questions.filter(q => q.bankId === bankId)
  }

  async getQuestionsByCourseId(courseId: string): Promise<Question[]> {
    const questions = await this.getQuestions()
    return questions.filter(q => q.courseId === courseId)
  }

  async getQuestionsByChapterId(chapterId: string): Promise<Question[]> {
    const questions = await this.getQuestions()
    return questions.filter(q => q.chapterId === chapterId)
  }

  async getQuestion(id: string): Promise<Question | null> {
    const questions = await this.getQuestions()
    return questions.find(q => q.id === id) || null
  }

  async deleteQuestion(id: string): Promise<void> {
    const questions = await this.getQuestions()
    const filteredQuestions = questions.filter(q => q.id !== id)
    this.setItem(STORAGE_KEYS.QUESTIONS, filteredQuestions)
  }

  async deleteQuestionsByCourseId(courseId: string): Promise<void> {
    const questions = await this.getQuestions()
    const filteredQuestions = questions.filter(q => q.courseId !== courseId)
    this.setItem(STORAGE_KEYS.QUESTIONS, filteredQuestions)
  }

  // 题库相关存储方法
  async saveQuestionBank(questionBank: QuestionBank): Promise<void> {
    const questionBanks = await this.getQuestionBanks()
    const existingIndex = questionBanks.findIndex(qb => qb.id === questionBank.id)
    
    if (existingIndex >= 0) {
      questionBanks[existingIndex] = { ...questionBank, updatedAt: new Date().toISOString() }
    } else {
      questionBanks.push({ ...questionBank, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() })
    }
    
    this.setItem(STORAGE_KEYS.QUESTION_BANKS, questionBanks)
  }

  async getQuestionBanks(): Promise<QuestionBank[]> {
    return this.getItem<QuestionBank[]>(STORAGE_KEYS.QUESTION_BANKS) || []
  }

  async getQuestionBanksByCourseId(courseId: string): Promise<QuestionBank[]> {
    const questionBanks = await this.getQuestionBanks()
    return questionBanks.filter(qb => qb.courseId === courseId)
  }

  async getQuestionBank(id: string): Promise<QuestionBank | null> {
    const questionBanks = await this.getQuestionBanks()
    return questionBanks.find(qb => qb.id === id) || null
  }

  async deleteQuestionBank(id: string): Promise<void> {
    const questionBanks = await this.getQuestionBanks()
    const filteredQuestionBanks = questionBanks.filter(qb => qb.id !== id)
    this.setItem(STORAGE_KEYS.QUESTION_BANKS, filteredQuestionBanks)
    
    // 同时删除相关题目
    await this.deleteQuestionsByBankId(id)
  }

  async deleteQuestionBanksByCourseId(courseId: string): Promise<void> {
    const questionBanks = await this.getQuestionBanks()
    const filteredQuestionBanks = questionBanks.filter(qb => qb.courseId !== courseId)
    this.setItem(STORAGE_KEYS.QUESTION_BANKS, filteredQuestionBanks)
  }

  private async deleteQuestionsByBankId(bankId: string): Promise<void> {
    const questions = await this.getQuestions()
    const filteredQuestions = questions.filter(q => q.bankId !== bankId)
    this.setItem(STORAGE_KEYS.QUESTIONS, filteredQuestions)
  }

  // 题目分组相关存储方法
  async saveQuestionGroup(group: QuestionGroup): Promise<void> {
    const groups = await this.getQuestionGroups()
    const existingIndex = groups.findIndex(g => g.id === group.id)
    
    if (existingIndex >= 0) {
      groups[existingIndex] = { ...group, updatedAt: new Date().toISOString() }
    } else {
      groups.push({ ...group, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() })
    }
    
    this.setItem(STORAGE_KEYS.QUESTION_GROUPS, groups)
  }

  async getQuestionGroups(): Promise<QuestionGroup[]> {
    return this.getItem<QuestionGroup[]>(STORAGE_KEYS.QUESTION_GROUPS) || []
  }

  async getQuestionGroupsByCourseId(courseId: string): Promise<QuestionGroup[]> {
    const groups = await this.getQuestionGroups()
    return groups.filter(g => g.courseId === courseId)
  }

  async getQuestionGroup(id: string): Promise<QuestionGroup | null> {
    const groups = await this.getQuestionGroups()
    return groups.find(g => g.id === id) || null
  }

  async deleteQuestionGroup(id: string): Promise<void> {
    const groups = await this.getQuestionGroups()
    const filteredGroups = groups.filter(g => g.id !== id)
    this.setItem(STORAGE_KEYS.QUESTION_GROUPS, filteredGroups)
  }

  async deleteQuestionGroupsByCourseId(courseId: string): Promise<void> {
    const groups = await this.getQuestionGroups()
    const filteredGroups = groups.filter(g => g.courseId !== courseId)
    this.setItem(STORAGE_KEYS.QUESTION_GROUPS, filteredGroups)
  }

  // 学习记录相关存储方法
  async saveLearningRecord(record: LearningRecord): Promise<void> {
    const records = await this.getLearningRecords()
    const existingIndex = records.findIndex(r => r.id === record.id)
    
    if (existingIndex >= 0) {
      records[existingIndex] = { ...record, updatedAt: new Date().toISOString() }
    } else {
      records.push({ ...record, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() })
    }
    
    this.setItem(STORAGE_KEYS.LEARNING_RECORDS, records)
  }

  async getLearningRecords(): Promise<LearningRecord[]> {
    return this.getItem<LearningRecord[]>(STORAGE_KEYS.LEARNING_RECORDS) || []
  }

  async getLearningRecordsByUserId(userId: string): Promise<LearningRecord[]> {
    const records = await this.getLearningRecords()
    return records.filter(r => r.userId === userId)
  }

  async getLearningRecordsByCourseId(courseId: string): Promise<LearningRecord[]> {
    const records = await this.getLearningRecords()
    return records.filter(r => r.courseId === courseId)
  }

  // 学习会话相关存储方法
  async saveStudySession(session: StudySession): Promise<void> {
    const sessions = await this.getStudySessions()
    const existingIndex = sessions.findIndex(s => s.id === session.id)
    
    if (existingIndex >= 0) {
      sessions[existingIndex] = { ...session, updatedAt: new Date().toISOString() }
    } else {
      sessions.push({ ...session, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() })
    }
    
    this.setItem(STORAGE_KEYS.STUDY_SESSIONS, sessions)
  }

  async getStudySessions(): Promise<StudySession[]> {
    return this.getItem<StudySession[]>(STORAGE_KEYS.STUDY_SESSIONS) || []
  }

  async getStudySessionsByUserId(userId: string): Promise<StudySession[]> {
    const sessions = await this.getStudySessions()
    return sessions.filter(s => s.userId === userId)
  }

  // 练习会话相关存储方法
  async savePracticeSession(session: PracticeSession): Promise<void> {
    const sessions = await this.getPracticeSessions()
    const existingIndex = sessions.findIndex(s => s.id === session.id)
    
    if (existingIndex >= 0) {
      sessions[existingIndex] = { ...session }
    } else {
      sessions.push({ ...session })
    }
    
    this.setItem(STORAGE_KEYS.PRACTICE_SESSIONS, sessions)
  }

  async getPracticeSessions(): Promise<PracticeSession[]> {
    return this.getItem<PracticeSession[]>(STORAGE_KEYS.PRACTICE_SESSIONS) || []
  }

  async getPracticeSessionsByUserId(userId: string): Promise<PracticeSession[]> {
    const sessions = await this.getPracticeSessions()
    return sessions.filter(s => s.userId === userId)
  }

  async getPracticeSession(id: string): Promise<PracticeSession | null> {
    const sessions = await this.getPracticeSessions()
    return sessions.find(s => s.id === id) || null
  }

  async deletePracticeSession(id: string): Promise<void> {
    const sessions = await this.getPracticeSessions()
    const filteredSessions = sessions.filter(s => s.id !== id)
    this.setItem(STORAGE_KEYS.PRACTICE_SESSIONS, filteredSessions)
  }

  // 学习分析数据存储
  async saveLearningAnalytics(analytics: LearningAnalytics): Promise<void> {
    this.setItem(STORAGE_KEYS.LEARNING_ANALYTICS, analytics)
  }

  async getLearningAnalytics(): Promise<LearningAnalytics | null> {
    return this.getItem<LearningAnalytics>(STORAGE_KEYS.LEARNING_ANALYTICS)
  }

  // 数据导入导出
  async exportData(): Promise<string> {
    const data = {
      courses: await this.getCourses(),
      chapters: await this.getChapters(),
      questions: await this.getQuestions(),
      questionBanks: await this.getQuestionBanks(),
      learningRecords: await this.getLearningRecords(),
      studySessions: await this.getStudySessions(),
      practiceSessions: await this.getPracticeSessions(),
      version: CURRENT_VERSION,
      exportDate: new Date().toISOString()
    }
    
    return JSON.stringify(data, null, 2)
  }

  async importData(jsonData: string): Promise<void> {
    try {
      const data = JSON.parse(jsonData)
      
      // 验证数据格式
      if (!data.version || !data.exportDate) {
        throw new Error('无效的数据格式')
      }
      
      // 导入数据
      if (data.courses) this.setItem(STORAGE_KEYS.COURSES, data.courses)
      if (data.chapters) this.setItem(STORAGE_KEYS.CHAPTERS, data.chapters)
      if (data.questions) this.setItem(STORAGE_KEYS.QUESTIONS, data.questions)
      if (data.questionBanks) this.setItem(STORAGE_KEYS.QUESTION_BANKS, data.questionBanks)
      if (data.learningRecords) this.setItem(STORAGE_KEYS.LEARNING_RECORDS, data.learningRecords)
      if (data.studySessions) this.setItem(STORAGE_KEYS.STUDY_SESSIONS, data.studySessions)
      if (data.practiceSessions) this.setItem(STORAGE_KEYS.PRACTICE_SESSIONS, data.practiceSessions)
      
    } catch (error) {
      console.error('导入数据失败:', error)
      throw new Error('导入数据失败，请检查数据格式')
    }
  }

  // 清除所有数据
  async clearAllData(): Promise<void> {
    Object.values(STORAGE_KEYS).forEach(key => {
      this.removeItem(key)
    })
  }

  // 获取存储使用情况
  getStorageUsage(): { used: number; available: number; total: number } {
    let used = 0
    Object.values(STORAGE_KEYS).forEach(key => {
      const data = localStorage.getItem(this.getStorageKey(key))
      if (data) {
        used += data.length
      }
    })
    
    // 估算可用空间（大多数浏览器限制为5-10MB）
    const total = 5 * 1024 * 1024 // 5MB
    const available = total - used
    
    return { used, available, total }
  }
}

// 创建单例实例
let storageInstance: StorageService | null = null

export const createStorageService = (userId: string = 'default'): StorageService => {
  if (!storageInstance || storageInstance['userId'] !== userId) {
    storageInstance = new StorageService(userId)
  }
  return storageInstance
}

export default StorageService
