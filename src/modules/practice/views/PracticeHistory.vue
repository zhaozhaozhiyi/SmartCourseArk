<template>
  <div class="practice-history">
    <div class="page-header">
      <h1>练习历史</h1>
      <p>查看您的练习记录和成绩</p>
    </div>

    <!-- 筛选和搜索 -->
    <el-card class="filter-card">
      <el-form :model="filterForm" inline>
        <el-form-item label="课程">
          <el-select 
            v-model="filterForm.courseId" 
            placeholder="选择课程" 
            clearable
            @change="handleFilterChange"
          >
            <el-option
              v-for="course in courses"
              :key="course.id"
              :label="course.title"
              :value="course.id"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="状态">
          <el-select 
            v-model="filterForm.status" 
            placeholder="选择状态" 
            clearable
            @change="handleFilterChange"
          >
            <el-option label="全部" value="" />
            <el-option label="已完成" value="completed" />
            <el-option label="进行中" value="in_progress" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="关键词">
          <el-input
            v-model="filterForm.keyword"
            placeholder="搜索练习记录"
            clearable
            @input="handleSearch"
          >
            <template #prefix>
              <FontAwesomeIcon :icon="['fas', 'search']" />
            </template>
          </el-input>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleFilterChange">
            <FontAwesomeIcon :icon="['fas', 'filter']" class="mr-2" />
            筛选
          </el-button>
          <el-button @click="resetFilter">
            <FontAwesomeIcon :icon="['fas', 'refresh']" class="mr-2" />
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 练习历史列表 -->
    <el-card class="history-list-card">
      <template #header>
        <div class="card-header">
          <span>练习记录</span>
          <div class="header-actions">
            <el-button @click="refreshData">
              <FontAwesomeIcon :icon="['fas', 'sync-alt']" class="mr-2" />
              刷新
            </el-button>
          </div>
        </div>
      </template>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="5" animated />
      </div>

      <!-- 空状态 -->
      <div v-else-if="practiceSessions.length === 0" class="empty-state">
        <div class="empty-icon">
          <FontAwesomeIcon :icon="['fas', 'history']" />
        </div>
        <h3>暂无练习记录</h3>
        <p>您还没有任何练习记录，快去开始练习吧！</p>
        <el-button type="primary" @click="goToPractice">
          <FontAwesomeIcon :icon="['fas', 'play']" class="mr-2" />
          开始练习
        </el-button>
      </div>

      <!-- 练习记录列表 -->
      <div v-else class="history-list">
        <div 
          v-for="session in practiceSessions" 
          :key="session.id" 
          class="history-item"
        >
          <div class="item-header">
            <div class="course-info">
              <h3 class="course-title">{{ getCourseTitle(session.courseId) }}</h3>
              <p class="session-id">练习ID: {{ session.id }}</p>
            </div>
            <div class="status-info">
              <el-tag :type="getStatusType(session.status)">
                {{ getStatusText(session.status) }}
              </el-tag>
              <span class="create-time">{{ formatDate(session.createdAt) }}</span>
            </div>
          </div>

          <div class="item-content">
            <div class="stats-grid">
              <div class="stat-item">
                <div class="stat-value">{{ session.totalQuestions }}</div>
                <div class="stat-label">总题数</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ session.answeredQuestions }}</div>
                <div class="stat-label">已答题</div>
              </div>
              <div class="stat-item" v-if="session.status === 'completed'">
                <div class="stat-value">{{ session.correctQuestions }}</div>
                <div class="stat-label">正确数</div>
              </div>
              <div class="stat-item" v-if="session.status === 'completed'">
                <div class="stat-value">{{ session.score || 0 }}分</div>
                <div class="stat-label">得分</div>
              </div>
              <div class="stat-item" v-if="session.duration">
                <div class="stat-value">{{ formatDuration(session.duration) }}</div>
                <div class="stat-label">用时</div>
              </div>
            </div>

            <div class="progress-info" v-if="session.status === 'in_progress'">
              <div class="progress-bar">
                <div 
                  class="progress-fill" 
                  :style="{ width: `${(session.answeredQuestions / session.totalQuestions) * 100}%` }"
                ></div>
              </div>
              <span class="progress-text">
                进度: {{ session.answeredQuestions }}/{{ session.totalQuestions }}
              </span>
            </div>
          </div>

          <div class="item-actions">
            <el-button 
              v-if="session.status === 'in_progress'"
              type="primary" 
              @click="continuePractice(session)"
            >
              <FontAwesomeIcon :icon="['fas', 'play']" class="mr-2" />
              继续练习
            </el-button>
            <el-button 
              v-if="session.status === 'completed'"
              type="success" 
              @click="viewResult(session)"
            >
              <FontAwesomeIcon :icon="['fas', 'chart-line']" class="mr-2" />
              查看结果
            </el-button>
            <el-button @click="deleteSession(session)">
              <FontAwesomeIcon :icon="['fas', 'trash']" class="mr-2" />
              删除
            </el-button>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div class="pagination-container" v-if="pagination.total > 0">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { 
  faSearch, 
  faFilter, 
  faRefresh, 
  faSyncAlt, 
  faHistory, 
  faPlay, 
  faChartLine, 
  faTrash 
} from '@fortawesome/free-solid-svg-icons'
import { usePracticeStore } from '@/store/modules/practice'
import { useCourseStore } from '@/store/modules/course'
import type { PracticeSession } from '@/types/course'

// 添加图标到库
library.add(faSearch, faFilter, faRefresh, faSyncAlt, faHistory, faPlay, faChartLine, faTrash)

const router = useRouter()
const practiceStore = usePracticeStore()
const courseStore = useCourseStore()

const loading = ref(false)
const practiceSessions = ref<PracticeSession[]>([])
const courses = ref<any[]>([])

const filterForm = reactive({
  courseId: '',
  status: '',
  keyword: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

onMounted(async () => {
  await fetchCourses()
  await loadPracticeSessions()
})

const fetchCourses = async () => {
  try {
    const response = await courseStore.fetchCourses()
    courses.value = response.courses
  } catch (error) {
    console.error('获取课程列表失败:', error)
  }
}

const loadPracticeSessions = async () => {
  try {
    loading.value = true
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      courseId: filterForm.courseId || undefined,
      status: filterForm.status || undefined,
      keyword: filterForm.keyword || undefined
    }
    
    const response = await practiceStore.fetchPracticeSessions(params)
    practiceSessions.value = response.sessions
    pagination.total = response.total
  } catch (error) {
    console.error('加载练习记录失败:', error)
    ElMessage.error('加载练习记录失败')
  } finally {
    loading.value = false
  }
}

const handleFilterChange = () => {
  pagination.page = 1
  loadPracticeSessions()
}

const handleSearch = () => {
  // 防抖搜索
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    pagination.page = 1
    loadPracticeSessions()
  }, 500)
}

let searchTimer: NodeJS.Timeout

const resetFilter = () => {
  filterForm.courseId = ''
  filterForm.status = ''
  filterForm.keyword = ''
  pagination.page = 1
  loadPracticeSessions()
}

const refreshData = () => {
  loadPracticeSessions()
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.page = 1
  loadPracticeSessions()
}

const handlePageChange = (page: number) => {
  pagination.page = page
  loadPracticeSessions()
}

const getCourseTitle = (courseId: string): string => {
  const course = courses.value.find(c => c.id === courseId)
  return course?.title || '未知课程'
}

const getStatusType = (status: string): string => {
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
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatDuration = (seconds: number): string => {
  if (seconds < 60) return `${seconds}秒`
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return remainingSeconds > 0 ? `${minutes}分${remainingSeconds}秒` : `${minutes}分钟`
}

const continuePractice = (session: PracticeSession) => {
  router.push(`/practice/${session.courseId}/session/${session.id}`)
}

const viewResult = (session: PracticeSession) => {
  router.push(`/practice/${session.courseId}/result/${session.id}`)
}

const deleteSession = async (session: PracticeSession) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除练习记录"${session.id}"吗？此操作不可恢复。`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await practiceStore.deletePracticeSession(session.id)
    ElMessage.success('删除成功')
    await loadPracticeSessions()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除练习记录失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

const goToPractice = () => {
  router.push('/practice')
}
</script>

<style lang="scss" scoped>
.practice-history {
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

.filter-card {
  margin-bottom: 24px;
  
  .el-form {
    margin-bottom: 0;
  }
}

.history-list-card {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 18px;
    font-weight: 600;
    color: var(--brand-text-primary);
  }
}

.loading-container {
  padding: 40px;
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
}

.history-list {
  .history-item {
    border: 1px solid var(--brand-border-color);
    border-radius: var(--brand-radius-base);
    padding: 20px;
    margin-bottom: 16px;
    background: var(--brand-bg-secondary);
    transition: all 0.3s ease;

    &:last-child {
      margin-bottom: 0;
    }

    &:hover {
      border-color: var(--brand-primary);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .item-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 16px;

      .course-info {
        .course-title {
          font-size: 18px;
          font-weight: 600;
          color: var(--brand-text-primary);
          margin: 0 0 4px 0;
        }

        .session-id {
          font-size: 14px;
          color: var(--brand-text-secondary);
          margin: 0;
        }
      }

      .status-info {
        text-align: right;

        .create-time {
          display: block;
          font-size: 12px;
          color: var(--brand-text-tertiary);
          margin-top: 8px;
        }
      }
    }

    .item-content {
      margin-bottom: 16px;

      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
        gap: 16px;
        margin-bottom: 16px;

        .stat-item {
          text-align: center;
          padding: 12px;
          background: var(--brand-bg-default);
          border-radius: var(--brand-radius-sm);

          .stat-value {
            font-size: 20px;
            font-weight: 600;
            color: var(--brand-primary);
            margin-bottom: 4px;
          }

          .stat-label {
            font-size: 12px;
            color: var(--brand-text-secondary);
          }
        }
      }

      .progress-info {
        display: flex;
        align-items: center;
        gap: 12px;

        .progress-bar {
          flex: 1;
          height: 8px;
          background: var(--brand-bg-tertiary);
          border-radius: 4px;
          overflow: hidden;

          .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, var(--brand-primary), var(--brand-accent-blue));
            transition: width 0.3s ease;
          }
        }

        .progress-text {
          font-size: 14px;
          color: var(--brand-text-secondary);
          white-space: nowrap;
        }
      }
    }

    .item-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
    }
  }
}

.pagination-container {
  margin-top: 24px;
  display: flex;
  justify-content: center;
}

// 响应式设计
@media (max-width: 768px) {
  .practice-history {
    padding: 16px;
  }

  .page-header h1 {
    font-size: 24px;
  }

  .history-item {
    .item-header {
      flex-direction: column;
      gap: 12px;

      .status-info {
        text-align: left;
      }
    }

    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .item-actions {
      flex-direction: column;
    }
  }
}
</style>
