<template>
  <div class="practice-list">
    <div class="page-header">
      <h1>练习系统</h1>
      <p>通过练习巩固知识点，提升学习效果</p>
    </div>

    <div class="practice-content">
      <!-- 快速操作 -->
      <div class="quick-actions">
        <el-card class="action-card">
          <div class="action-content">
            <div class="action-icon">
              <FontAwesomeIcon :icon="['fas', 'play']" />
            </div>
            <div class="action-info">
              <h3>开始练习</h3>
              <p>使用默认配置快速开始练习</p>
              <div class="quick-config">
                <el-tag size="small" type="info">{{ defaultConfig.questionCount }}题</el-tag>
                <el-tag size="small" type="info">{{ getQuestionTypesText(defaultConfig.questionTypes) }}</el-tag>
              </div>
            </div>
            <div class="action-buttons">
              <el-button type="primary" @click="navigateTo('/practice/config')">
                开始练习
              </el-button>
            </div>
          </div>
        </el-card>

        <el-card class="action-card">
          <div class="action-content">
            <div class="action-icon">
              <FontAwesomeIcon :icon="['fas', 'history']" />
            </div>
            <div class="action-info">
              <h3>练习历史</h3>
              <p>查看您的练习记录和成绩</p>
            </div>
            <el-button @click="navigateTo('/practice/history')">
              查看历史
            </el-button>
          </div>
        </el-card>
      </div>

      <!-- 最近练习 -->
      <el-card class="recent-practice" v-if="recentSessions.length > 0">
        <template #header>
          <div class="card-header">
            <span>最近练习</span>
            <el-button type="text" @click="navigateTo('/practice/history')">
              查看全部
              <FontAwesomeIcon :icon="['fas', 'arrow-right']" class="ml-2" />
            </el-button>
          </div>
        </template>

        <div class="recent-list">
          <div 
            v-for="session in recentSessions" 
            :key="session.id" 
            class="recent-item"
          >
            <div class="item-info">
              <h4 class="course-title">{{ getCourseTitle(session.courseId) }}</h4>
              <p class="session-meta">
                {{ formatDate(session.createdAt) }} · 
                <el-tag :type="getStatusType(session.status)" size="small">
                  {{ getStatusText(session.status) }}
                </el-tag>
              </p>
            </div>
            <div class="item-stats" v-if="session.status === 'completed'">
              <div class="score">{{ session.score || 0 }}分</div>
              <div class="questions">{{ session.totalQuestions }}题</div>
            </div>
            <div class="item-actions">
              <el-button 
                v-if="session.status === 'in_progress'"
                type="primary" 
                size="small"
                @click="continuePractice(session)"
              >
                继续
              </el-button>
              <el-button 
                v-else
                size="small"
                @click="viewResult(session)"
              >
                查看
              </el-button>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 空状态 -->
      <el-card v-else>
        <div class="empty-state">
          <div class="empty-icon">
            <FontAwesomeIcon :icon="['fas', 'trophy']" />
          </div>
          <h3>开始您的练习之旅</h3>
          <p>通过练习巩固知识点，提升学习效果</p>
          <div class="empty-actions">
            <el-button type="primary" @click="navigateTo('/practice/config')">
              <FontAwesomeIcon :icon="['fas', 'play']" class="mr-2" />
              开始练习
            </el-button>
            <el-button @click="navigateTo('/courses/create')">
              <FontAwesomeIcon :icon="['fas', 'plus']" class="mr-2" />
              创建课程
            </el-button>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { 
  faTrophy, 
  faPlay, 
  faHistory, 
  faArrowRight, 
  faPlus,
  faCog
} from '@fortawesome/free-solid-svg-icons'
import { usePracticeStore } from '@/store/modules/practice'
import { useCourseStore } from '@/store/modules/course'
import type { PracticeSession } from '@/types/course'

library.add(faTrophy, faPlay, faHistory, faArrowRight, faPlus, faCog)

const router = useRouter()
const practiceStore = usePracticeStore()
const courseStore = useCourseStore()

const recentSessions = ref<PracticeSession[]>([])

// 默认练习配置
const defaultConfig = ref({
  questionCount: 10,
  questionTypes: [1, 2] // [QuestionType.SINGLE, QuestionType.MULTIPLE]
})

onMounted(async () => {
  await loadRecentSessions()
  await loadDefaultConfig()
})

const loadRecentSessions = async () => {
  try {
    const response = await practiceStore.fetchPracticeSessions({
      page: 1,
      pageSize: 5
    })
    recentSessions.value = response.sessions
  } catch (error) {
    console.error('加载最近练习失败:', error)
  }
}

const loadDefaultConfig = async () => {
  try {
    // 从本地存储加载用户偏好设置
    const savedConfig = localStorage.getItem('practice-default-config')
    if (savedConfig) {
      const config = JSON.parse(savedConfig)
      defaultConfig.value = { ...defaultConfig.value, ...config }
    }
  } catch (error) {
    console.error('加载默认配置失败:', error)
  }
}


const getQuestionTypesText = (types: number[]): string => {
  const typeMap: Record<number, string> = {
    1: '单选',
    2: '多选',
    3: '判断',
    4: '填空',
    5: '简答'
  }
  return types.map(type => typeMap[type] || '').filter(Boolean).join('、')
}

const navigateTo = (path: string) => {
  router.push(path)
}


const getCourseTitle = (courseId: string): string => {
  const course = courseStore.courses.find(c => c.id === courseId)
  return course?.title || '未知课程'
}

const getStatusType = (status: string): 'success' | 'warning' | 'info' => {
  switch (status) {
    case 'completed':
      return 'success'
    case 'in_progress':
      return 'warning'
    default:
      return 'info'
  }
}

const getStatusText = (status: string): string => {
  switch (status) {
    case 'completed':
      return '已完成'
    case 'in_progress':
      return '进行中'
    default:
      return '未知'
  }
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const continuePractice = (session: PracticeSession) => {
  router.push(`/practice/${session.courseId}/session/${session.id}`)
}

const viewResult = (session: PracticeSession) => {
  router.push(`/practice/${session.courseId}/result/${session.id}`)
}
</script>

<style lang="scss" scoped>
.practice-list {
  padding: 24px;
  background: var(--brand-bg-default);
  min-height: 100vh;
}

.page-header {
  margin-bottom: 32px;
  
  h1 {
    font-size: 32px;
    font-weight: 700;
    color: var(--brand-text-primary);
    margin: 0 0 8px 0;
  }
  
  p {
    font-size: 16px;
    color: var(--brand-text-secondary);
    margin: 0;
  }
}

.practice-content {
  .quick-actions {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
    margin-bottom: 24px;

    .action-card {
      .action-content {
        display: flex;
        align-items: center;
        gap: 16px;

        .action-icon {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--brand-primary), var(--brand-accent-blue));
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          color: white;
        }

        .action-info {
          flex: 1;

          h3 {
            font-size: 18px;
            font-weight: 600;
            color: var(--brand-text-primary);
            margin: 0 0 4px 0;
          }

          p {
            font-size: 14px;
            color: var(--brand-text-secondary);
            margin: 0 0 8px 0;
          }

          .quick-config {
            display: flex;
            gap: 6px;
            flex-wrap: wrap;
          }
        }

        .action-buttons {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
      }
    }
  }

  .recent-practice {
    margin-bottom: 24px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 18px;
      font-weight: 600;
      color: var(--brand-text-primary);
    }

    .recent-list {
      .recent-item {
        display: flex;
        align-items: center;
        padding: 16px;
        border: 1px solid var(--brand-border-color);
        border-radius: var(--brand-radius-base);
        margin-bottom: 12px;
        background: var(--brand-bg-secondary);
        transition: all 0.3s ease;

        &:last-child {
          margin-bottom: 0;
        }

        &:hover {
          border-color: var(--brand-primary);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .item-info {
          flex: 1;

          .course-title {
            font-size: 16px;
            font-weight: 600;
            color: var(--brand-text-primary);
            margin: 0 0 4px 0;
          }

          .session-meta {
            font-size: 14px;
            color: var(--brand-text-secondary);
            margin: 0;
            display: flex;
            align-items: center;
            gap: 8px;
          }
        }

        .item-stats {
          display: flex;
          gap: 16px;
          margin-right: 16px;

          .score {
            font-size: 18px;
            font-weight: 600;
            color: var(--brand-accent-green);
          }

          .questions {
            font-size: 14px;
            color: var(--brand-text-secondary);
            display: flex;
            align-items: center;
          }
        }

        .item-actions {
          display: flex;
          gap: 8px;
        }
      }
    }
  }

  .empty-state {
    text-align: center;
    padding: 80px 20px;
    
    .empty-icon {
      font-size: 80px;
      color: var(--brand-text-tertiary);
      margin-bottom: 24px;
    }
    
    h3 {
      font-size: 24px;
      font-weight: 600;
      color: var(--brand-text-primary);
      margin: 0 0 12px 0;
    }
    
    p {
      font-size: 16px;
      color: var(--brand-text-secondary);
      margin: 0 0 32px 0;
      line-height: 1.5;
    }

    .empty-actions {
      display: flex;
      gap: 12px;
      justify-content: center;
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .practice-list {
    padding: 16px;
  }

  .page-header h1 {
    font-size: 24px;
  }

  .quick-actions {
    grid-template-columns: 1fr;
  }

  .recent-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;

    .item-stats {
      margin-right: 0;
    }

    .item-actions {
      width: 100%;
      justify-content: flex-end;
    }
  }

  .empty-actions {
    flex-direction: column;
  }
}
</style>