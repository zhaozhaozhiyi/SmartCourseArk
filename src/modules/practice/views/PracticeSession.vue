<template>
  <div class="practice-session">
    <div class="session-header">
      <div class="header-left">
        <h1 class="session-title">练习进行中</h1>
        <p class="session-subtitle">{{ courseTitle }}</p>
      </div>
      <div class="header-right">
        <div class="session-info">
          <div class="info-item">
            <span class="info-label">题目进度:</span>
            <span class="info-value">{{ currentQuestionIndex + 1 }} / {{ session?.totalQuestions }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">用时:</span>
            <span class="info-value">{{ formatDuration(elapsedTime) }}</span>
          </div>
          <div class="info-item" v-if="session?.timeLimit">
            <span class="info-label">剩余时间:</span>
            <span class="info-value" :class="{ 'time-warning': remainingTime < 300 }">
              {{ formatDuration(remainingTime) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="session-content" v-if="currentQuestion">
      <div class="question-card">
        <div class="question-header">
          <div class="question-number">
            题目 {{ currentQuestionIndex + 1 }}
          </div>
          <div class="question-meta">
            <el-tag :type="getDifficultyType(currentQuestion.difficulty) as any">
              {{ getDifficultyText(currentQuestion.difficulty) }}
            </el-tag>
            <el-tag type="info">{{ getQuestionTypeText(currentQuestion.type) }}</el-tag>
          </div>
        </div>

        <div class="question-content">
          <div class="question-text" v-html="currentQuestion.content"></div>
          
          <!-- 单选题 -->
          <div v-if="currentQuestion.type === QuestionType.SINGLE" class="question-options">
            <el-radio-group v-model="singleAnswer">
              <el-radio 
                v-for="(option, index) in currentQuestion.options" 
                :key="index" 
                :label="option"
                class="option-item"
              >
                {{ option }}
              </el-radio>
            </el-radio-group>
          </div>

          <!-- 多选题 -->
          <div v-if="currentQuestion.type === QuestionType.MULTIPLE" class="question-options">
            <el-checkbox-group v-model="multipleAnswer">
              <el-checkbox 
                v-for="(option, index) in currentQuestion.options" 
                :key="index" 
                :label="option"
                class="option-item"
              >
                {{ option }}
              </el-checkbox>
            </el-checkbox-group>
          </div>

          <!-- 判断题 -->
          <div v-if="currentQuestion.type === QuestionType.JUDGE" class="question-options">
            <el-radio-group v-model="judgeAnswer">
              <el-radio label="正确" class="option-item">正确</el-radio>
              <el-radio label="错误" class="option-item">错误</el-radio>
            </el-radio-group>
          </div>

          <!-- 填空题 -->
          <div v-if="currentQuestion.type === QuestionType.FILL" class="question-input">
            <el-input
              v-model="fillAnswer"
              placeholder="请输入答案"
              clearable
            />
          </div>

          <!-- 简答题 -->
          <div v-if="currentQuestion.type === QuestionType.ESSAY" class="question-input">
            <el-input
              v-model="essayAnswer"
              type="textarea"
              :rows="4"
              placeholder="请输入您的答案"
            />
          </div>
        </div>

        <div class="question-actions">
          <el-button 
            type="primary" 
            @click="submitAnswer"
            :disabled="!getCurrentAnswer() || (Array.isArray(getCurrentAnswer()) && getCurrentAnswer().length === 0)"
            :loading="submitting"
          >
            提交答案
          </el-button>
          <el-button @click="skipQuestion" :disabled="submitting">
            跳过此题
          </el-button>
        </div>
      </div>
    </div>

    <!-- 练习完成 -->
    <div class="session-complete" v-if="isComplete">
      <div class="complete-card">
        <div class="complete-icon">
          <FontAwesomeIcon :icon="['fas', 'trophy']" />
        </div>
        <h2 class="complete-title">练习完成！</h2>
        <p class="complete-subtitle">恭喜您完成了本次练习</p>
        
        <div class="complete-stats">
          <div class="stat-item">
            <div class="stat-value">{{ session?.totalQuestions }}</div>
            <div class="stat-label">总题数</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ session?.correctQuestions }}</div>
            <div class="stat-label">正确数</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ session?.score }}%</div>
            <div class="stat-label">得分</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ formatDuration(elapsedTime) }}</div>
            <div class="stat-label">用时</div>
          </div>
        </div>

        <div class="complete-actions">
          <el-button type="primary" @click="viewResults">
            查看详细结果
          </el-button>
          <el-button @click="startNewPractice">
            开始新练习
          </el-button>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div class="loading-container" v-if="loading">
      <el-skeleton :rows="5" animated />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faTrophy } from '@fortawesome/free-solid-svg-icons'
import { usePracticeStore } from '@/store/modules/practice'
import { useCourseStore } from '@/store/modules/course'
import type { Question } from '@/types/course'
import { QuestionType, QuestionDifficulty } from '@/types/course'

// 添加图标到库
library.add(faTrophy)

const route = useRoute()
const router = useRouter()
const practiceStore = usePracticeStore()
const courseStore = useCourseStore()

const loading = ref(false)
const submitting = ref(false)
const session = ref<any>(null)
const questions = ref<Question[]>([])
const currentQuestionIndex = ref(0)
const singleAnswer = ref<string>('')
const multipleAnswer = ref<string[]>([])
const judgeAnswer = ref<string>('')
const fillAnswer = ref<string>('')
const essayAnswer = ref<string>('')
const elapsedTime = ref(0)
const startTime = ref(Date.now())
let timer: NodeJS.Timeout | null = null

const courseId = computed(() => route.params.courseId as string)
const sessionId = computed(() => route.params.sessionId as string)
const courseTitle = computed(() => {
  const course = courseStore.courses.find(c => c.id === courseId.value)
  return course?.title || '未知课程'
})

const currentQuestion = computed(() => {
  return questions.value[currentQuestionIndex.value] || null
})


const isComplete = computed(() => {
  return session.value?.status === 'completed' || currentQuestionIndex.value >= questions.value.length
})

const remainingTime = computed(() => {
  if (!session.value?.timeLimit) return 0
  const timeLimitSeconds = session.value.timeLimit * 60
  return Math.max(0, timeLimitSeconds - elapsedTime.value)
})

onMounted(async () => {
  await loadSession()
  startTimer()
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})

const loadSession = async () => {
  try {
    loading.value = true
    const sessionData = await practiceStore.fetchPracticeSession(sessionId.value)
    if (sessionData) {
      session.value = sessionData
      await loadQuestions()
    } else {
      ElMessage.error('练习会话不存在')
      router.push('/practice')
    }
  } catch (error) {
    console.error('加载练习会话失败:', error)
    ElMessage.error('加载练习会话失败')
    router.push('/practice')
  } finally {
    loading.value = false
  }
}

const loadQuestions = async () => {
  try {
    // 根据session的配置加载题目
    const { useQuestionStore } = await import('@/store/modules/question')
    const questionStore = useQuestionStore()
    
    // 获取随机题目
    const randomQuestions = await questionStore.getRandomQuestions(
      session.value.courseId,
      session.value.totalQuestions,
      {
        types: session.value.questionTypes
      }
    )
    
    questions.value = randomQuestions
    
    // 如果获取的题目数量不足，显示警告
    if (randomQuestions.length < session.value.totalQuestions) {
      ElMessage.warning(`题库中符合条件的题目不足，只获取到 ${randomQuestions.length} 道题目`)
    }
  } catch (error) {
    console.error('加载题目失败:', error)
    ElMessage.error('加载题目失败')
  }
}

const startTimer = () => {
  timer = setInterval(() => {
    elapsedTime.value = Math.floor((Date.now() - startTime.value) / 1000)
    
    // 检查时间限制
    if (session.value?.timeLimit && remainingTime.value <= 0) {
      autoSubmit()
    }
  }, 1000)
}

const submitAnswer = async () => {
  const answer = getCurrentAnswer()
  if (!answer || (Array.isArray(answer) && answer.length === 0)) {
    ElMessage.warning('请先选择或输入答案')
    return
  }

  try {
    submitting.value = true
    
    await practiceStore.submitAnswer(sessionId.value, currentQuestion.value.id, answer)
    
    // 移动到下一题
    currentQuestionIndex.value++
    
    if (currentQuestionIndex.value >= questions.value.length) {
      // 练习完成
      await completePractice()
    } else {
      // 重置答案
      resetAnswers()
    }
    
  } catch (error) {
    console.error('提交答案失败:', error)
    ElMessage.error('提交答案失败')
  } finally {
    submitting.value = false
  }
}

const skipQuestion = () => {
  currentQuestionIndex.value++
  resetAnswers()
  
  if (currentQuestionIndex.value >= questions.value.length) {
    completePractice()
  }
}

const getCurrentAnswer = (): string | string[] => {
  if (!currentQuestion.value) return ''
  switch (currentQuestion.value.type) {
    case QuestionType.SINGLE:
      return singleAnswer.value
    case QuestionType.MULTIPLE:
      return multipleAnswer.value
    case QuestionType.JUDGE:
      return judgeAnswer.value
    case QuestionType.FILL:
      return fillAnswer.value
    case QuestionType.ESSAY:
      return essayAnswer.value
    default:
      return ''
  }
}

const resetAnswers = () => {
  singleAnswer.value = ''
  multipleAnswer.value = []
  judgeAnswer.value = ''
  fillAnswer.value = ''
  essayAnswer.value = ''
}

const completePractice = async () => {
  try {
    const result = await practiceStore.completePracticeSession(sessionId.value)
    session.value = { ...session.value, ...result, status: 'completed' }
    
    if (timer) {
      clearInterval(timer)
    }
    
    ElMessage.success('练习完成！')
  } catch (error) {
    console.error('完成练习失败:', error)
    ElMessage.error('完成练习失败')
  }
}

const autoSubmit = async () => {
  try {
    await ElMessageBox.confirm('时间已到，练习将自动结束', '时间到', {
      confirmButtonText: '确定',
      showCancelButton: false,
      type: 'warning'
    })
    
    await completePractice()
  } catch (error) {
    // 用户点击确定，继续完成练习
    await completePractice()
  }
}

const viewResults = () => {
  router.push(`/practice/${courseId.value}/result/${sessionId.value}`)
}

const startNewPractice = () => {
  router.push('/practice')
}

const getDifficultyType = (difficulty: QuestionDifficulty): string => {
  switch (difficulty) {
    case QuestionDifficulty.EASY: return 'success'
    case QuestionDifficulty.MEDIUM: return 'warning'
    case QuestionDifficulty.HARD: return 'danger'
    default: return 'info'
  }
}

const getDifficultyText = (difficulty: QuestionDifficulty): string => {
  switch (difficulty) {
    case QuestionDifficulty.EASY: return '简单'
    case QuestionDifficulty.MEDIUM: return '中等'
    case QuestionDifficulty.HARD: return '困难'
    default: return '未知'
  }
}

const getQuestionTypeText = (type: QuestionType): string => {
  switch (type) {
    case QuestionType.SINGLE: return '单选题'
    case QuestionType.MULTIPLE: return '多选题'
    case QuestionType.JUDGE: return '判断题'
    case QuestionType.FILL: return '填空题'
    case QuestionType.ESSAY: return '简答题'
    default: return '未知类型'
  }
}

const formatDuration = (seconds: number): string => {
  if (seconds < 60) return `${seconds}秒`
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return remainingSeconds > 0 ? `${minutes}分${remainingSeconds}秒` : `${minutes}分钟`
}
</script>

<style lang="scss" scoped>
.practice-session {
  padding: 24px;
  max-width: 800px;
  margin: 0 auto;
}

.session-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--brand-border-color);

  .header-left {
    .session-title {
      font-size: 24px;
      font-weight: 600;
      color: var(--brand-text-primary);
      margin: 0 0 8px 0;
    }

    .session-subtitle {
      color: var(--brand-text-secondary);
      margin: 0;
    }
  }

  .header-right {
    .session-info {
      display: flex;
      flex-direction: column;
      gap: 8px;

      .info-item {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;

        .info-label {
          color: var(--brand-text-secondary);
        }

        .info-value {
          color: var(--brand-text-primary);
          font-weight: 500;

          &.time-warning {
            color: var(--brand-accent-red);
          }
        }
      }
    }
  }
}

.question-card {
  background: var(--brand-bg-card);
  border: 1px solid var(--brand-border-color);
  border-radius: var(--brand-radius-lg);
  padding: 24px;
  margin-bottom: 24px;

  .question-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    .question-number {
      font-size: 18px;
      font-weight: 600;
      color: var(--brand-primary);
    }

    .question-meta {
      display: flex;
      gap: 8px;
    }
  }

  .question-content {
    margin-bottom: 24px;

    .question-text {
      font-size: 16px;
      line-height: 1.6;
      color: var(--brand-text-primary);
      margin-bottom: 20px;
    }

    .question-options {
      .option-item {
        display: block;
        margin-bottom: 12px;
        padding: 12px;
        border: 1px solid var(--brand-border-color);
        border-radius: var(--brand-radius-base);
        transition: all 0.3s ease;

        &:hover {
          border-color: var(--brand-primary);
          background: var(--brand-primary-bg);
        }
      }
    }

    .question-input {
      margin-top: 16px;
    }
  }

  .question-actions {
    display: flex;
    gap: 12px;
  }
}

.session-complete {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;

  .complete-card {
    text-align: center;
    background: var(--brand-bg-card);
    border: 1px solid var(--brand-border-color);
    border-radius: var(--brand-radius-lg);
    padding: 40px;
    max-width: 500px;

    .complete-icon {
      font-size: 64px;
      color: var(--brand-accent-yellow);
      margin-bottom: 20px;
    }

    .complete-title {
      font-size: 24px;
      font-weight: 600;
      color: var(--brand-text-primary);
      margin: 0 0 8px 0;
    }

    .complete-subtitle {
      color: var(--brand-text-secondary);
      margin: 0 0 32px 0;
    }

    .complete-stats {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
      margin-bottom: 32px;

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

    .complete-actions {
      display: flex;
      gap: 12px;
      justify-content: center;
    }
  }
}

.loading-container {
  padding: 40px;
}

// 响应式设计
@media (max-width: 768px) {
  .practice-session {
    padding: 16px;
  }

  .session-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .complete-stats {
    grid-template-columns: 1fr;
  }

  .complete-actions {
    flex-direction: column;
  }
}
</style>