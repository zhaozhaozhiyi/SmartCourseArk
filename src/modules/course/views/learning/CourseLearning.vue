<template>
  <div class="course-learning">
    <!-- 课程头部 -->
    <div class="course-header">
      <div class="course-info">
        <h1 class="course-title">{{ course?.title }}</h1>
        <p class="course-description">{{ course?.description }}</p>
        
        <div class="course-progress">
          <el-progress 
            :percentage="course?.progress || 0" 
            :stroke-width="6"
            :show-text="true"
          />
        </div>
      </div>
      
      <div class="course-actions">
        <el-button type="primary" @click="startPractice">
          <FontAwesomeIcon :icon="['fas', 'question-circle']" class="mr-2" />
          开始练习
        </el-button>
        <el-button @click="goToAnalytics">
          <FontAwesomeIcon :icon="['fas', 'chart-bar']" class="mr-2" />
          学习分析
        </el-button>
      </div>
    </div>

    <div class="learning-content">
      <!-- 左侧章节导航 -->
      <div class="chapter-nav">
        <div class="nav-header">
          <h3>课程章节</h3>
          <span class="chapter-count">{{ course?.chapters?.length || 0 }} 章节</span>
        </div>
        
        <div class="chapter-list">
          <div v-if="course?.chapters?.length === 0" class="empty-chapters">
            <p>暂无章节</p>
          </div>
          
          <div 
            v-for="(chapter, index) in course?.chapters" 
            :key="chapter.id"
            class="chapter-item"
            :class="{ 
              active: currentChapterId === chapter.id,
              completed: chapter.isCompleted 
            }"
            @click="selectChapter(chapter.id)"
          >
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
        </div>
      </div>

      <!-- 右侧内容区域 -->
      <div class="content-area">
        <div v-if="!currentChapterId" class="welcome-content">
          <div class="welcome-icon">
            <FontAwesomeIcon :icon="['fas', 'book-open']" />
          </div>
          <h3>欢迎学习 {{ course?.title }}</h3>
          <p>请从左侧选择一个章节开始学习</p>
          
          <div class="course-stats">
            <div class="stat-card">
              <div class="stat-value">{{ course?.chapters?.length || 0 }}</div>
              <div class="stat-label">总章节</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">{{ completedChapters }}</div>
              <div class="stat-label">已完成</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">{{ formatDuration(course?.totalDuration) }}</div>
              <div class="stat-label">总时长</div>
            </div>
          </div>
        </div>
        
        <div v-else class="chapter-content">
          <transition name="chapter-fade" mode="out-in">
            <ChapterContent 
              :key="currentChapterId"
              :chapter-id="currentChapterId" 
              :course="course"
              @chapter-completed="handleChapterCompleted"
              @navigate-chapter="handleNavigateChapter"
            />
          </transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { 
  faQuestionCircle, faChartBar, faBookOpen, faCheckCircle
} from '@fortawesome/free-solid-svg-icons'
import { useCourseStore } from '@/store/modules/course'
import type { Course } from '@/types/course'
import ChapterContent from './ChapterContent.vue'

// 添加图标到库
library.add(faQuestionCircle, faChartBar, faBookOpen, faCheckCircle)

const route = useRoute()
const router = useRouter()
const courseStore = useCourseStore()

// 响应式数据
const course = ref<Course | null>(null)
const currentChapterId = ref<string>('')

// 计算属性
const completedChapters = computed(() => {
  return course.value?.chapters?.filter(chapter => chapter.isCompleted).length || 0
})

// 生命周期
onMounted(() => {
  const courseId = route.params.id as string
  if (courseId) {
    fetchCourse(courseId)
  }
})

// 方法
const fetchCourse = async (courseId: string) => {
  try {
    const courseData = await courseStore.fetchCourse(courseId)
    course.value = courseData
  } catch (error) {
    console.error('获取课程信息失败:', error)
  }
}

const selectChapter = (chapterId: string) => {
  currentChapterId.value = chapterId
  // 移除路由跳转，直接切换内容
}

const startPractice = () => {
  if (course.value?.id) {
    router.push(`/practice/${course.value.id}`)
  }
}

const goToAnalytics = () => {
  if (course.value?.id) {
    router.push(`/analytics/${course.value.id}`)
  }
}

const formatDuration = (minutes?: number): string => {
  if (!minutes) return '0分钟'
  if (minutes < 60) return `${minutes}分钟`
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return remainingMinutes > 0 ? `${hours}小时${remainingMinutes}分钟` : `${hours}小时`
}

// 处理章节完成事件
const handleChapterCompleted = (chapterId: string) => {
  if (course.value?.chapters) {
    const chapter = course.value.chapters.find(c => c.id === chapterId)
    if (chapter) {
      chapter.isCompleted = true
    }
  }
}

// 处理章节导航事件
const handleNavigateChapter = (direction: 'prev' | 'next') => {
  if (!course.value?.chapters) return
  
  const currentIndex = course.value.chapters.findIndex(c => c.id === currentChapterId.value)
  if (currentIndex === -1) return
  
  let targetIndex = -1
  if (direction === 'prev' && currentIndex > 0) {
    targetIndex = currentIndex - 1
  } else if (direction === 'next' && currentIndex < course.value.chapters.length - 1) {
    targetIndex = currentIndex + 1
  }
  
  if (targetIndex !== -1) {
    currentChapterId.value = course.value.chapters[targetIndex].id
  }
}
</script>

<style lang="scss" scoped>
.course-learning {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--brand-bg-secondary);
}

.course-header {
  background: var(--brand-bg-primary);
  border-bottom: 1px solid var(--brand-border);
  padding: 24px;
  
  .course-info {
    margin-bottom: 16px;
    
    .course-title {
      font-size: 24px;
      font-weight: 600;
      color: var(--brand-text-primary);
      margin: 0 0 8px 0;
    }
    
    .course-description {
      color: var(--brand-text-secondary);
      margin: 0 0 16px 0;
    }
    
    .course-progress {
      max-width: 300px;
    }
  }
  
  .course-actions {
    display: flex;
    gap: 12px;
  }
}

.learning-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.chapter-nav {
  width: 320px;
  background: var(--brand-bg-primary);
  border-right: 1px solid var(--brand-border);
  display: flex;
  flex-direction: column;
  
  .nav-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    border-bottom: 1px solid var(--brand-border);
    
    h3 {
      font-size: 16px;
      font-weight: 600;
      color: var(--brand-text-primary);
      margin: 0;
    }
    
    .chapter-count {
      color: var(--brand-text-secondary);
      font-size: 14px;
    }
  }
  
  .chapter-list {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    
    .empty-chapters {
      text-align: center;
      padding: 40px 20px;
      color: var(--brand-text-secondary);
    }
    
    .chapter-item {
      display: flex;
      align-items: flex-start;
      padding: 16px;
      border-radius: var(--brand-radius-base);
      cursor: pointer;
      transition: all 0.2s ease;
      margin-bottom: 8px;
      border: 1px solid transparent;
      
      &:hover {
        background: var(--brand-bg-secondary);
        border-color: var(--brand-border);
      }
      
      &.active {
        background: var(--brand-primary-bg);
        border-color: var(--brand-primary);
        
        .chapter-order {
          background: var(--brand-primary);
          color: white;
        }
        
        .chapter-title {
          color: var(--brand-primary);
        }
      }
      
      &.completed {
        .chapter-order {
          background: var(--brand-success);
          color: white;
        }
      }
      
      .chapter-order {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        background: var(--brand-bg-tertiary);
        color: var(--brand-text-secondary);
        border-radius: 50%;
        font-weight: 600;
        font-size: 14px;
        margin-right: 12px;
        flex-shrink: 0;
      }
      
      .chapter-info {
        flex: 1;
        
        .chapter-title {
          font-size: 14px;
          font-weight: 500;
          color: var(--brand-text-primary);
          margin: 0 0 4px 0;
          line-height: 1.3;
        }
        
        .chapter-description {
          font-size: 12px;
          color: var(--brand-text-secondary);
          margin: 0 0 8px 0;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .chapter-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
          
          .duration {
            color: var(--brand-text-tertiary);
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
  }
}

.content-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  
  .welcome-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    padding: 40px;
    
    .welcome-icon {
      font-size: 64px;
      color: var(--brand-primary);
      margin-bottom: 24px;
    }
    
    h3 {
      font-size: 24px;
      font-weight: 600;
      color: var(--brand-text-primary);
      margin: 0 0 8px 0;
    }
    
    p {
      color: var(--brand-text-secondary);
      margin: 0 0 32px 0;
    }
    
    .course-stats {
      display: flex;
      gap: 24px;
      
      .stat-card {
        text-align: center;
        
        .stat-value {
          font-size: 24px;
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
  
  .chapter-content {
    flex: 1;
    overflow: hidden;
  }
}

// 章节切换动画
.chapter-fade-enter-active,
.chapter-fade-leave-active {
  transition: opacity 0.3s ease;
}

.chapter-fade-enter-from,
.chapter-fade-leave-to {
  opacity: 0;
}

// 响应式设计
@media (max-width: 768px) {
  .learning-content {
    flex-direction: column;
  }
  
  .chapter-nav {
    width: 100%;
    height: 200px;
    
    .chapter-list {
      .chapter-item {
        .chapter-info {
          .chapter-description {
            -webkit-line-clamp: 1;
          }
        }
      }
    }
  }
  
  .welcome-content {
    .course-stats {
      flex-direction: column;
      gap: 16px;
    }
  }
}
</style>
