<template>
  <div class="course-detail" v-loading="loading">
    <!-- 课程头部信息 -->
    <div class="course-header">
      <div class="course-info">
        <div class="course-meta">
          <el-tag :type="getStatusType(course?.status) as any" class="mr-2">
            {{ getStatusText(course?.status) }}
          </el-tag>
          <el-tag :type="getLevelType(course?.level) as any" size="small">
            {{ getLevelText(course?.level) }}
          </el-tag>
        </div>
        <h1 class="course-title">{{ course?.title }}</h1>
        <p class="course-description">{{ course?.description }}</p>
        
        <div class="course-stats">
          <div class="stat-item">
            <FontAwesomeIcon :icon="['fas', 'list']" />
            <span>{{ course?.chapters?.length || 0 }} 章节</span>
          </div>
          <div class="stat-item">
            <FontAwesomeIcon :icon="['fas', 'clock']" />
            <span>{{ formatDuration(course?.totalDuration) }}</span>
          </div>
          <div class="stat-item" v-if="course?.progress !== undefined">
            <FontAwesomeIcon :icon="['fas', 'chart-line']" />
            <span>{{ course.progress }}% 完成</span>
          </div>
        </div>
      </div>
      
      <div class="course-actions">
        <el-button type="primary" @click="startLearning">
          <FontAwesomeIcon :icon="['fas', 'play']" class="mr-2" />
          开始学习
        </el-button>
        <el-button @click="openEditDialog">
          <FontAwesomeIcon :icon="['fas', 'edit']" class="mr-2" />
          编辑课程
        </el-button>
        <el-button @click="goToQuestions">
          <FontAwesomeIcon :icon="['fas', 'question-circle']" class="mr-2" />
          题库管理
        </el-button>
        <el-dropdown trigger="click">
          <el-button type="text">
            <FontAwesomeIcon :icon="['fas', 'ellipsis-v']" />
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="goToAnalytics">
                <FontAwesomeIcon :icon="['fas', 'chart-bar']" class="mr-2" />
                学习分析
              </el-dropdown-item>
              <el-dropdown-item @click="exportCourse">
                <FontAwesomeIcon :icon="['fas', 'download']" class="mr-2" />
                导出课程
              </el-dropdown-item>
              <el-dropdown-item @click="handleDelete" divided>
                <FontAwesomeIcon :icon="['fas', 'trash']" class="mr-2" />
                删除课程
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <!-- 章节列表 -->
    <div class="chapters-section">
      <div class="section-header">
        <h2>课程章节</h2>
        <div class="section-actions">
          <el-button type="primary" size="small" @click="addChapter">
            <FontAwesomeIcon :icon="['fas', 'plus']" class="mr-2" />
            添加章节
          </el-button>
        </div>
      </div>
      
      <div class="chapters-list">
        <div v-if="course?.chapters?.length === 0" class="empty-chapters">
          <div class="empty-icon">
            <FontAwesomeIcon :icon="['fas', 'book-open']" />
          </div>
          <h3>暂无章节</h3>
          <p>添加第一个章节开始构建您的课程</p>
          <el-button type="primary" @click="addChapter">
            <FontAwesomeIcon :icon="['fas', 'plus']" class="mr-2" />
            添加章节
          </el-button>
        </div>
        
        <div v-for="(chapter, index) in course?.chapters" :key="chapter.id" class="chapter-item">
          <div class="chapter-content">
            <div class="chapter-order">{{ index + 1 }}</div>
            <div class="chapter-info">
              <h4 class="chapter-title">{{ chapter.title }}</h4>
              <p class="chapter-description">{{ chapter.description }}</p>
              <div class="chapter-meta">
                <span class="duration">{{ chapter.durationMinutes }}分钟</span>
                <span v-if="chapter.isCompleted" class="completed">
                  <FontAwesomeIcon :icon="['fas', 'check-circle']" />
                  已完成
                </span>
              </div>
            </div>
          </div>
          
          <div class="chapter-actions">
            <el-button type="text" size="small" @click="editChapter(chapter.id)">
              <FontAwesomeIcon :icon="['fas', 'edit']" />
            </el-button>
            <el-button type="text" size="small" @click="deleteChapter(chapter.id)">
              <FontAwesomeIcon :icon="['fas', 'trash']" />
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 学习进度 -->
    <div v-if="course?.progress !== undefined" class="progress-section">
      <div class="section-header">
        <h2>学习进度</h2>
      </div>
      
      <div class="progress-content">
        <div class="progress-bar">
          <el-progress 
            :percentage="course.progress" 
            :stroke-width="8"
            :show-text="true"
          />
        </div>
        
        <div class="progress-stats">
          <div class="stat-item">
            <span class="label">已完成章节</span>
            <span class="value">{{ completedChapters }}/{{ course.chapters?.length || 0 }}</span>
          </div>
          <div class="stat-item">
            <span class="label">学习时长</span>
            <span class="value">{{ formatDuration(learnedDuration) }}</span>
          </div>
          <div class="stat-item">
            <span class="label">最后学习</span>
            <span class="value">{{ formatDate(course.lastLearnedAt) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 最近活动 -->
    <div class="recent-activity">
      <div class="section-header">
        <h2>最近活动</h2>
      </div>
      
      <div class="activity-list">
        <div v-if="recentActivity.length === 0" class="empty-activity">
          <p>暂无学习记录</p>
        </div>
        
        <div v-for="activity in recentActivity" :key="activity.id" class="activity-item">
          <div class="activity-icon">
            <FontAwesomeIcon :icon="getActivityIcon(activity.type)" />
          </div>
          <div class="activity-content">
            <div class="activity-title">{{ activity.title }}</div>
            <div class="activity-time">{{ formatDate(activity.time) }}</div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 课程编辑弹窗 -->
    <CourseEditDialog
      v-model="editDialogVisible"
      :course="course"
      @saved="handleCourseSaved"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { 
  faPlay, faEdit, faQuestionCircle, faEllipsisV, faChartBar, 
  faDownload, faTrash, faPlus, faBookOpen, faCheckCircle,
  faList, faClock, faChartLine, faGraduationCap
} from '@fortawesome/free-solid-svg-icons'
import { useCourseStore } from '@/store/modules/course'
import CourseEditDialog from '@/shared/components/DesignSystem/CourseEditDialog.vue'
import type { Course, CourseStatus, CourseLevel } from '@/types/course'

// 添加图标到库
library.add(
  faPlay, faEdit, faQuestionCircle, faEllipsisV, faChartBar, 
  faDownload, faTrash, faPlus, faBookOpen, faCheckCircle,
  faList, faClock, faChartLine, faGraduationCap
)

const route = useRoute()
const router = useRouter()
const courseStore = useCourseStore()

// 响应式数据
const loading = ref(false)
const course = ref<Course | null>(null)
const recentActivity = ref<any[]>([])

// 编辑弹窗相关
const editDialogVisible = ref(false)

// 计算属性
const completedChapters = computed(() => {
  return course.value?.chapters?.filter(chapter => chapter.isCompleted).length || 0
})

const learnedDuration = computed(() => {
  return course.value?.chapters?.reduce((total, chapter) => 
    total + (chapter.learnedDuration || 0), 0) || 0
})

// 生命周期
onMounted(() => {
  const courseId = route.params.id as string
  if (courseId) {
    fetchCourse(courseId)
    fetchRecentActivity(courseId)
  }
})

// 方法
const fetchCourse = async (courseId: string) => {
  try {
    loading.value = true
    const courseData = await courseStore.fetchCourse(courseId)
    course.value = courseData
  } catch (error) {
    console.error('获取课程详情失败:', error)
    ElMessage.error('获取课程详情失败')
  } finally {
    loading.value = false
  }
}

const fetchRecentActivity = async (_courseId: string) => {
  // 模拟最近活动数据
  recentActivity.value = [
    {
      id: '1',
      type: 'study',
      title: '完成了第一章的学习',
      time: new Date().toISOString()
    },
    {
      id: '2',
      type: 'practice',
      title: '完成了章节练习',
      time: new Date(Date.now() - 86400000).toISOString()
    }
  ]
}

const startLearning = () => {
  if (course.value?.id) {
    router.push(`/courses/${course.value.id}/learn`)
  }
}

// 保留原有的goToEdit方法（如果需要的话）
// const goToEdit = () => {
//   if (course.value?.id) {
//     router.push(`/courses/${course.value.id}/edit`)
//   }
// }

// 打开编辑弹窗
const openEditDialog = () => {
  editDialogVisible.value = true
}

// 处理课程保存
const handleCourseSaved = (updatedCourse: Course) => {
  // 更新当前课程数据
  course.value = updatedCourse
  editDialogVisible.value = false
}

const goToQuestions = () => {
  if (course.value?.id) {
    router.push(`/questions/generate/${course.value.id}`)
  }
}

const goToAnalytics = () => {
  if (course.value?.id) {
    router.push(`/analytics/${course.value.id}`)
  }
}

const addChapter = () => {
  if (course.value?.id) {
    router.push(`/courses/${course.value.id}/edit?action=add-chapter`)
  }
}

const editChapter = (chapterId: string) => {
  if (course.value?.id) {
    router.push(`/courses/${course.value.id}/edit?chapter=${chapterId}`)
  }
}

const deleteChapter = async (chapterId: string) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除这个章节吗？此操作不可撤销。',
      '删除确认',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await courseStore.deleteChapter(chapterId)
    ElMessage.success('章节删除成功')
    await fetchCourse(course.value!.id)
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除章节失败:', error)
      ElMessage.error('删除章节失败')
    }
  }
}

const handleDelete = async () => {
  if (!course.value) return
  
  try {
    await ElMessageBox.confirm(
      `确定要删除课程"${course.value.title}"吗？此操作不可撤销。`,
      '删除确认',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await courseStore.deleteCourse(course.value.id)
    ElMessage.success('课程删除成功')
    router.push('/courses')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除课程失败:', error)
      ElMessage.error('删除课程失败')
    }
  }
}

const exportCourse = () => {
  ElMessage.info('导出功能开发中...')
}

const getStatusType = (status?: CourseStatus): string => {
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

const getStatusText = (status?: CourseStatus): string => {
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

const getLevelType = (level?: CourseLevel): string => {
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

const getLevelText = (level?: CourseLevel): string => {
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

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'study':
      return ['fas', 'graduation-cap']
    case 'practice':
      return ['fas', 'question-circle']
    default:
      return ['fas', 'clock']
  }
}

const formatDate = (dateString?: string): string => {
  if (!dateString) return '暂无'
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
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
.course-detail {
  padding: 24px;
  max-width: 1000px;
  margin: 0 auto;
}

.course-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--brand-border);

  .course-info {
    flex: 1;

    .course-meta {
      margin-bottom: 12px;
    }

    .course-title {
      font-size: 28px;
      font-weight: 600;
      color: var(--brand-text-primary);
      margin: 0 0 12px 0;
    }

    .course-description {
      color: var(--brand-text-secondary);
      margin: 0 0 20px 0;
      line-height: 1.5;
    }

    .course-stats {
      display: flex;
      gap: 24px;
      flex-wrap: wrap;

      .stat-item {
        display: flex;
        align-items: center;
        gap: 6px;
        color: var(--brand-text-secondary);
        font-size: 14px;

        svg {
          color: var(--brand-text-tertiary);
        }
      }
    }
  }

  .course-actions {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  h2 {
    font-size: 20px;
    font-weight: 600;
    color: var(--brand-text-primary);
    margin: 0;
  }
}

.chapters-section {
  margin-bottom: 32px;
}

.chapters-list {
  .empty-chapters {
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

  .chapter-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    background: var(--brand-bg-primary);
    border: 1px solid var(--brand-border);
    border-radius: var(--brand-radius-lg);
    margin-bottom: 12px;
    transition: all 0.2s ease;

    &:hover {
      border-color: var(--brand-primary);
      box-shadow: var(--brand-shadow-sm);
    }

    .chapter-content {
      display: flex;
      align-items: center;
      flex: 1;

      .chapter-order {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        background: var(--brand-primary);
        color: white;
        border-radius: 50%;
        font-weight: 600;
        margin-right: 16px;
      }

      .chapter-info {
        flex: 1;

        .chapter-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--brand-text-primary);
          margin: 0 0 4px 0;
        }

        .chapter-description {
          color: var(--brand-text-secondary);
          margin: 0 0 8px 0;
          line-height: 1.4;
        }

        .chapter-meta {
          display: flex;
          gap: 16px;
          font-size: 14px;

          .duration {
            color: var(--brand-text-secondary);
          }

          .completed {
            color: var(--brand-success);
            display: flex;
            align-items: center;
            gap: 4px;
          }
        }
      }
    }

    .chapter-actions {
      display: flex;
      gap: 8px;

      .el-button {
        padding: 8px;
        color: var(--brand-text-tertiary);
        
        &:hover {
          color: var(--brand-text-primary);
          background: var(--brand-bg-secondary);
        }
      }
    }
  }
}

.progress-section {
  margin-bottom: 32px;

  .progress-content {
    .progress-bar {
      margin-bottom: 20px;
    }

    .progress-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;

      .stat-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        background: var(--brand-bg-secondary);
        border-radius: var(--brand-radius-base);

        .label {
          color: var(--brand-text-secondary);
          font-size: 14px;
        }

        .value {
          color: var(--brand-text-primary);
          font-weight: 500;
        }
      }
    }
  }
}

.recent-activity {
  .activity-list {
    .empty-activity {
      text-align: center;
      padding: 40px 20px;
      color: var(--brand-text-secondary);
    }

    .activity-item {
      display: flex;
      align-items: center;
      padding: 16px;
      background: var(--brand-bg-primary);
      border: 1px solid var(--brand-border);
      border-radius: var(--brand-radius-base);
      margin-bottom: 12px;

      .activity-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        background: var(--brand-primary-bg);
        color: var(--brand-primary);
        border-radius: 50%;
        margin-right: 16px;
      }

      .activity-content {
        flex: 1;

        .activity-title {
          font-weight: 500;
          color: var(--brand-text-primary);
          margin-bottom: 4px;
        }

        .activity-time {
          font-size: 14px;
          color: var(--brand-text-secondary);
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .course-detail {
    padding: 16px;
  }

  .course-header {
    flex-direction: column;
    gap: 20px;
    align-items: stretch;

    .course-actions {
      justify-content: stretch;
      
      .el-button {
        flex: 1;
      }
    }
  }

  .chapter-item {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;

    .chapter-content {
      .chapter-order {
        margin-right: 12px;
      }
    }

    .chapter-actions {
      justify-content: center;
    }
  }

  .progress-stats {
    grid-template-columns: 1fr;
  }
}
</style>
