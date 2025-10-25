<template>
  <div class="course-list">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">课程管理</h1>
        <p class="page-description">管理您的所有课程，创建新的学习内容</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" @click="goToCreate">
          <FontAwesomeIcon :icon="['fas', 'plus']" class="mr-2" />
          创建课程
        </el-button>
      </div>
    </div>

    <!-- 搜索和筛选 -->
    <div class="search-section">
      <div class="search-bar">
        <el-input
          v-model="searchParams.keyword"
          placeholder="搜索课程标题或描述..."
          clearable
          @input="handleSearch"
        >
          <template #prefix>
            <FontAwesomeIcon :icon="['fas', 'search']" />
          </template>
        </el-input>
      </div>
      <div class="filter-bar">
        <el-select v-model="searchParams.level" placeholder="难度级别" clearable @change="handleSearch">
          <el-option label="初级" value="beginner" />
          <el-option label="中级" value="intermediate" />
          <el-option label="高级" value="advanced" />
        </el-select>
        <el-select v-model="searchParams.status" placeholder="课程状态" clearable @change="handleSearch">
          <el-option label="草稿" value="draft" />
          <el-option label="已发布" value="published" />
          <el-option label="已归档" value="archived" />
        </el-select>
      </div>
    </div>

    <!-- 课程列表 -->
    <div class="course-grid" v-loading="loading">
      <div v-if="courses.length === 0 && !loading" class="empty-state">
        <div class="empty-icon">
          <FontAwesomeIcon :icon="['fas', 'book-open']" />
        </div>
        <h3>暂无课程</h3>
        <p>开始创建您的第一个课程吧！</p>
        <el-button type="primary" @click="goToCreate">
          <FontAwesomeIcon :icon="['fas', 'plus']" class="mr-2" />
          创建课程
        </el-button>
      </div>
      
      <div v-for="course in courses" :key="course.id" class="course-card" @click="goToDetail(course.id)">
        <div class="course-header">
          <div class="course-status">
            <el-tag :type="getStatusType(course.status) as any">
              {{ getStatusText(course.status) }}
            </el-tag>
            <el-tag :type="getLevelType(course.level) as any" size="small">
              {{ getLevelText(course.level) }}
            </el-tag>
          </div>
          <div class="course-actions">
            <el-dropdown trigger="click" @click.stop>
              <el-button type="text" size="small">
                <FontAwesomeIcon :icon="['fas', 'ellipsis-v']" />
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="goToDetail(course.id)">
                    <FontAwesomeIcon :icon="['fas', 'eye']" class="mr-2" />
                    查看详情
                  </el-dropdown-item>
                  <el-dropdown-item @click="openEditDialog(course)">
                    <FontAwesomeIcon :icon="['fas', 'edit']" class="mr-2" />
                    编辑课程
                  </el-dropdown-item>
                  <el-dropdown-item @click="goToLearn(course.id)">
                    <FontAwesomeIcon :icon="['fas', 'play']" class="mr-2" />
                    开始学习
                  </el-dropdown-item>
                  <el-dropdown-item @click="goToQuestions(course.id)">
                    <FontAwesomeIcon :icon="['fas', 'question-circle']" class="mr-2" />
                    题库管理
                  </el-dropdown-item>
                  <el-dropdown-item @click="handleDelete(course)" divided>
                    <FontAwesomeIcon :icon="['fas', 'trash']" class="mr-2" />
                    删除课程
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
        
        <div class="course-content">
          <h3 class="course-title">{{ course.title }}</h3>
          <p class="course-description">{{ course.description }}</p>
          
          <div class="course-stats">
            <div class="stat-item">
              <FontAwesomeIcon :icon="['fas', 'list']" />
              <span>{{ course.chapters?.length || 0 }} 章节</span>
            </div>
            <div class="stat-item">
              <FontAwesomeIcon :icon="['fas', 'clock']" />
              <span>{{ formatDuration(course.totalDuration) }}</span>
            </div>
            <div class="stat-item" v-if="course.progress !== undefined">
              <FontAwesomeIcon :icon="['fas', 'chart-line']" />
              <span>{{ course.progress }}% 完成</span>
            </div>
          </div>
        </div>
        
        <div class="course-footer">
          <div class="course-date">
            <span>创建于 {{ formatDate(course.createdAt) }}</span>
          </div>
          <div class="course-progress" v-if="course.progress !== undefined">
            <el-progress 
              :percentage="course.progress" 
              :stroke-width="4"
              :show-text="false"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div class="pagination" v-if="total > 0">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
    
    <!-- 课程编辑弹窗 -->
    <CourseEditDialog
      v-model="editDialogVisible"
      :course="selectedCourse"
      @saved="handleCourseSaved"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onActivated } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { 
  faPlus, 
  faSearch, 
  faBookOpen, 
  faEllipsisV, 
  faEye, 
  faEdit, 
  faPlay, 
  faQuestionCircle, 
  faTrash,
  faList,
  faClock,
  faChartLine
} from '@fortawesome/free-solid-svg-icons'
import { useCourseStore } from '@/store/modules/course'
import CourseEditDialog from '@/shared/components/DesignSystem/CourseEditDialog.vue'
import type { Course, CourseSearchParams, CourseLevel, CourseStatus } from '@/types/course'

// 添加图标到库
library.add(
  faPlus, faSearch, faBookOpen, faEllipsisV, faEye, faEdit, 
  faPlay, faQuestionCircle, faTrash, faList, faClock, faChartLine
)

const router = useRouter()
const courseStore = useCourseStore()

// 响应式数据
const loading = ref(false)
const courses = ref<Course[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

const searchParams = ref<CourseSearchParams>({
  keyword: '',
  level: undefined,
  status: undefined,
  page: 1,
  pageSize: 10
})

// 编辑弹窗相关
const editDialogVisible = ref(false)
const selectedCourse = ref<Course | null>(null)

// 计算属性
// const hasCourses = computed(() => courses.value.length > 0)

// 生命周期
onMounted(() => {
  fetchCourses()
})

// 页面激活时刷新数据（从其他页面返回时）
onActivated(() => {
  fetchCourses()
})

// 方法
const fetchCourses = async () => {
  try {
    loading.value = true
    searchParams.value.page = currentPage.value
    searchParams.value.pageSize = pageSize.value
    
    console.log('开始获取课程列表...', searchParams.value)
    const response = await courseStore.fetchCourses(searchParams.value)
    console.log('课程列表响应:', response)
    courses.value = response.courses
    total.value = response.total
  } catch (error) {
    console.error('获取课程列表失败:', error)
    ElMessage.error(`获取课程列表失败: ${error instanceof Error ? error.message : '未知错误'}`)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  fetchCourses()
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  fetchCourses()
}

const handleCurrentChange = (page: number) => {
  currentPage.value = page
  fetchCourses()
}

const goToCreate = () => {
  router.push('/courses/create')
}

const goToDetail = (id: string) => {
  router.push(`/courses/${id}`)
}

// 保留原有的goToEdit方法（如果需要的话）
// const goToEdit = (id: string) => {
//   router.push(`/courses/${id}/edit`)
// }

// 打开编辑弹窗
const openEditDialog = (course: Course) => {
  selectedCourse.value = course
  editDialogVisible.value = true
}

// 处理课程保存
const handleCourseSaved = (updatedCourse: Course) => {
  // 更新本地课程列表
  const index = courses.value.findIndex(c => c.id === updatedCourse.id)
  if (index !== -1) {
    courses.value[index] = updatedCourse
  }
  editDialogVisible.value = false
  selectedCourse.value = null
}

const goToLearn = (id: string) => {
  router.push(`/courses/${id}/learn`)
}

const goToQuestions = (id: string) => {
  router.push(`/questions/generate/${id}`)
}

const handleDelete = async (course: Course) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除课程"${course.title}"吗？此操作不可撤销。`,
      '删除确认',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await courseStore.deleteCourse(course.id)
    ElMessage.success('课程删除成功')
    fetchCourses()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除课程失败:', error)
      ElMessage.error('删除课程失败')
    }
  }
}

// 工具函数
const getStatusType = (status: CourseStatus): string => {
  switch (status) {
    case 'published':
      return 'success'
    case 'draft':
      return 'warning'
    case 'archived':
      return 'info'
    default:
      return 'info'
  }
}

const getStatusText = (status: CourseStatus): string => {
  switch (status) {
    case 'published':
      return '已发布'
    case 'draft':
      return '草稿'
    case 'archived':
      return '已归档'
    default:
      return '未知'
  }
}

const getLevelType = (level: CourseLevel): string => {
  switch (level) {
    case 'beginner':
      return 'success'
    case 'intermediate':
      return 'warning'
    case 'advanced':
      return 'danger'
    default:
      return 'info'
  }
}

const getLevelText = (level: CourseLevel): string => {
  switch (level) {
    case 'beginner':
      return '初级'
    case 'intermediate':
      return '中级'
    case 'advanced':
      return '高级'
    default:
      return '未知'
  }
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const formatDuration = (minutes?: number): string => {
  if (!minutes) return '0分钟'
  if (minutes < 60) return `${minutes}分钟`
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return remainingMinutes > 0 ? `${hours}小时${remainingMinutes}分钟` : `${hours}小时`
}
</script>

<style lang="scss" scoped>
.course-list {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--brand-border);

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

  .header-actions {
    .el-button {
      height: 40px;
      padding: 0 20px;
    }
  }

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
    margin-bottom: 20px;
    
    .header-actions {
      order: -1;  // 将按钮放在标题上方
      
      .el-button {
        width: 100%;
      }
    }
  }
}

.search-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 32px;

  // 桌面端：搜索框和筛选框水平排列
  @media (min-width: 769px) {
    flex-direction: row;
    align-items: flex-end;
    justify-content: space-between;
    
    .search-bar {
      flex: 1;
      max-width: 400px;
      margin-bottom: 0;
    }
    
    .filter-bar {
      display: flex;
      gap: 12px;
      
      .el-select {
        width: 140px;
      }
    }
  }

  // 移动端：垂直排列
  @media (max-width: 768px) {
    .search-bar .el-input {
      max-width: 100%;
    }
    
    .filter-bar {
      flex-direction: row;
      gap: 12px;
      
      .el-select {
        flex: 1;
        min-width: 0;
      }
    }
  }
}

.course-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
  
  @media (min-width: 1200px) {
    grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
    gap: 24px;
  }
}

.course-card {
  background: var(--brand-bg-primary);
  border: 1px solid var(--brand-border);
  border-radius: var(--brand-radius-lg);
  padding: 24px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: var(--brand-shadow-sm);

  &:hover {
    box-shadow: var(--brand-shadow-lg);
    transform: translateY(-2px);
    border-color: var(--brand-primary);
  }

  .course-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16px;

    .course-status {
      display: flex;
      gap: 8px;
    }

    .course-actions {
      .el-button {
        padding: 4px;
        color: var(--brand-text-tertiary);
        
        &:hover {
          color: var(--brand-text-primary);
          background: var(--brand-bg-secondary);
        }
      }
    }
  }

  .course-content {
    margin-bottom: 20px;

    .course-title {
      font-size: 18px;
      font-weight: 600;
      color: var(--brand-text-primary);
      margin: 0 0 8px 0;
      line-height: 1.4;
    }

    .course-description {
      color: var(--brand-text-secondary);
      margin: 0 0 16px 0;
      line-height: 1.5;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .course-stats {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;

      .stat-item {
        display: flex;
        align-items: center;
        gap: 4px;
        color: var(--brand-text-secondary);
        font-size: 14px;

        svg {
          color: var(--brand-text-tertiary);
        }
      }
    }
  }

  .course-footer {
    .course-date {
      color: var(--brand-text-tertiary);
      font-size: 14px;
      margin-bottom: 8px;
    }

    .course-progress {
      .el-progress {
        :deep(.el-progress-bar__outer) {
          background-color: var(--brand-bg-tertiary);
        }
      }
    }
  }
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 60px 20px;
  color: var(--brand-text-secondary);

  .empty-icon {
    font-size: 64px;
    color: var(--brand-text-tertiary);
    margin-bottom: 16px;
  }

  h3 {
    font-size: 20px;
    color: var(--brand-text-primary);
    margin: 0 0 8px 0;
  }

  p {
    margin: 0 0 24px 0;
  }
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 32px;
}

// 响应式设计
@media (max-width: 768px) {
  .course-list {
    padding: 16px;
  }



  .course-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .course-card {
    padding: 16px;
  }
}
</style>
