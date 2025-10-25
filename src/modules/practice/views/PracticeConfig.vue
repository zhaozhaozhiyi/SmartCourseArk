<template>
  <div class="practice-config">
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">练习配置</h1>
        <p class="page-description">配置您的练习参数，开始个性化练习</p>
      </div>
    </div>

    <div class="config-content">
      <el-card class="config-card">
        <template #header>
          <div class="card-header">
            <span>练习设置</span>
            <el-tag type="info" size="small">配置将保存为默认设置</el-tag>
          </div>
        </template>

        <el-form :model="configForm" :rules="rules" ref="configFormRef" label-width="120px">
          <el-form-item label="选择课程" prop="courseId">
            <el-select v-model="configForm.courseId" placeholder="请选择课程" @change="handleCourseChange">
              <el-option 
                v-for="course in courses" 
                :key="course.id" 
                :label="course.title" 
                :value="course.id" 
              />
            </el-select>
          </el-form-item>

          <el-form-item label="题目数量" prop="questionCount">
            <el-input-number 
              v-model="configForm.questionCount" 
              :min="5" 
              :max="50" 
              placeholder="题目数量"
            />
          </el-form-item>


          <el-form-item label="题目类型" prop="questionTypes">
            <el-checkbox-group v-model="configForm.questionTypes">
              <el-checkbox :label="QuestionType.SINGLE">单选题</el-checkbox>
              <el-checkbox :label="QuestionType.MULTIPLE">多选题</el-checkbox>
              <el-checkbox :label="QuestionType.JUDGE">判断题</el-checkbox>
              <el-checkbox :label="QuestionType.FILL">填空题</el-checkbox>
              <el-checkbox :label="QuestionType.ESSAY">简答题</el-checkbox>
            </el-checkbox-group>
          </el-form-item>

          <el-form-item label="时间限制">
            <el-input-number 
              v-model="configForm.timeLimit" 
              :min="5" 
              :max="120" 
              placeholder="时间限制(分钟)"
            />
            <span class="form-tip">留空表示无时间限制</span>
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="startPractice" :loading="loading">
              开始练习
            </el-button>
            <el-button @click="resetForm">重置</el-button>
            <el-button @click="viewHistory">
              <FontAwesomeIcon :icon="['fas', 'history']" class="mr-2" />
              查看历史
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- 练习统计 -->
      <el-card class="stats-card" v-if="practiceStats">
        <template #header>
          <div class="card-header">
            <span>练习统计</span>
          </div>
        </template>
        
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-value">{{ practiceStats.totalSessions }}</div>
            <div class="stat-label">总练习次数</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ practiceStats.averageScore }}%</div>
            <div class="stat-label">平均得分</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ practiceStats.totalQuestions }}</div>
            <div class="stat-label">总题目数</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ formatDuration(practiceStats.totalDuration) }}</div>
            <div class="stat-label">总练习时长</div>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElForm } from 'element-plus'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faHistory } from '@fortawesome/free-solid-svg-icons'
import { usePracticeStore } from '@/store/modules/practice'
import { useCourseStore } from '@/store/modules/course'
import { QuestionType } from '@/types/course'
import type { PracticeConfig } from '@/types/course'

// 添加图标到库
library.add(faHistory)

const router = useRouter()
const practiceStore = usePracticeStore()
const courseStore = useCourseStore()

const configFormRef = ref<InstanceType<typeof ElForm>>()
const loading = ref(false)
const courses = ref<any[]>([])
const practiceStats = ref<any>(null)

const configForm = ref<PracticeConfig>({
  mode: 'comprehensive',
  courseId: '',
  questionBankId: '',
  questionCount: 10,
  questionTypes: [QuestionType.SINGLE, QuestionType.MULTIPLE],
  timeLimit: undefined
})

const rules = {
  courseId: [{ required: true, message: '请选择课程', trigger: 'change' }],
  questionCount: [{ required: true, message: '请设置题目数量', trigger: 'blur' }],
  questionTypes: [{ required: true, message: '请选择至少一种题目类型', trigger: 'change' }]
}

onMounted(async () => {
  await fetchCourses()
  await fetchPracticeStats()
})

const fetchCourses = async () => {
  try {
    const response = await courseStore.fetchCourses()
    courses.value = response.courses
  } catch (error) {
    console.error('获取课程列表失败:', error)
    ElMessage.error('获取课程列表失败')
  }
}

const fetchPracticeStats = async () => {
  try {
    if (configForm.value.courseId) {
      practiceStats.value = await practiceStore.getPracticeStats(configForm.value.courseId)
    } else {
      practiceStats.value = await practiceStore.getPracticeStats()
    }
  } catch (error) {
    console.error('获取练习统计失败:', error)
  }
}

const handleCourseChange = async () => {
  if (configForm.value.courseId) {
    await fetchPracticeStats()
  }
}

const startPractice = async () => {
  if (!configFormRef.value) return

  try {
    const valid = await configFormRef.value.validate()
    if (!valid) return

    loading.value = true
    
    // 保存配置到本地存储，作为默认配置
    const configToSave = {
      questionCount: configForm.value.questionCount,
      questionTypes: configForm.value.questionTypes
    }
    localStorage.setItem('practice-default-config', JSON.stringify(configToSave))
    
    // 创建练习会话
    const session = await practiceStore.createPracticeSession(configForm.value)
    
    ElMessage.success('练习会话创建成功')
    
    // 跳转到练习页面
    router.push(`/practice/${configForm.value.courseId}/session/${session.id}`)
  } catch (error: any) {
    console.error('开始练习失败:', error)
    ElMessage.error(error.message || '开始练习失败')
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  configFormRef.value?.resetFields()
  configForm.value = {
    mode: 'comprehensive',
    courseId: '',
    questionBankId: '',
    questionCount: 10,
    questionTypes: [QuestionType.SINGLE, QuestionType.MULTIPLE],
    timeLimit: undefined
  }
}

const viewHistory = () => {
  router.push('/practice/history')
}

const formatDuration = (seconds: number): string => {
  if (seconds < 60) return `${seconds}秒`
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return remainingSeconds > 0 ? `${minutes}分${remainingSeconds}秒` : `${minutes}分钟`
}
</script>

<style lang="scss" scoped>
.practice-config {
  padding: 24px;
  max-width: 800px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--brand-border-color);

  .header-content {
    .page-title {
      font-size: 28px;
      font-weight: 600;
      color: var(--brand-text-primary);
      margin: 0 0 8px 0;
    }

    .page-description {
      color: var(--brand-text-secondary);
      margin: 0;
    }
  }
}

.config-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.config-card {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 18px;
    font-weight: 600;
    color: var(--brand-text-primary);
  }
}

.stats-card {
  .card-header {
    font-size: 18px;
    font-weight: 600;
    color: var(--brand-text-primary);
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 20px;

    .stat-item {
      text-align: center;
      padding: 20px;
      background: var(--brand-bg-secondary);
      border-radius: var(--brand-radius-base);

      .stat-value {
        font-size: 24px;
        font-weight: 600;
        color: var(--brand-primary);
        margin-bottom: 8px;
      }

      .stat-label {
        font-size: 14px;
        color: var(--brand-text-secondary);
      }
    }
  }
}

.form-tip {
  margin-left: 8px;
  font-size: 12px;
  color: var(--brand-text-tertiary);
}

// 响应式设计
@media (max-width: 768px) {
  .practice-config {
    padding: 16px;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>