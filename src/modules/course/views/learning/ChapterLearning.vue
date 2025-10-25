<template>
  <div class="chapter-learning">
    <!-- 章节头部 -->
    <div class="chapter-header">
      <div class="chapter-info">
        <div class="chapter-meta">
          <span class="chapter-number">第{{ chapterIndex + 1 }}章</span>
          <el-tag v-if="chapter?.isCompleted" type="success" size="small">
            <FontAwesomeIcon :icon="['fas', 'check-circle']" class="mr-1" />
            已完成
          </el-tag>
        </div>
        <h2 class="chapter-title">{{ chapter?.title }}</h2>
        <p class="chapter-description">{{ chapter?.description }}</p>
      </div>
      
      <div class="chapter-actions">
        <el-button @click="markCompleted" :disabled="chapter?.isCompleted">
          <FontAwesomeIcon :icon="['fas', 'check']" class="mr-2" />
          标记完成
        </el-button>
        <el-button type="primary" @click="startPractice">
          <FontAwesomeIcon :icon="['fas', 'question-circle']" class="mr-2" />
          章节练习
        </el-button>
      </div>
    </div>

    <!-- 章节内容 -->
    <div class="chapter-content">
      <div class="content-viewer">
        <div v-if="loading" class="loading-content">
          <el-skeleton :rows="8" animated />
        </div>
        
        <div v-else-if="chapter?.content" class="content-body">
          <div v-html="renderedContent"></div>
        </div>
        
        <div v-else class="empty-content">
          <div class="empty-icon">
            <FontAwesomeIcon :icon="['fas', 'file-alt']" />
          </div>
          <h3>暂无内容</h3>
          <p>该章节还没有添加学习内容</p>
        </div>
      </div>
    </div>

    <!-- 章节导航 -->
    <div class="chapter-navigation">
      <div class="nav-actions">
        <el-button 
          :disabled="!hasPreviousChapter" 
          @click="goToPreviousChapter"
        >
          <FontAwesomeIcon :icon="['fas', 'chevron-left']" class="mr-2" />
          上一章
        </el-button>
        
        <el-button 
          :disabled="!hasNextChapter" 
          @click="goToNextChapter"
        >
          下一章
          <FontAwesomeIcon :icon="['fas', 'chevron-right']" class="ml-2" />
        </el-button>
      </div>
      
      <div class="chapter-progress">
        <span class="progress-text">
          {{ chapterIndex + 1 }} / {{ totalChapters }}
        </span>
        <el-progress 
          :percentage="chapterProgress" 
          :stroke-width="4"
          :show-text="false"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { 
  faCheck, faQuestionCircle, faCheckCircle, faFileAlt, 
  faChevronLeft, faChevronRight
} from '@fortawesome/free-solid-svg-icons'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { useCourseStore } from '@/store/modules/course'
import type { Chapter } from '@/types/course'

// 添加图标到库
library.add(faCheck, faQuestionCircle, faCheckCircle, faFileAlt, faChevronLeft, faChevronRight)

const route = useRoute()
const router = useRouter()
const courseStore = useCourseStore()

// 响应式数据
const loading = ref(false)
const chapter = ref<Chapter | null>(null)
const course = ref<any>(null)

// 计算属性
const chapterIndex = computed(() => {
  if (!course.value?.chapters || !chapter.value) return 0
  return course.value.chapters.findIndex((c: Chapter) => c.id === chapter.value!.id)
})

const totalChapters = computed(() => {
  return course.value?.chapters?.length || 0
})

const hasPreviousChapter = computed(() => {
  return chapterIndex.value > 0
})

const hasNextChapter = computed(() => {
  return chapterIndex.value < totalChapters.value - 1
})

const chapterProgress = computed(() => {
  if (totalChapters.value === 0) return 0
  return Math.round(((chapterIndex.value + 1) / totalChapters.value) * 100)
})

const renderedContent = computed(() => {
  if (!chapter.value?.content) return ''
  
  try {
    // 将Markdown转换为HTML
    const html = marked(chapter.value.content)
    // 清理HTML内容，防止XSS攻击
    return DOMPurify.sanitize(html)
  } catch (error) {
    console.error('渲染内容失败:', error)
    return chapter.value.content
  }
})

// 生命周期
onMounted(() => {
  const courseId = route.params.id as string
  const chapterId = route.params.chapterId as string
  
  if (courseId && chapterId) {
    fetchCourseAndChapter(courseId, chapterId)
  }
})

// 方法
const fetchCourseAndChapter = async (courseId: string, chapterId: string) => {
  try {
    loading.value = true
    
    // 获取课程信息
    const courseData = await courseStore.fetchCourse(courseId)
    course.value = courseData
    
    // 获取章节信息
    const chapterData = await courseStore.getChapter(chapterId)
    chapter.value = chapterData
    
  } catch (error) {
    console.error('获取章节信息失败:', error)
    ElMessage.error('获取章节信息失败')
  } finally {
    loading.value = false
  }
}

const markCompleted = async () => {
  if (!chapter.value?.id) return
  
  try {
    await courseStore.updateChapterCompletion(chapter.value.id, true)
    ElMessage.success('章节标记为已完成')
  } catch (error) {
    console.error('标记章节完成失败:', error)
    ElMessage.error('标记章节完成失败')
  }
}

const startPractice = () => {
  const courseId = route.params.id as string
  router.push(`/practice/${courseId}?chapter=${chapter.value?.id}`)
}

const goToPreviousChapter = () => {
  if (!hasPreviousChapter.value || !course.value?.chapters) return
  
  const previousChapter = course.value.chapters[chapterIndex.value - 1]
  router.push(`/courses/${course.value.id}/learn/chapter/${previousChapter.id}`)
}

const goToNextChapter = () => {
  if (!hasNextChapter.value || !course.value?.chapters) return
  
  const nextChapter = course.value.chapters[chapterIndex.value + 1]
  router.push(`/courses/${course.value.id}/learn/chapter/${nextChapter.id}`)
}
</script>

<style lang="scss" scoped>
.chapter-learning {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--brand-bg-primary);
}

.chapter-header {
  background: var(--brand-bg-primary);
  border-bottom: 1px solid var(--brand-border);
  padding: 24px;
  
  .chapter-info {
    margin-bottom: 16px;
    
    .chapter-meta {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 8px;
      
      .chapter-number {
        background: var(--brand-primary);
        color: white;
        padding: 4px 12px;
        border-radius: var(--brand-radius-sm);
        font-size: 14px;
        font-weight: 500;
      }
    }
    
    .chapter-title {
      font-size: 24px;
      font-weight: 600;
      color: var(--brand-text-primary);
      margin: 0 0 8px 0;
    }
    
    .chapter-description {
      color: var(--brand-text-secondary);
      margin: 0;
      line-height: 1.5;
    }
  }
  
  .chapter-actions {
    display: flex;
    gap: 12px;
  }
}

.chapter-content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.content-viewer {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  
  .loading-content {
    max-width: 800px;
    margin: 0 auto;
  }
  
  .content-body {
    max-width: 800px;
    margin: 0 auto;
    line-height: 1.6;
    color: var(--brand-text-primary);
    
    :deep(h1), :deep(h2), :deep(h3), :deep(h4), :deep(h5), :deep(h6) {
      color: var(--brand-text-primary);
      margin-top: 32px;
      margin-bottom: 16px;
      font-weight: 600;
    }
    
    :deep(h1) {
      font-size: 28px;
      border-bottom: 2px solid var(--brand-border);
      padding-bottom: 8px;
    }
    
    :deep(h2) {
      font-size: 24px;
    }
    
    :deep(h3) {
      font-size: 20px;
    }
    
    :deep(p) {
      margin-bottom: 16px;
      color: var(--brand-text-primary);
    }
    
    :deep(ul), :deep(ol) {
      margin-bottom: 16px;
      padding-left: 24px;
      
      li {
        margin-bottom: 8px;
        color: var(--brand-text-primary);
      }
    }
    
    :deep(blockquote) {
      border-left: 4px solid var(--brand-primary);
      padding-left: 16px;
      margin: 16px 0;
      color: var(--brand-text-secondary);
      font-style: italic;
    }
    
    :deep(code) {
      background: var(--brand-bg-secondary);
      padding: 2px 6px;
      border-radius: var(--brand-radius-sm);
      font-family: 'Courier New', monospace;
      font-size: 14px;
      color: var(--brand-primary);
    }
    
    :deep(pre) {
      background: var(--brand-bg-secondary);
      padding: 16px;
      border-radius: var(--brand-radius-base);
      overflow-x: auto;
      margin: 16px 0;
      
      code {
        background: none;
        padding: 0;
        color: var(--brand-text-primary);
      }
    }
    
    :deep(table) {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0;
      
      th, td {
        border: 1px solid var(--brand-border);
        padding: 12px;
        text-align: left;
      }
      
      th {
        background: var(--brand-bg-secondary);
        font-weight: 600;
        color: var(--brand-text-primary);
      }
    }
    
    :deep(img) {
      max-width: 100%;
      height: auto;
      border-radius: var(--brand-radius-base);
      margin: 16px 0;
    }
  }
  
  .empty-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    text-align: center;
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
      margin: 0;
    }
  }
}

.chapter-navigation {
  background: var(--brand-bg-primary);
  border-top: 1px solid var(--brand-border);
  padding: 20px 24px;
  
  .nav-actions {
    display: flex;
    justify-content: space-between;
    margin-bottom: 16px;
  }
  
  .chapter-progress {
    display: flex;
    align-items: center;
    gap: 12px;
    
    .progress-text {
      font-size: 14px;
      color: var(--brand-text-secondary);
      min-width: 60px;
    }
    
    .el-progress {
      flex: 1;
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .chapter-header {
    padding: 16px;
    
    .chapter-actions {
      flex-direction: column;
      gap: 8px;
      
      .el-button {
        width: 100%;
      }
    }
  }
  
  .content-viewer {
    padding: 16px;
    
    .content-body {
      :deep(h1) {
        font-size: 24px;
      }
      
      :deep(h2) {
        font-size: 20px;
      }
      
      :deep(h3) {
        font-size: 18px;
      }
    }
  }
  
  .chapter-navigation {
    padding: 16px;
    
    .nav-actions {
      flex-direction: column;
      gap: 8px;
      
      .el-button {
        width: 100%;
      }
    }
  }
}
</style>
