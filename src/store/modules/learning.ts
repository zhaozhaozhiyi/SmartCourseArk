// 学习记录状态管理

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { 
  LearningRecord, 
  StudySession, 
  PracticeSession,
  LearningAnalytics,
  LearningStats,
  CourseStats,
  ChapterStats,
  PracticeStats
} from '@/types/course'
import { createStorageService } from '@/shared/services/storage'
import { useUserStore } from './user'

export const useLearningStore = defineStore('learning', () => {
  // 状态
  const learningRecords = ref<LearningRecord[]>([])
  const studySessions = ref<StudySession[]>([])
  const practiceSessions = ref<PracticeSession[]>([])
  const currentStudySession = ref<StudySession | null>(null)
  const currentPracticeSession = ref<PracticeSession | null>(null)
  const learningAnalytics = ref<LearningAnalytics | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 计算属性
  const recordCount = computed(() => learningRecords.value.length)
  const sessionCount = computed(() => studySessions.value.length + practiceSessions.value.length)
  
  // 当前学习统计
  const currentStats = computed(() => {
    if (!learningAnalytics.value) return null
    return learningAnalytics.value.stats
  })

  // 存储服务
  let storage = createStorageService()
  const userStore = useUserStore()

  // 初始化存储服务
  const initStorage = () => {
    const userId = userStore.userInfo?.userId || 'default'
    storage = createStorageService(userId)
  }

  // 获取学习记录
  const fetchLearningRecords = async (userId?: string): Promise<LearningRecord[]> => {
    try {
      loading.value = true
      error.value = null
      
      initStorage()
      const userStore = useUserStore()
      const targetUserId = userId || userStore.userInfo?.userId || 'default'
      
      const records = await storage.getLearningRecordsByUserId(targetUserId)
      learningRecords.value = records
      return records
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取学习记录失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 获取学习会话
  const fetchStudySessions = async (userId?: string): Promise<StudySession[]> => {
    try {
      loading.value = true
      error.value = null
      
      initStorage()
      const userStore = useUserStore()
      const targetUserId = userId || userStore.userInfo?.userId || 'default'
      
      const sessions = await storage.getStudySessionsByUserId(targetUserId)
      studySessions.value = sessions
      return sessions
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取学习会话失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 获取练习会话
  const fetchPracticeSessions = async (userId?: string): Promise<PracticeSession[]> => {
    try {
      loading.value = true
      error.value = null
      
      initStorage()
      const userStore = useUserStore()
      const targetUserId = userId || userStore.userInfo?.userId || 'default'
      
      const sessions = await storage.getPracticeSessionsByUserId(targetUserId)
      practiceSessions.value = sessions
      return sessions
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取练习会话失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 保存学习记录
  const saveLearningRecord = async (record: Omit<LearningRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<LearningRecord> => {
    try {
      initStorage()
      const userStore = useUserStore()
      const userId = userStore.userInfo?.userId || 'default'
      
      const newRecord: LearningRecord = {
        id: `record_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        ...record,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      await storage.saveLearningRecord(newRecord)
      learningRecords.value.push(newRecord)
      
      return newRecord
    } catch (err) {
      error.value = err instanceof Error ? err.message : '保存学习记录失败'
      throw err
    }
  }

  // 开始学习会话
  const startStudySession = async (courseId: string, chapterId?: string): Promise<StudySession> => {
    try {
      initStorage()
      const userStore = useUserStore()
      const userId = userStore.userInfo?.userId || 'default'
      
      const newSession: StudySession = {
        id: `study_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        courseId,
        chapterId,
        startTime: new Date().toISOString(),
        durationMinutes: 0,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      await storage.saveStudySession(newSession)
      currentStudySession.value = newSession
      
      return newSession
    } catch (err) {
      error.value = err instanceof Error ? err.message : '开始学习会话失败'
      throw err
    }
  }

  // 结束学习会话
  const endStudySession = async (sessionId: string): Promise<StudySession> => {
    try {
      const session = currentStudySession.value
      if (!session || session.id !== sessionId) {
        throw new Error('学习会话不存在')
      }
      
      const endTime = new Date().toISOString()
      const startTime = new Date(session.startTime)
      const durationMinutes = Math.round((new Date(endTime).getTime() - startTime.getTime()) / 60000)
      
      const updatedSession: StudySession = {
        ...session,
        endTime,
        durationMinutes,
        status: 'completed',
        updatedAt: new Date().toISOString()
      }
      
      await storage.saveStudySession(updatedSession)
      currentStudySession.value = updatedSession
      
      return updatedSession
    } catch (err) {
      error.value = err instanceof Error ? err.message : '结束学习会话失败'
      throw err
    }
  }

  // 开始练习会话
  const startPracticeSession = async (
    courseId: string, 
    questions: any[], 
    mode: 'chapter' | 'comprehensive' | 'wrong' | 'mock',
    chapterId?: string
  ): Promise<PracticeSession> => {
    try {
      initStorage()
      const userStore = useUserStore()
      const userId = userStore.userInfo?.userId || 'default'
      
      const newSession: PracticeSession = {
        id: `practice_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        courseId,
        chapterId,
        questions,
        currentQuestionIndex: 0,
        answers: {},
        startTime: new Date().toISOString(),
        durationMinutes: 0,
        status: 'active',
        mode,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      await storage.savePracticeSession(newSession)
      currentPracticeSession.value = newSession
      
      return newSession
    } catch (err) {
      error.value = err instanceof Error ? err.message : '开始练习会话失败'
      throw err
    }
  }

  // 更新练习答案
  const updatePracticeAnswer = async (sessionId: string, questionId: string, answer: string): Promise<void> => {
    try {
      const session = currentPracticeSession.value
      if (!session || session.id !== sessionId) {
        throw new Error('练习会话不存在')
      }
      
      session.answers[questionId] = answer
      session.updatedAt = new Date().toISOString()
      
      await storage.savePracticeSession(session)
    } catch (err) {
      error.value = err instanceof Error ? err.message : '更新练习答案失败'
      throw err
    }
  }

  // 结束练习会话
  const endPracticeSession = async (sessionId: string, answers: Record<string, string>): Promise<PracticeSession> => {
    try {
      const session = currentPracticeSession.value
      if (!session || session.id !== sessionId) {
        throw new Error('练习会话不存在')
      }
      
      const endTime = new Date().toISOString()
      const startTime = new Date(session.startTime)
      const durationMinutes = Math.round((new Date(endTime).getTime() - startTime.getTime()) / 60000)
      
      // 计算分数和正确率
      let correctAnswers = 0
      const totalQuestions = session.questions.length
      
      session.questions.forEach((question, index) => {
        const userAnswer = answers[question.id]
        if (userAnswer === question.answer) {
          correctAnswers++
        }
      })
      
      const accuracyRate = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0
      const score = Math.round(accuracyRate)
      
      const updatedSession: PracticeSession = {
        ...session,
        answers,
        endTime,
        durationMinutes,
        questionsAnswered: totalQuestions,
        correctAnswers,
        accuracyRate,
        score,
        status: 'completed',
        updatedAt: new Date().toISOString()
      }
      
      await storage.savePracticeSession(updatedSession)
      currentPracticeSession.value = updatedSession
      
      // 保存练习记录
      session.questions.forEach((question, index) => {
        const userAnswer = answers[question.id]
        const isCorrect = userAnswer === question.answer
        
        saveLearningRecord({
          userId: session.userId,
          courseId: session.courseId,
          chapterId: session.chapterId || '',
          questionId: question.id,
          userAnswer,
          isCorrect,
          score: isCorrect ? 100 : 0,
          duration: Math.round(durationMinutes * 60 / totalQuestions) // 平均每题用时
        }).catch(console.error)
      })
      
      return updatedSession
    } catch (err) {
      error.value = err instanceof Error ? err.message : '结束练习会话失败'
      throw err
    }
  }

  // 计算学习统计
  const calculateLearningStats = async (): Promise<LearningStats> => {
    try {
      initStorage()
      const userStore = useUserStore()
      const userId = userStore.userInfo?.userId || 'default'
      
      const records = await storage.getLearningRecordsByUserId(userId)
      const sessions = await storage.getStudySessionsByUserId(userId)
      const practiceSessions = await storage.getPracticeSessionsByUserId(userId)
      
      // 计算统计数据
      const totalStudyTime = sessions.reduce((sum, session) => sum + session.durationMinutes, 0)
      const totalPracticeCount = practiceSessions.length
      
      // 计算平均分数
      const practiceScores = practiceSessions
        .filter(session => session.score !== undefined)
        .map(session => session.score!)
      const averageScore = practiceScores.length > 0 
        ? practiceScores.reduce((sum, score) => sum + score, 0) / practiceScores.length 
        : 0
      
      // 获取最后学习日期
      const allSessions = [...sessions, ...practiceSessions]
      const lastStudyDate = allSessions.length > 0 
        ? allSessions.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())[0].startTime
        : undefined
      
      // 计算本周和本月学习时长
      const now = new Date()
      const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay())
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      
      const weeklyStudyTime = sessions
        .filter(session => new Date(session.startTime) >= weekStart)
        .reduce((sum, session) => sum + session.durationMinutes, 0)
      
      const monthlyStudyTime = sessions
        .filter(session => new Date(session.startTime) >= monthStart)
        .reduce((sum, session) => sum + session.durationMinutes, 0)
      
      const stats: LearningStats = {
        totalCourses: new Set(records.map(r => r.courseId)).size,
        completedCourses: 0, // 需要从课程状态计算
        totalStudyTime,
        totalPracticeCount,
        averageScore,
        lastStudyDate,
        weeklyStudyTime,
        monthlyStudyTime
      }
      
      return stats
    } catch (err) {
      console.error('计算学习统计失败:', err)
      throw err
    }
  }

  // 生成学习分析报告
  const generateLearningAnalytics = async (): Promise<LearningAnalytics> => {
    try {
      loading.value = true
      error.value = null
      
      const stats = await calculateLearningStats()
      const userStore = useUserStore()
      const userId = userStore.userInfo?.userId || 'default'
      
      // 这里可以添加更详细的分析逻辑
      const analytics: LearningAnalytics = {
        userId,
        stats,
        courseStats: [], // 需要从课程数据计算
        practiceStats: {
          totalPractices: stats.totalPracticeCount,
          totalQuestions: 0,
          correctAnswers: 0,
          averageScore: stats.averageScore,
          averageTime: 0,
          byType: {
            single: { count: 0, correct: 0, averageScore: 0 },
            multiple: { count: 0, correct: 0, averageScore: 0 },
            judge: { count: 0, correct: 0, averageScore: 0 },
            fill: { count: 0, correct: 0, averageScore: 0 },
            essay: { count: 0, correct: 0, averageScore: 0 }
          },
          byDifficulty: {
            easy: { count: 0, correct: 0, averageScore: 0 },
            medium: { count: 0, correct: 0, averageScore: 0 },
            hard: { count: 0, correct: 0, averageScore: 0 }
          }
        },
        weeklyProgress: [],
        monthlyProgress: [],
        weakPoints: []
      }
      
      await storage.saveLearningAnalytics(analytics)
      learningAnalytics.value = analytics
      
      return analytics
    } catch (err) {
      error.value = err instanceof Error ? err.message : '生成学习分析失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 获取学习分析
  const fetchLearningAnalytics = async (): Promise<LearningAnalytics | null> => {
    try {
      initStorage()
      const analytics = await storage.getLearningAnalytics()
      learningAnalytics.value = analytics
      return analytics
    } catch (err) {
      console.error('获取学习分析失败:', err)
      return null
    }
  }

  // 设置当前学习会话
  const setCurrentStudySession = (session: StudySession | null) => {
    currentStudySession.value = session
  }

  // 设置当前练习会话
  const setCurrentPracticeSession = (session: PracticeSession | null) => {
    currentPracticeSession.value = session
  }

  // 清除错误
  const clearError = () => {
    error.value = null
  }

  return {
    // 状态
    learningRecords,
    studySessions,
    practiceSessions,
    currentStudySession,
    currentPracticeSession,
    learningAnalytics,
    loading,
    error,
    
    // 计算属性
    recordCount,
    sessionCount,
    currentStats,
    
    // 方法
    fetchLearningRecords,
    fetchStudySessions,
    fetchPracticeSessions,
    saveLearningRecord,
    startStudySession,
    endStudySession,
    startPracticeSession,
    updatePracticeAnswer,
    endPracticeSession,
    calculateLearningStats,
    generateLearningAnalytics,
    fetchLearningAnalytics,
    setCurrentStudySession,
    setCurrentPracticeSession,
    clearError
  }
})
