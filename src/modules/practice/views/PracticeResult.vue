<template>
  <div class="practice-result">
    <div class="result-header">
      <div class="header-content">
        <h1 class="result-title">练习结果</h1>
        <p class="result-subtitle">{{ courseTitle }}</p>
      </div>
    </div>

    <div class="result-content" v-if="result">
      <!-- 总体结果 -->
      <el-card class="result-summary">
        <div class="summary-content">
          <div class="score-display">
            <div class="score-circle" :class="getScoreClass(result.score)">
              <div class="score-value">{{ result.score }}</div>
              <div class="score-label">分</div>
            </div>
            <div class="score-info">
              <h2 class="score-title">{{ getScoreTitle(result.score) }}</h2>
              <p class="score-description">{{ getScoreDescription(result.score) }}</p>
            </div>
          </div>
          
          <div class="summary-stats">
            <div class="stat-item">
              <div class="stat-value">{{ result.totalQuestions }}</div>
              <div class="stat-label">总题数</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ result.correctQuestions }}</div>
              <div class="stat-label">正确数</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ result.incorrectQuestions }}</div>
              <div class="stat-label">错误数</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ formatDuration(result.duration) }}</div>
              <div class="stat-label">用时</div>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 详细结果 -->
      <el-card class="result-details">
        <template #header>
          <div class="card-header">
            <span>详细结果</span>
          </div>
        </template>
        
        <div class="details-content">
          <div v-for="(answer, index) in result.answers" :key="index" class="answer-item">
            <div class="answer-header">
              <div class="answer-number">第 {{ index + 1 }} 题</div>
              <div class="answer-status">
                <el-tag :type="answer.isCorrect ? 'success' : 'danger'">
                  {{ answer.isCorrect ? '正确' : '错误' }}
                </el-tag>
              </div>
            </div>
            
            <div class="answer-content">
              <div class="answer-question">
                <strong>题目:</strong> {{ getQuestionText(answer.questionId) }}
              </div>
              <div class="answer-user">
                <strong>您的答案:</strong> {{ formatUserAnswer(answer.userAnswer) }}
              </div>
              <div class="answer-correct" v-if="!answer.isCorrect">
                <strong>正确答案:</strong> {{ getCorrectAnswer(answer.questionId) }}
              </div>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 操作按钮 -->
      <div class="result-actions">
        <el-button type="primary" @click="startNewPractice">
          <FontAwesomeIcon :icon="['fas', 'redo']" class="mr-2" />
          重新练习
        </el-button>
        <el-button @click="goToPracticeList">
          <FontAwesomeIcon :icon="['fas', 'list']" class="mr-2" />
          练习列表
        </el-button>
        <el-button @click="goToCourseDetail">
          <FontAwesomeIcon :icon="['fas', 'book']" class="mr-2" />
          课程详情
        </el-button>
      </div>
    </div>

    <!-- 加载状态 -->
    <div class="loading-container" v-if="loading">
      <el-skeleton :rows="5" animated />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faRedo, faList, faBook } from '@fortawesome/free-solid-svg-icons'
import { usePracticeStore } from '@/store/modules/practice'
import { useCourseStore } from '@/store/modules/course'
import type { PracticeResult } from '@/types/course'

// 添加图标到库
library.add(faRedo, faList, faBook)

const route = useRoute()
const router = useRouter()
const practiceStore = usePracticeStore()
const courseStore = useCourseStore()

const loading = ref(false)
const result = ref<PracticeResult | null>(null)

const courseId = computed(() => route.params.courseId as string)
const sessionId = computed(() => route.params.sessionId as string)
const courseTitle = computed(() => {
  const course = courseStore.courses.find(c => c.id === courseId.value)
  return course?.title || '未知课程'
})

onMounted(async () => {
  await loadResult()
})

const loadResult = async () => {
  try {
    loading.value = true
    const session = await practiceStore.fetchPracticeSession(sessionId.value)
    if (session) {
      result.value = {
        sessionId: session.id,
        score: session.score || 0,
        totalQuestions: session.totalQuestions,
        correctQuestions: session.correctQuestions,
        incorrectQuestions: session.totalQuestions - session.correctQuestions,
        duration: session.duration,
        answers: session.answers
      }
    } else {
      ElMessage.error('练习结果不存在')
      router.push('/practice')
    }
  } catch (error) {
    console.error('加载练习结果失败:', error)
    ElMessage.error('加载练习结果失败')
    router.push('/practice')
  } finally {
    loading.value = false
  }
}

const getScoreClass = (score: number): string => {
  if (score >= 90) return 'excellent'
  if (score >= 80) return 'good'
  if (score >= 60) return 'average'
  return 'poor'
}

const getScoreTitle = (score: number): string => {
  if (score >= 90) return '优秀'
  if (score >= 80) return '良好'
  if (score >= 60) return '及格'
  return '需要努力'
}

const getScoreDescription = (score: number): string => {
  if (score >= 90) return '恭喜您！表现非常出色！'
  if (score >= 80) return '做得很好！继续保持！'
  if (score >= 60) return '不错！还有提升空间。'
  return '加油！多练习会有进步的！'
}

const formatDuration = (seconds: number): string => {
  if (seconds < 60) return `${seconds}秒`
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return remainingSeconds > 0 ? `${minutes}分${remainingSeconds}秒` : `${minutes}分钟`
}

const getQuestionText = (questionId: string): string => {
  // 这里应该根据questionId获取题目内容
  // 暂时返回模拟数据
  return '题目内容...'
}

const formatUserAnswer = (answer: string | string[]): string => {
  if (Array.isArray(answer)) {
    return answer.join(', ')
  }
  return answer
}

const getCorrectAnswer = (questionId: string): string => {
  // 这里应该根据questionId获取正确答案
  // 暂时返回模拟数据
  return '正确答案...'
}

const startNewPractice = () => {
  router.push('/practice')
}

const goToPracticeList = () => {
  router.push('/practice/list')
}

const goToCourseDetail = () => {
  router.push(`/courses/${courseId.value}`)
}
</script>

<style lang="scss" scoped>
.practice-result {
  padding: 24px;
  max-width: 800px;
  margin: 0 auto;
}

.result-header {
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--brand-border-color);

  .header-content {
    .result-title {
      font-size: 28px;
      font-weight: 600;
      color: var(--brand-text-primary);
      margin: 0 0 8px 0;
    }

    .result-subtitle {
      color: var(--brand-text-secondary);
      margin: 0;
    }
  }
}

.result-summary {
  margin-bottom: 24px;

  .summary-content {
    display: flex;
    align-items: center;
    gap: 40px;

    .score-display {
      display: flex;
      align-items: center;
      gap: 24px;

      .score-circle {
        width: 120px;
        height: 120px;
        border-radius: 50%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        position: relative;

        &.excellent {
          background: linear-gradient(135deg, #10b981, #34d399);
        }

        &.good {
          background: linear-gradient(135deg, #3b82f6, #60a5fa);
        }

        &.average {
          background: linear-gradient(135deg, #f59e0b, #fbbf24);
        }

        &.poor {
          background: linear-gradient(135deg, #ef4444, #f87171);
        }

        .score-value {
          font-size: 36px;
          font-weight: 700;
          color: white;
        }

        .score-label {
          font-size: 14px;
          color: white;
          opacity: 0.9;
        }
      }

      .score-info {
        .score-title {
          font-size: 24px;
          font-weight: 600;
          color: var(--brand-text-primary);
          margin: 0 0 8px 0;
        }

        .score-description {
          color: var(--brand-text-secondary);
          margin: 0;
        }
      }
    }

    .summary-stats {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
      flex: 1;

      .stat-item {
        text-align: center;
        padding: 16px;
        background: var(--brand-bg-secondary);
        border-radius: var(--brand-radius-base);

        .stat-value {
          font-size: 20px;
          font-weight: 600;
          color: var(--brand-primary);
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 14px;
          color: var(--brand-text-secondary);
        }
      }
    }
  }
}

.result-details {
  margin-bottom: 24px;

  .card-header {
    font-size: 18px;
    font-weight: 600;
    color: var(--brand-text-primary);
  }

  .details-content {
    .answer-item {
      padding: 16px;
      border: 1px solid var(--brand-border-color);
      border-radius: var(--brand-radius-base);
      margin-bottom: 16px;

      &:last-child {
        margin-bottom: 0;
      }

      .answer-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;

        .answer-number {
          font-weight: 600;
          color: var(--brand-text-primary);
        }
      }

      .answer-content {
        .answer-question,
        .answer-user,
        .answer-correct {
          margin-bottom: 8px;
          font-size: 14px;
          line-height: 1.5;

          &:last-child {
            margin-bottom: 0;
          }

          strong {
            color: var(--brand-text-primary);
          }
        }

        .answer-correct {
          color: var(--brand-accent-green);
        }
      }
    }
  }
}

.result-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.loading-container {
  padding: 40px;
}

// 响应式设计
@media (max-width: 768px) {
  .practice-result {
    padding: 16px;
  }

  .summary-content {
    flex-direction: column;
    gap: 24px;
  }

  .score-display {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }

  .summary-stats {
    grid-template-columns: 1fr;
  }

  .result-actions {
    flex-direction: column;
  }
}
</style>