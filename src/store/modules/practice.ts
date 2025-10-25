// 练习系统状态管理

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { 
  PracticeSession, 
  PracticeConfig,
  PracticeResult
} from '@/types/course'
import { createStorageService } from '@/shared/services/storage'
import { useUserStore } from './user'

export const usePracticeStore = defineStore('practice', () => {
  // 状态
  const practiceSessions = ref<PracticeSession[]>([])
  const currentSession = ref<PracticeSession | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 计算属性
  const sessionCount = computed(() => practiceSessions.value.length)
  const completedSessions = computed(() => practiceSessions.value.filter(s => s.status === 'completed'))
  const inProgressSessions = computed(() => practiceSessions.value.filter(s => s.status === 'in_progress'))
  
  // 存储服务
  let storage = createStorageService()
  const userStore = useUserStore()

  // 初始化存储服务
  const initStorage = () => {
    const userId = userStore.userInfo?.userId || 'default'
    storage = createStorageService(userId)
  }

  // 获取所有练习会话
  const fetchPracticeSessions = async (params?: any) => {
    try {
      loading.value = true
      error.value = null
      
      initStorage()
      const sessions = await storage.getPracticeSessions() || []
      
      // 模拟分页
      let filteredSessions = sessions
      if (params?.keyword) {
        filteredSessions = sessions.filter((session: PracticeSession) =>
          session.id.toLowerCase().includes(params.keyword.toLowerCase())
        )
      }
      if (params?.status) {
        filteredSessions = filteredSessions.filter((session: PracticeSession) =>
          session.status === params.status
        )
      }
      if (params?.courseId) {
        filteredSessions = filteredSessions.filter((session: PracticeSession) =>
          session.courseId === params.courseId
        )
      }
      
      const total = filteredSessions.length
      const start = ((params?.page || 1) - 1) * (params?.pageSize || 10)
      const end = start + (params?.pageSize || 10)
      const paginatedSessions = filteredSessions.slice(start, end)
      
      practiceSessions.value = paginatedSessions
      
      return {
        sessions: paginatedSessions,
        total,
        page: params?.page || 1,
        pageSize: params?.pageSize || 10
      }
    } catch (err: any) {
      error.value = err.message || '获取练习会话失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 获取练习会话详情
  const fetchPracticeSession = async (sessionId: string): Promise<PracticeSession | null> => {
    try {
      loading.value = true
      error.value = null
      
      initStorage()
      const sessions = await storage.getPracticeSessions() || []
      const session = sessions.find((s: PracticeSession) => s.id === sessionId)
      
      if (session) {
        currentSession.value = session
        return session
      }
      
      return null
    } catch (err: any) {
      error.value = err.message || '获取练习会话失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 创建练习会话
  const createPracticeSession = async (config: PracticeConfig): Promise<PracticeSession> => {
    try {
      loading.value = true
      error.value = null
      
      initStorage()
      
      const newSession: PracticeSession = {
        id: `session_${Date.now()}`,
        userId: userStore.userInfo?.userId || 'default',
        courseId: config.courseId,
        questionBankId: config.questionBankId,
        startTime: new Date().toISOString(),
        totalQuestions: config.questionCount || 0,
        answeredQuestions: 0,
        correctQuestions: 0,
        answers: [],
        status: 'in_progress',
        duration: 0,
        createdAt: new Date().toISOString(),
        // 保存练习配置信息
        questionTypes: config.questionTypes
      }
      
      const sessions = await storage.getPracticeSessions() || []
      sessions.push(newSession)
      // 保存每个会话
      for (const session of sessions) {
        await storage.savePracticeSession(session)
      }
      
      currentSession.value = newSession
      practiceSessions.value.unshift(newSession)
      
      return newSession
    } catch (err: any) {
      error.value = err.message || '创建练习会话失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 更新练习会话
  const updatePracticeSession = async (sessionId: string, updates: Partial<PracticeSession>): Promise<void> => {
    try {
      loading.value = true
      error.value = null
      
      initStorage()
      const sessions = await storage.getPracticeSessions() || []
      const sessionIndex = sessions.findIndex((s: PracticeSession) => s.id === sessionId)
      
      if (sessionIndex !== -1) {
        sessions[sessionIndex] = { ...sessions[sessionIndex], ...updates }
        // 保存每个会话
      for (const session of sessions) {
        await storage.savePracticeSession(session)
      }
        
        // 更新当前会话
        if (currentSession.value?.id === sessionId) {
          currentSession.value = sessions[sessionIndex]
        }
        
        // 更新列表中的会话
        const listIndex = practiceSessions.value.findIndex(s => s.id === sessionId)
        if (listIndex !== -1) {
          practiceSessions.value[listIndex] = sessions[sessionIndex]
        }
      }
    } catch (err: any) {
      error.value = err.message || '更新练习会话失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 提交练习答案
  const submitAnswer = async (sessionId: string, questionId: string, userAnswer: string | string[]): Promise<void> => {
    try {
      loading.value = true
      error.value = null
      
      const session = practiceSessions.value.find(s => s.id === sessionId) || currentSession.value
      if (!session) {
        throw new Error('练习会话不存在')
      }
      
      // 这里需要根据题目类型判断答案是否正确
      // 暂时模拟逻辑
      const isCorrect = Math.random() > 0.3 // 70%正确率
      
      const answer = {
        questionId,
        userAnswer,
        isCorrect
      }
      
      // 更新答案数组
      const existingAnswerIndex = session.answers.findIndex(a => a.questionId === questionId)
      if (existingAnswerIndex !== -1) {
        session.answers[existingAnswerIndex] = answer
      } else {
        session.answers.push(answer)
        session.answeredQuestions += 1
        if (isCorrect) {
          session.correctQuestions += 1
        }
      }
      
      // 更新会话
      await updatePracticeSession(sessionId, {
        answers: session.answers,
        answeredQuestions: session.answeredQuestions,
        correctQuestions: session.correctQuestions
      })
    } catch (err: any) {
      error.value = err.message || '提交答案失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 完成练习会话
  const completePracticeSession = async (sessionId: string): Promise<PracticeResult> => {
    try {
      loading.value = true
      error.value = null
      
      const session = practiceSessions.value.find(s => s.id === sessionId) || currentSession.value
      if (!session) {
        throw new Error('练习会话不存在')
      }
      
      const endTime = new Date().toISOString()
      const duration = Math.floor((new Date(endTime).getTime() - new Date(session.startTime).getTime()) / 1000)
      const score = session.totalQuestions > 0 ? Math.round((session.correctQuestions / session.totalQuestions) * 100) : 0
      
      const result: PracticeResult = {
        sessionId,
        score,
        totalQuestions: session.totalQuestions,
        correctQuestions: session.correctQuestions,
        incorrectQuestions: session.totalQuestions - session.correctQuestions,
        duration,
        answers: session.answers
      }
      
      // 更新会话状态
      await updatePracticeSession(sessionId, {
        status: 'completed',
        endTime,
        duration,
        score
      })
      
      return result
    } catch (err: any) {
      error.value = err.message || '完成练习会话失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 删除练习会话
  const deletePracticeSession = async (sessionId: string): Promise<void> => {
    try {
      loading.value = true
      error.value = null
      
      initStorage()
      await storage.deletePracticeSession(sessionId)
      
      // 从列表中移除
      practiceSessions.value = practiceSessions.value.filter(s => s.id !== sessionId)
      
      // 清空当前会话
      if (currentSession.value?.id === sessionId) {
        currentSession.value = null
      }
    } catch (err: any) {
      error.value = err.message || '删除练习会话失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 获取练习统计
  const getPracticeStats = async (courseId?: string) => {
    try {
      initStorage()
      const sessions = await storage.getPracticeSessions() || []
      
      let filteredSessions = sessions
      if (courseId) {
        filteredSessions = sessions.filter((s: PracticeSession) => s.courseId === courseId)
      }
      
      const completedSessions = filteredSessions.filter(s => s.status === 'completed')
      const totalQuestions = completedSessions.reduce((sum, s) => sum + s.totalQuestions, 0)
      const correctQuestions = completedSessions.reduce((sum, s) => sum + s.correctQuestions, 0)
      const averageScore = completedSessions.length > 0 
        ? Math.round(completedSessions.reduce((sum, s) => sum + (s.score || 0), 0) / completedSessions.length)
        : 0
      const totalDuration = completedSessions.reduce((sum, s) => sum + s.duration, 0)
      
      return {
        totalSessions: filteredSessions.length,
        completedSessions: completedSessions.length,
        totalQuestions,
        correctQuestions,
        averageScore,
        totalDuration
      }
    } catch (err: any) {
      error.value = err.message || '获取练习统计失败'
      throw err
    }
  }

  return {
    // 状态
    practiceSessions,
    currentSession,
    loading,
    error,
    
    // 计算属性
    sessionCount,
    completedSessions,
    inProgressSessions,
    
    // 方法
    fetchPracticeSessions,
    fetchPracticeSession,
    createPracticeSession,
    updatePracticeSession,
    submitAnswer,
    completePracticeSession,
    deletePracticeSession,
    getPracticeStats
  }
})
