<template>
  <div class="chapter-content">
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
        <el-button 
          v-if="!chapter?.isCompleted" 
          @click="markCompleted"
          :loading="markingCompleted"
        >
          <FontAwesomeIcon :icon="['fas', 'check']" class="mr-2" />
          标记完成
        </el-button>
        <el-button type="primary" @click="startPractice">
          <FontAwesomeIcon :icon="['fas', 'question-circle']" class="mr-2" />
          章节练习
        </el-button>
        
        <!-- 交互内容控制按钮 -->
        <el-button 
          v-if="hasAnyContent"
          @click="toggleContentMode"
          :type="showingInteractive ? 'primary' : 'default'"
        >
          <FontAwesomeIcon :icon="showingInteractive ? ['fas', 'book'] : ['fas', 'image']" class="mr-2" />
          {{ showingInteractive ? '显示文本' : '显示交互内容' }}
        </el-button>
        
        <!-- 生成详细内容按钮（仅当没有内容时显示） -->
        <el-button 
          v-if="!hasAnyContent"
          @click="enrichContent"
          :loading="enrichingContent"
          type="info"
        >
          <FontAwesomeIcon :icon="['fas', 'magic']" class="mr-2" />
          生成详细内容
        </el-button>
      </div>
    </div>

    <!-- 章节内容 -->
    <div class="content-viewer">
      <div v-if="loading" class="loading-content">
        <el-skeleton :rows="8" animated />
      </div>
      
      <!-- 文本内容（当showingInteractive=false时显示） -->
      <div v-else-if="!showingInteractive && chapter?.content" class="content-body">
        <div v-html="renderedContent"></div>
      </div>
      
      <!-- 交互式SVG内容（当showingInteractive=true时显示） -->
      <div v-else-if="showingInteractive" class="interactive-content">
        <div v-if="loadingInteractive" class="loading-content">
          <el-skeleton :rows="8" animated />
          <p class="loading-tip">AI正在生成交互式学习内容...</p>
        </div>
        
        <div v-else-if="interactiveContent" class="svg-viewer">
          <div class="interactive-header">
            <h3>交互式学习内容</h3>
            <div class="interactive-actions">
              <el-tag v-if="chapter?.interactiveContentType === 'prebuilt'" type="info" size="small">
                预制内容
              </el-tag>
              <el-tag v-else-if="chapter?.interactiveContentType === 'generated'" type="success" size="small">
                AI生成
              </el-tag>
              <el-button 
                @click="regenerateInteractive" 
                size="small" 
                type="text"
                :loading="regenerating"
              >
                <FontAwesomeIcon :icon="['fas', 'refresh']" class="mr-1" />
                重新生成
              </el-button>
            </div>
          </div>
          <div class="svg-container" v-html="sanitizedInteractiveContent"></div>
        </div>
        
        <div v-else class="empty-interactive">
          <div class="empty-icon">
            <FontAwesomeIcon :icon="['fas', 'image']" />
          </div>
          <h3>暂无交互式内容</h3>
          <p>点击下方按钮，使用AI生成可交互的学习动画</p>
          <el-button 
            type="primary" 
            @click="generateInteractive"
            :loading="loadingInteractive"
          >
            <FontAwesomeIcon :icon="['fas', 'magic']" class="mr-2" />
            AI生成交互内容
          </el-button>
        </div>
      </div>
      
      <!-- 完全空内容状态 -->
      <div v-else class="empty-content">
        <div class="empty-icon">
          <FontAwesomeIcon :icon="['fas', 'file-alt']" />
        </div>
        <h3>暂无内容</h3>
        <p>该章节还没有添加学习内容</p>
        <div class="empty-actions">
          <el-button type="primary" @click="enrichContent" :loading="enrichingContent">
            <FontAwesomeIcon :icon="['fas', 'magic']" class="mr-2" />
            使用AI生成详细内容
          </el-button>
          <el-button @click="generateInteractive" :loading="loadingInteractive">
            <FontAwesomeIcon :icon="['fas', 'image']" class="mr-2" />
            生成交互式内容
          </el-button>
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
import { ref, computed, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { 
  faCheck, faQuestionCircle, faCheckCircle, faFileAlt, 
  faChevronLeft, faChevronRight, faMagic, faImage, faBook, faRefresh
} from '@fortawesome/free-solid-svg-icons'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { useCourseStore } from '@/store/modules/course'
import DocumentParser from '@/shared/services/documentParser'
import type { Chapter, Course } from '@/types/course'

// 添加图标到库
library.add(faCheck, faQuestionCircle, faCheckCircle, faFileAlt, faChevronLeft, faChevronRight, faMagic, faImage, faBook, faRefresh)

// Props
interface Props {
  chapterId: string
  course: Course | null
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  chapterCompleted: [chapterId: string]
  navigateChapter: [direction: 'prev' | 'next']
}>()

// 响应式数据
const loading = ref(false)
const chapter = ref<Chapter | null>(null)
const markingCompleted = ref(false)
const enrichingContent = ref(false)

// 交互式内容相关状态
const showingInteractive = ref(false) // 当前显示模式
const interactiveContent = ref<string>('') // SVG内容
const loadingInteractive = ref(false) // 加载状态
const regenerating = ref(false) // 重新生成状态

const courseStore = useCourseStore()
const documentParser = new DocumentParser()

// 计算属性
const chapterIndex = computed(() => {
  if (!props.course?.chapters || !chapter.value) return 0
  return props.course.chapters.findIndex((c: Chapter) => c.id === chapter.value!.id)
})

const totalChapters = computed(() => {
  return props.course?.chapters?.length || 0
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

// 新增计算属性
const hasAnyContent = computed(() => {
  return !!(chapter.value?.content || interactiveContent.value || chapter.value?.hasInteractiveContent)
})

const sanitizedInteractiveContent = computed(() => {
  if (!interactiveContent.value) return ''
  
  // 先清理HTML内容
  let cleanedContent = DOMPurify.sanitize(interactiveContent.value, {
    ADD_TAGS: ['svg', 'path', 'circle', 'rect', 'line', 'polygon', 'polyline', 'g', 'text', 'animate', 'animateTransform', 'defs', 'clipPath', 'mask', 'pattern', 'linearGradient', 'radialGradient', 'stop', 'style', 'script'],
    ADD_ATTR: ['viewBox', 'xmlns', 'fill', 'stroke', 'stroke-width', 'stroke-dasharray', 'd', 'cx', 'cy', 'r', 'x', 'y', 'width', 'height', 'transform', 'class', 'id', 'onclick', 'onmouseover', 'onmouseout', 'onmousedown', 'onmouseup', 'onmousemove', 'onmouseleave', 'onmouseenter', 'data-*', 'aria-*', 'role', 'tabindex'],
    ALLOW_DATA_ATTR: true,
    ALLOW_UNKNOWN_PROTOCOLS: false
  })
  
  // 处理JavaScript代码，将内联事件处理器转换为安全的方式
  cleanedContent = processInteractiveContent(cleanedContent)
  
  return cleanedContent
})

// 处理交互式内容中的JavaScript
const processInteractiveContent = (content: string): string => {
  // 创建一个临时的DOM元素来解析HTML
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = content
  
  // 查找所有SVG元素
  const svgElements = tempDiv.querySelectorAll('svg')
  
  svgElements.forEach(svg => {
    // 移除所有内联事件处理器
    const attributesToRemove = ['onclick', 'onmouseover', 'onmouseout', 'onmousedown', 'onmouseup', 'onmousemove', 'onmouseleave', 'onmouseenter']
    
    attributesToRemove.forEach(attr => {
      svg.removeAttribute(attr)
      // 也移除所有子元素上的这些属性
      svg.querySelectorAll('*').forEach(element => {
        element.removeAttribute(attr)
      })
    })
    
    // 添加CSS类来支持交互效果
    svg.classList.add('interactive-svg')
    
    // 为SVG添加基本的交互样式
    if (!svg.querySelector('style')) {
      const style = document.createElement('style')
      style.textContent = `
        .interactive-svg {
          cursor: pointer;
        }
        .interactive-svg * {
          transition: all 0.3s ease;
        }
        .interactive-svg:hover * {
          opacity: 0.8;
        }
      `
      svg.appendChild(style)
    }
  })
  
  return tempDiv.innerHTML
}

// 方法 - 需要在使用前定义
const loadChapterContent = async (chapterId: string) => {
  try {
    loading.value = true
    
    // 加载章节基本信息
    if (props.course?.chapters) {
      const chapterData = props.course.chapters.find(c => c.id === chapterId)
      if (chapterData) {
        chapter.value = chapterData
      } else {
        throw new Error('章节不存在')
      }
    } else {
      throw new Error('课程信息不完整')
    }
    
    // 尝试加载交互式内容
    const content = await courseStore.getChapterInteractiveContent(chapterId)
    if (content) {
      interactiveContent.value = content
    }
    
    // 如果有交互内容但没有文本内容，默认显示交互内容
    if (content && !chapter.value?.content) {
      showingInteractive.value = true
    }
  } catch (error) {
    console.error('获取章节信息失败:', error)
    ElMessage.error('获取章节信息失败')
  } finally {
    loading.value = false
  }
}

// 监听章节ID变化
watch(() => props.chapterId, async (newChapterId) => {
  if (newChapterId) {
    await loadChapterContent(newChapterId)
  }
}, { immediate: true })

// 生命周期
onMounted(() => {
  if (props.chapterId) {
    loadChapterContent(props.chapterId)
  }
})

const fetchChapter = async (chapterId: string) => {
  // 保持向后兼容，调用新的loadChapterContent方法
  await loadChapterContent(chapterId)
}

const markCompleted = async () => {
  if (!chapter.value?.id) return
  
  try {
    markingCompleted.value = true
    // 直接更新本地状态，因为章节数据来自父组件
    chapter.value.isCompleted = true
    emit('chapterCompleted', chapter.value.id)
    ElMessage.success('章节标记为已完成')
  } catch (error) {
    console.error('标记章节完成失败:', error)
    ElMessage.error('标记章节完成失败')
  } finally {
    markingCompleted.value = false
  }
}

const startPractice = () => {
  if (props.course?.id) {
    // 这里可以跳转到练习页面，或者触发练习弹窗
    ElMessage.info('练习功能开发中...')
  }
}

const goToPreviousChapter = () => {
  if (hasPreviousChapter.value) {
    emit('navigateChapter', 'prev')
  }
}

const goToNextChapter = () => {
  if (hasNextChapter.value) {
    emit('navigateChapter', 'next')
  }
}

const enrichContent = async () => {
  if (!chapter.value || !props.course) return
  
  try {
    enrichingContent.value = true
    
    // 使用AI为当前章节生成更详细的内容
    const enrichedContent = await documentParser.enrichChapterContent(
      props.course.title,
      chapter.value.title,
      chapter.value.description,
      props.course.uploadedFileId || ''
    )
    
    // 更新本地状态
    chapter.value.content = enrichedContent
    
    ElMessage.success('章节内容已生成')
  } catch (error) {
    console.error('生成章节内容失败:', error)
    ElMessage.error('生成章节内容失败')
  } finally {
    enrichingContent.value = false
  }
}

// 交互式内容相关方法
const toggleContentMode = () => {
  showingInteractive.value = !showingInteractive.value
  
  // 切换到交互模式且还没加载内容时，尝试加载
  if (showingInteractive.value && !interactiveContent.value) {
    loadChapterContent(props.chapterId)
  }
}

const generateInteractive = async () => {
  if (!chapter.value || !props.course) return
  
  try {
    loadingInteractive.value = true
    
    const content = await courseStore.generateInteractiveContent(
      chapter.value.id,
      props.course.title,
      chapter.value.title,
      chapter.value.description,
      chapter.value.content || ''
    )
    interactiveContent.value = content
    
    ElMessage.success('交互式内容生成成功')
  } catch (error) {
    console.error('生成失败:', error)
    ElMessage.error('生成交互式内容失败，请重试')
  } finally {
    loadingInteractive.value = false
  }
}

const regenerateInteractive = async () => {
  regenerating.value = true
  interactiveContent.value = ''
  await generateInteractive()
  regenerating.value = false
}
</script>

<style lang="scss" scoped>
.chapter-content {
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
    flex-wrap: wrap;
  }
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
      margin: 0 0 24px 0;
    }
    
    .empty-actions {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      justify-content: center;
    }
  }
  
  // 交互式内容样式
  .interactive-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    
    .loading-content {
      text-align: center;
      padding: 40px;
      
      .loading-tip {
        margin-top: 16px;
        color: var(--brand-text-secondary);
      }
    }
    
    .svg-viewer {
      flex: 1;
      display: flex;
      flex-direction: column;
      
      .interactive-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 24px;
        border-bottom: 1px solid var(--brand-border);
        background: var(--brand-bg-secondary);
        
        h3 {
          margin: 0;
          font-size: 16px;
          color: var(--brand-text-primary);
        }
        
        .interactive-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }
      }
      
      .svg-container {
        flex: 1;
        overflow: auto;
        padding: 24px;
        background: var(--brand-bg-primary);
        
        // 确保HTML内容适应父容器
        :deep(*) {
          box-sizing: border-box;
        }
        
        :deep(div) {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        
        :deep(svg) {
          max-width: 100%;
          height: auto;
          display: block;
          margin: 0 auto;
        }
        
        :deep(img) {
          max-width: 100%;
          height: auto;
        }
        
        :deep(table) {
          width: 100%;
          max-width: 100%;
        }
        
        :deep(style) {
          display: none; // 隐藏内联样式，避免影响全局样式
        }
      }
    }
    
    .empty-interactive {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      padding: 40px;
      
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
        color: var(--brand-text-secondary);
        margin: 0 0 24px 0;
      }
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
