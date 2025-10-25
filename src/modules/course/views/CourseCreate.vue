<template>
  <div class="course-create">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">创建课程</h1>
        <p class="page-description">上传文档，AI将自动为您生成课程大纲</p>
      </div>
      <div class="header-actions">
        <el-button @click="goBack">
          <FontAwesomeIcon :icon="['fas', 'arrow-left']" class="mr-2" />
          返回
        </el-button>
      </div>
    </div>

    <!-- 创建步骤 -->
    <div class="create-steps">
      <el-steps :active="currentStep" finish-status="success">
        <el-step title="上传文档" description="上传课程源文档" />
        <el-step title="AI生成课程" description="AI生成课程信息和大纲" />
        <el-step title="完成创建" description="保存课程" />
      </el-steps>
    </div>

    <!-- 步骤内容 -->
    <div class="step-content">
      <!-- 步骤1: 上传文档 -->
      <div v-if="currentStep === 0" class="step-panel">
        <el-card>
          <template #header>
            <h3>上传课程文档</h3>
          </template>
          
          <div class="upload-section">
            <el-upload
              ref="uploadRef"
              :before-upload="handleFileUpload"
              :show-file-list="false"
              accept=".pdf,.doc,.docx,.txt"
              drag
            >
              <div class="upload-area">
                <div class="upload-icon">
                  <FontAwesomeIcon :icon="['fas', 'cloud-upload-alt']" />
                </div>
                <div class="upload-text">
                  <p>点击或拖拽文件到此处上传</p>
                  <p class="upload-tip">支持 PDF、DOC、DOCX、TXT 格式，文件大小不超过50MB</p>
                </div>
              </div>
            </el-upload>
            
            <div v-if="uploadedFile" class="file-info">
              <div class="file-item">
                <FontAwesomeIcon :icon="['fas', 'file']" class="file-icon" />
                <div class="file-details">
                  <div class="file-name">{{ uploadedFile.name }}</div>
                  <div class="file-size">{{ formatFileSize(uploadedFile.size) }}</div>
                </div>
                <el-button type="text" @click="removeFile">
                  <FontAwesomeIcon :icon="['fas', 'times']" />
                </el-button>
              </div>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 步骤2: AI生成课程 -->
      <div v-if="currentStep === 1" class="step-panel">
        <el-card>
          <template #header>
            <h3>AI生成课程信息和大纲</h3>
            <p v-if="courseOutline && !isGeneratingOutline && !streamingUI.isStreaming" class="step-hint">
              课程信息已生成完成，您可以编辑内容，然后点击"下一步"保存课程。
            </p>
          </template>
          
          <!-- 进度状态提示 -->
          <div v-if="streamingUI.currentPhase" class="progress-indicator">
            <el-icon><Loading /></el-icon>
            {{ streamingUI.currentPhase }}
          </div>
          
          <!-- 解析状态 -->
          <div v-if="parsingStatus" class="parsing-status" :class="parsingStatus.type">
            <el-icon v-if="parsingStatus.type === 'info'"><Loading /></el-icon>
            <el-icon v-else-if="parsingStatus.type === 'success'"><Check /></el-icon>
            <el-icon v-else-if="parsingStatus.type === 'error'"><Close /></el-icon>
            {{ parsingStatus.message }}
          </div>

          <!-- Markdown流式渲染区域 -->
          <div class="markdown-streaming-container">
           

            <!-- 原始Markdown预览 -->
            <div v-if="streamingUI.markdownContent" class="markdown-preview">
              <div class="markdown-header">
                <h4>实时预览</h4>
                <div class="streaming-indicator" v-if="streamingUI.isStreaming">
                  <el-icon><Loading /></el-icon>
                  <span>正在生成...</span>
                </div>
              </div>
              <div 
                ref="markdownContentRef"
                class="markdown-content"
                v-html="streamingUI.renderedMarkdown"
              ></div>
            </div>

            <!-- 课程信息展示 -->
            <div v-if="streamingUI.courseInfo.title.content || streamingUI.courseInfo.description.content" class="course-info-display">
              <!-- 课程概览卡片 -->
              <div class="course-overview-card">
                <div class="course-header">
                  <div class="course-title-area">
                    <h3 v-if="streamingUI.courseInfo.title.content" class="course-title">
                      {{ streamingUI.courseInfo.title.content }}
                    </h3>
                    <div v-else class="course-title-placeholder">
                      <el-skeleton-item variant="text" style="width: 60%" />
                    </div>
                  </div>
                  <div class="course-meta">
                    <el-tag 
                      v-if="streamingUI.courseInfo.level.content" 
                      :type="getLevelTagType(streamingUI.courseInfo.level.content)"
                      size="large"
                      class="level-tag"
                    >
                      {{ streamingUI.courseInfo.level.content }}
                    </el-tag>
                    <div v-else class="level-placeholder">
                      <el-skeleton-item variant="rect" style="width: 80px; height: 24px" />
                    </div>
                  </div>
                </div>
                
                <div class="course-description-area">
                  <p v-if="streamingUI.courseInfo.description.content" class="course-description">
                    {{ streamingUI.courseInfo.description.content }}
                  </p>
                  <div v-else class="description-placeholder">
                    <el-skeleton-item variant="text" :rows="3" />
                  </div>
                </div>
              </div>

              <!-- 学习目标卡片 -->
              <div v-if="streamingUI.objectives.items.length > 0" class="objectives-card">
                <div class="card-header">
                  <h4 class="card-title">
                    <el-icon><Aim /></el-icon>
                    学习目标
                  </h4>
                  <el-tag type="info" size="small">{{ streamingUI.objectives.items.length }}个目标</el-tag>
                </div>
                <div class="objectives-grid">
                  <div 
                    v-for="(objective, index) in streamingUI.objectives.items" 
                    :key="index" 
                    class="objective-card"
                  >
                    <div class="objective-number">{{ index + 1 }}</div>
                    <div class="objective-text">{{ objective }}</div>
                  </div>
                </div>
              </div>

              <!-- 课程章节卡片 -->
              <div v-if="streamingUI.chapters.items.length > 0" class="chapters-card">
                <div class="card-header">
                  <h4 class="card-title">
                    <el-icon><List /></el-icon>
                    课程章节
                  </h4>
                  <el-tag type="success" size="small">{{ streamingUI.chapters.items.length }}个章节</el-tag>
                </div>
                <div class="chapters-timeline">
                  <div 
                    v-for="(chapter, index) in streamingUI.chapters.items" 
                    :key="index" 
                    class="chapter-timeline-item"
                  >
                    <div class="timeline-marker">
                      <div class="marker-number">{{ chapter.order }}</div>
                    </div>
                    <div class="timeline-content">
                      <div class="chapter-card">
                        <div class="chapter-header">
                          <h5 class="chapter-title">{{ chapter.title }}</h5>
                          <el-tag v-if="chapter.duration > 0" size="small" type="info">
                            {{ chapter.duration }}分钟
                          </el-tag>
                        </div>
                        <p class="chapter-description">{{ chapter.description }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 等待状态 -->
            <div v-if="!streamingUI.markdownContent && !streamingUI.courseInfo.title.content" class="waiting-state">
              <div class="waiting-content">
                <el-icon class="waiting-icon"><Loading /></el-icon>
                <p>正在分析文档内容，准备生成课程信息...</p>
              </div>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 步骤3: 完成创建 -->
      <div v-if="currentStep === 2" class="step-panel">
        <el-card>
          <template #header>
            <h3>课程创建完成</h3>
          </template>
          
          <div class="completion-info">
            <div class="success-icon">
              <FontAwesomeIcon :icon="['fas', 'check-circle']" />
            </div>
            <h4>课程创建成功！</h4>
            <p>您的课程"{{ courseForm.title }}"已经创建完成，现在可以开始编辑章节内容或开始学习。</p>
            
            <div class="completion-actions">
              <el-button type="primary" @click="goToCourse">
                <FontAwesomeIcon :icon="['fas', 'eye']" class="mr-2" />
                查看课程
              </el-button>
              <el-button @click="goToEdit">
                <FontAwesomeIcon :icon="['fas', 'edit']" class="mr-2" />
                编辑课程
              </el-button>
              <el-button @click="goToCourseList">
                <FontAwesomeIcon :icon="['fas', 'list']" class="mr-2" />
                返回列表
              </el-button>
              <el-button @click="goToCreateAnother">
                <FontAwesomeIcon :icon="['fas', 'plus']" class="mr-2" />
                创建新课程
              </el-button>
            </div>
          </div>
        </el-card>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="step-actions">
      <el-button v-if="currentStep > 0" @click="prevStep">
        <FontAwesomeIcon :icon="['fas', 'arrow-left']" class="mr-2" />
        上一步
      </el-button>
      
      <div class="right-buttons">
        <!-- 步骤1的编辑按钮 -->
        <el-button 
          v-if="currentStep === 1 && courseOutline && !isGeneratingOutline && !streamingUI.isStreaming"
          type="default" 
          :icon="Edit"
          @click="openEditDialog"
          class="edit-course-btn"
        >
          编辑课程信息
        </el-button>
        
        <el-button 
          v-if="currentStep < 2" 
          type="primary" 
          @click="nextStep"
          :loading="loading"
          :disabled="!canProceed"
        >
          下一步
          <FontAwesomeIcon :icon="['fas', 'arrow-right']" class="ml-2" />
        </el-button>
      </div>
    </div>

    <!-- 编辑课程信息对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      width="900px"
      top="80px"
      :close-on-click-modal="false"
      class="edit-dialog"
      :show-close="false"
    >
      <div class="dialog-content">
        <div class="dialog-header">
          <h3 class="dialog-title">
            <el-icon><Edit /></el-icon>
            编辑课程信息
          </h3>
          <p class="dialog-subtitle">您可以修改AI生成的课程内容，让课程更符合您的需求</p>
        </div>
          
        <div class="dialog-body">
          <el-form
            ref="editFormRef"
            :model="editForm"
            :rules="editFormRules"
            label-width="100px"
            label-position="top"
            class="edit-form"
          >
        <el-form-item label="课程标题" prop="title">
          <el-input
            v-model="editForm.title"
            placeholder="请输入课程标题"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="课程描述" prop="description">
          <el-input
            v-model="editForm.description"
            type="textarea"
            :rows="4"
            placeholder="请输入课程描述"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="难度级别" prop="level">
          <el-select v-model="editForm.level" placeholder="请选择难度级别" style="width: 200px">
            <el-option label="初级" value="初级" />
            <el-option label="中级" value="中级" />
            <el-option label="高级" value="高级" />
          </el-select>
        </el-form-item>

        <el-form-item label="学习目标">
          <div class="objectives-edit">
            <div 
              v-for="(_, index) in editForm.objectives" 
              :key="index" 
              class="objective-edit-item"
            >
              <el-input
                v-model="editForm.objectives[index]"
                :placeholder="`学习目标 ${index + 1}`"
                maxlength="200"
                show-word-limit
                size="large"
              />
              <el-button 
                type="danger" 
                :icon="Delete" 
                circle 
                size="large"
                @click="removeObjective(index)"
                :disabled="editForm.objectives.length <= 1"
              />
            </div>
            <el-button 
              type="primary" 
              :icon="Plus" 
              size="large"
              @click="addObjective"
              :disabled="editForm.objectives.length >= 10"
              class="add-objective-btn"
            >
              添加学习目标
            </el-button>
          </div>
        </el-form-item>

        <el-form-item label="课程章节">
          <div class="chapters-edit">
            <div 
              v-for="(chapter, index) in editForm.chapters" 
              :key="index" 
              class="chapter-edit-item"
            >
              <div class="chapter-edit-header">
                <span class="chapter-number">第{{ chapter.order }}章</span>
                <el-button 
                  type="danger" 
                  :icon="Delete" 
                  circle 
                  size="large"
                  @click="removeChapter(index)"
                  :disabled="editForm.chapters.length <= 1"
                />
              </div>
              <div class="chapter-form-grid">
                <el-form-item :label="`章节标题`" :prop="`chapters.${index}.title`" class="chapter-title-field">
                  <el-input
                    v-model="chapter.title"
                    placeholder="请输入章节标题"
                    maxlength="100"
                    show-word-limit
                    size="large"
                  />
                </el-form-item>
                <el-form-item :label="`预计时长（分钟）`" :prop="`chapters.${index}.duration`" class="chapter-duration-field">
                  <el-input-number
                    v-model="chapter.duration"
                    :min="1"
                    :max="300"
                    placeholder="请输入预计时长"
                    size="large"
                    controls-position="right"
                  />
                </el-form-item>
              </div>
              <el-form-item :label="`章节描述`" :prop="`chapters.${index}.description`" class="chapter-description-field">
                <el-input
                  v-model="chapter.description"
                  type="textarea"
                  :rows="3"
                  placeholder="请输入章节描述"
                  maxlength="300"
                  show-word-limit
                  size="large"
                />
              </el-form-item>
            </div>
            <el-button 
              type="primary" 
              :icon="Plus" 
              size="large"
              @click="addChapter"
              :disabled="editForm.chapters.length >= 20"
              class="add-chapter-btn"
            >
              添加章节
            </el-button>
          </div>
        </el-form-item>
          </el-form>
        </div>
        
        <div class="dialog-footer">
          <div class="footer-actions">
            <el-button @click="cancelEdit">
              <el-icon><Close /></el-icon>
              取消
            </el-button>
            <el-button 
              type="primary" 
              @click="saveEdit" 
              :loading="editSaving"
              class="save-button"
            >
              <el-icon v-if="!editSaving"><Check /></el-icon>
              {{ editSaving ? '保存中...' : '保存修改' }}
            </el-button>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, nextTick } from 'vue'
import { Loading, Check, Close, Edit, Delete, Plus } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useCourseStore } from '@/store/modules/course'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { 
  faArrowLeft, 
  faArrowRight, 
  faCloudUploadAlt, 
  faFile, 
  faTimes, 
  faCheckCircle, 
  faEye, 
  faEdit, 
  faPlus
} from '@fortawesome/free-solid-svg-icons'
// import { useCourseStore } from '@/store/modules/course'
import DocumentParser from '@/shared/services/documentParser'
// import { marked } from 'marked' // 不再需要，使用JSON解析
import type { CourseCreateForm, CourseLevel } from '@/types/course'

// 添加图标到库
library.add(
  faArrowLeft, faArrowRight, faCloudUploadAlt, faFile, faTimes, 
  faCheckCircle, faEye, faEdit, faPlus
)

const router = useRouter()
const courseStore = useCourseStore()

// 响应式数据
const currentStep = ref(0)
const loading = ref(false)
// const formRef = ref<InstanceType<typeof ElForm>>()
const uploadedFile = ref<File | null>(null)
const courseOutline = ref<any>(null)
const createdCourseId = ref<string>('')

const parsingStatus = ref<{
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
} | null>(null)

// 流式输出相关
const isGeneratingOutline = ref(false)

// 流式UI状态管理
const streamingUI = reactive({
  courseInfo: {
    title: { content: '', isGenerating: false },
    description: { content: '', isGenerating: false },
    level: { content: '', isGenerating: false }
  },
  objectives: {
    items: [] as string[],
    currentGenerating: -1
  },
  chapters: {
    items: [] as Array<{
      title: string
      description: string
      duration: number
      order: number
      content: string
      isGenerating: boolean
    }>,
    currentGenerating: -1
  },
  currentPhase: '', // 当前生成阶段
  markdownContent: '', // 原始Markdown内容
  renderedMarkdown: '', // 渲染后的HTML
  isStreaming: false // 是否正在流式生成
})

// 正则测试相关状态
// 移除正则测试相关变量
const titleMatchResult = ref(false)
const descMatchResult = ref(false)
const levelMatchResult = ref(false)
const objectivesMatchResult = ref(false)
const chaptersMatchResult = ref(false)

const courseForm = ref<CourseCreateForm>({
  title: '',
  description: '',
  level: 'intermediate' as CourseLevel
})

// 编辑对话框相关
const editDialogVisible = ref(false)
const editSaving = ref(false)
const editFormRef = ref()
const markdownContentRef = ref()

const editForm = reactive({
  title: '',
  description: '',
  level: '',
  objectives: [] as string[],
  chapters: [] as Array<{
    order: number
    title: string
    description: string
    duration: number
    content: string
  }>
})

const editFormRules = {
  title: [
    { required: true, message: '请输入课程标题', trigger: 'blur' },
    { min: 2, max: 100, message: '标题长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入课程描述', trigger: 'blur' },
    { min: 10, max: 500, message: '描述长度在 10 到 500 个字符', trigger: 'blur' }
  ],
  level: [
    { required: true, message: '请选择难度级别', trigger: 'change' }
  ]
}

// const formRules = {
//   title: [
//     { required: true, message: '请输入课程标题', trigger: 'blur' },
//     { min: 2, max: 100, message: '标题长度在 2 到 100 个字符', trigger: 'blur' }
//   ],
//   description: [
//     { required: true, message: '请输入课程描述', trigger: 'blur' },
//     { min: 10, max: 500, message: '描述长度在 10 到 500 个字符', trigger: 'blur' }
//   ],
//   level: [
//     { required: true, message: '请选择难度级别', trigger: 'change' }
//   ]
// }

// 计算属性
const canProceed = computed(() => {
  switch (currentStep.value) {
    case 0:
      return uploadedFile.value !== null
    case 1:
      // 步骤1：课程生成完成且不在生成中
      return courseOutline.value !== null && !isGeneratingOutline.value && !streamingUI.isStreaming
    default:
      return true
  }
})

// 方法
const goBack = () => {
  router.push('/courses')
}

const nextStep = async () => {
  if (currentStep.value < 2) {
    currentStep.value++
  }
  
  // 如果进入步骤1（AI生成课程），自动开始生成
  if (currentStep.value === 1) {
    await generateCourse()
  }
  
  // 如果从步骤1进入步骤2（保存课程），执行保存操作
  if (currentStep.value === 2) {
    try {
      loading.value = true
      await saveCourse()
    } catch (error) {
      console.error('保存课程失败:', error)
      ElMessage.error('保存课程失败，请重试')
      // 保存失败时回退到步骤1
      currentStep.value = 1
    } finally {
      loading.value = false
    }
  }
}

const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

const handleFileUpload = (file: File) => {
  // 验证文件类型
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ]
  
  if (!allowedTypes.includes(file.type)) {
    ElMessage.error('只支持PDF、DOC、DOCX、TXT格式的文件')
    return false
  }
  
  // 验证文件大小
  if (file.size > 50 * 1024 * 1024) {
    ElMessage.error('文件大小不能超过50MB')
    return false
  }
  
  uploadedFile.value = file
  
  // 自动进入下一步（会自动开始生成大纲）
  setTimeout(() => {
    nextStep()
  }, 500)
  
  return false // 阻止自动上传
}

const removeFile = () => {
  uploadedFile.value = null
}

// 切换正则测试显示
// 移除正则测试相关方法

const generateCourse = async () => {
  if (!uploadedFile.value) return
  
  try {
    loading.value = true
    isGeneratingOutline.value = true
    streamingUI.isStreaming = true
    
    // 重置流式UI状态
    streamingUI.courseInfo.title.content = ''
    streamingUI.courseInfo.title.isGenerating = false
    streamingUI.courseInfo.description.content = ''
    streamingUI.courseInfo.description.isGenerating = false
    streamingUI.courseInfo.level.content = ''
    streamingUI.courseInfo.level.isGenerating = false
    streamingUI.objectives.items = []
    streamingUI.objectives.currentGenerating = -1
    streamingUI.chapters.items = []
    streamingUI.chapters.currentGenerating = -1
    streamingUI.currentPhase = ''
    streamingUI.markdownContent = ''
    streamingUI.renderedMarkdown = ''
    
    parsingStatus.value = {
      message: '正在上传文档到Kimi...',
      type: 'info'
    }

    // 创建文档解析服务
    const documentParser = new DocumentParser()
    
    // 上传并解析文档（JSON生成方法内部会处理）
    // const result = await documentParser.parseDocument(uploadedFile.value)
    
    parsingStatus.value = {
      message: '正在生成课程信息和大纲...',
      type: 'info'
    }

    // 实时解析JSON内容的函数
    const parseStreamingJson = (jsonStr: string) => {
      console.log('解析JSON内容:', jsonStr) // 调试信息
      
      try {
        // 清理JSON字符串，移除可能的markdown代码块标记
        let cleanJson = jsonStr.trim()
        if (cleanJson.startsWith('```json')) {
          cleanJson = cleanJson.replace(/^```json\s*/, '').replace(/\s*```$/, '')
        } else if (cleanJson.startsWith('```')) {
          cleanJson = cleanJson.replace(/^```\s*/, '').replace(/\s*```$/, '')
        }
        
        const courseData = JSON.parse(cleanJson)
        
        // 解析课程标题
        if (courseData.courseTitle) {
          titleMatchResult.value = true
          if (!streamingUI.courseInfo.title.content) {
            streamingUI.courseInfo.title.content = courseData.courseTitle
            console.log('解析到课程标题:', streamingUI.courseInfo.title.content)
          }
        } else {
          titleMatchResult.value = false
        }

        // 解析课程描述
        if (courseData.courseDescription) {
          descMatchResult.value = true
          if (!streamingUI.courseInfo.description.content) {
            streamingUI.courseInfo.description.content = courseData.courseDescription
            console.log('解析到课程描述:', streamingUI.courseInfo.description.content)
          }
        } else {
          descMatchResult.value = false
        }

        // 解析难度级别
        if (courseData.difficulty) {
          levelMatchResult.value = true
          if (!streamingUI.courseInfo.level.content) {
            streamingUI.courseInfo.level.content = courseData.difficulty
            console.log('解析到难度级别:', streamingUI.courseInfo.level.content)
          }
        } else {
          levelMatchResult.value = false
        }

        // 解析学习目标
        if (courseData.learningObjectives && Array.isArray(courseData.learningObjectives)) {
          objectivesMatchResult.value = true
          if (streamingUI.objectives.items.length === 0) {
            streamingUI.objectives.items = courseData.learningObjectives
            console.log('解析到学习目标:', courseData.learningObjectives)
          }
        } else {
          objectivesMatchResult.value = false
        }

        // 解析章节
        if (courseData.chapters && Array.isArray(courseData.chapters)) {
          chaptersMatchResult.value = true
          if (streamingUI.chapters.items.length === 0) {
            streamingUI.chapters.items = courseData.chapters.map((chapter: any) => ({
              order: chapter.order,
              title: chapter.title,
              description: chapter.description,
              duration: chapter.durationMinutes || 0,
              content: chapter.content || '', // 添加章节内容字段
              isGenerating: false
            }))
            console.log('解析到章节:', courseData.chapters)
          }
        } else {
          chaptersMatchResult.value = false
        }
        
      } catch (error) {
        console.log('JSON解析失败，内容可能不完整:', error)
        // 不设置matched为false，因为可能是内容不完整导致的解析失败
      }
      
      // 备用解析策略 - 如果主要正则失败，尝试更宽松的匹配
      // JSON解析不需要备用方法，因为JSON结构更稳定
    }

    // 使用JSON流式生成课程
    const outline = await documentParser.generateCourseJsonStream(
      uploadedFile.value,
      (jsonStr, isComplete) => {
        streamingUI.markdownContent = jsonStr
        streamingUI.renderedMarkdown = `<pre>${jsonStr}</pre>`
        
        // 自动滚动到底部，显示最新内容
        scrollToBottom()
        
        // 实时解析JSON内容
        if (isComplete) {
          streamingUI.isStreaming = false
          // 流式输出完成后进行完整解析
          parseStreamingJson(jsonStr)
        } else {
          // 流式输出过程中进行实时解析
          console.log('实时解析中，JSON长度:', jsonStr.length)
          parseStreamingJson(jsonStr)
        }
      }
    )

    // 流式输出完成，设置大纲数据并自动填充表单
    courseOutline.value = outline
    isGeneratingOutline.value = false
    
    // 自动填充表单
    courseForm.value.title = outline.courseTitle
    courseForm.value.description = outline.courseDescription
    courseForm.value.level = outline.difficulty as CourseLevel

    // 显示成功消息
    parsingStatus.value = {
      message: '课程生成完成！请检查并编辑课程信息，然后点击下一步保存课程。',
      type: 'success'
    }
    
    // 2秒后隐藏状态消息
    setTimeout(() => {
      parsingStatus.value = null
    }, 3000)

  } catch (error) {
    console.error('生成课程失败:', error)
    isGeneratingOutline.value = false
    streamingUI.isStreaming = false
    parsingStatus.value = {
      message: `生成课程失败: ${error instanceof Error ? error.message : '未知错误'}`,
      type: 'error'
    }
  } finally {
    loading.value = false
  }
}

// 保存课程方法
const saveCourse = async () => {
  try {
    // 创建课程
    const course = await courseStore.createCourse({
      title: courseForm.value.title,
      description: courseForm.value.description,
      level: courseForm.value.level
    })
    
    createdCourseId.value = course.id
    
    // 如果有大纲，创建章节
    if (courseOutline.value && courseOutline.value.chapters) {
      for (const chapterData of courseOutline.value.chapters) {
        await courseStore.createChapter(course.id, {
          title: chapterData.title,
          description: chapterData.description,
          content: chapterData.content,
          orderIndex: chapterData.order,
          durationMinutes: chapterData.durationMinutes
        })
      }
    }
    
    ElMessage.success('课程创建成功！')
    
  } catch (error) {
    console.error('创建课程失败:', error)
    ElMessage.error('创建课程失败')
    throw error // 重新抛出错误，让调用方处理
  }
}

const goToCourse = () => {
  router.push(`/courses/${createdCourseId.value}`)
}

const goToEdit = () => {
  router.push(`/courses/${createdCourseId.value}/edit`)
}

const goToCourseList = () => {
  router.push('/courses')
}

const goToCreateAnother = () => {
  // 重置表单
  currentStep.value = 0
  courseForm.value = {
    title: '',
    description: '',
    level: 'intermediate' as CourseLevel
  }
  uploadedFile.value = null
  courseOutline.value = null
  createdCourseId.value = ''
  parsingStatus.value = null
  // 重置流式UI状态
  streamingUI.courseInfo.title.content = ''
  streamingUI.courseInfo.title.isGenerating = false
  streamingUI.courseInfo.description.content = ''
  streamingUI.courseInfo.description.isGenerating = false
  streamingUI.courseInfo.level.content = ''
  streamingUI.courseInfo.level.isGenerating = false
  streamingUI.objectives.items = []
  streamingUI.objectives.currentGenerating = -1
  streamingUI.chapters.items = []
  streamingUI.chapters.currentGenerating = -1
  streamingUI.currentPhase = ''
  streamingUI.markdownContent = ''
  streamingUI.renderedMarkdown = ''
  streamingUI.isStreaming = false
}

// 工具函数
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 获取难度级别标签类型
const getLevelTagType = (level: string) => {
  switch (level) {
    case '初级':
      return 'success'
    case '中级':
      return 'warning'
    case '高级':
      return 'danger'
    default:
      return 'info'
  }
}

// 自动滚动到底部的方法
const scrollToBottom = () => {
  nextTick(() => {
    if (markdownContentRef.value) {
      markdownContentRef.value.scrollTop = markdownContentRef.value.scrollHeight
    }
  })
}

// 编辑相关方法
const openEditDialog = () => {
  // 将当前解析的数据填充到编辑表单
  editForm.title = streamingUI.courseInfo.title.content || ''
  editForm.description = streamingUI.courseInfo.description.content || ''
  editForm.level = streamingUI.courseInfo.level.content || ''
  editForm.objectives = [...streamingUI.objectives.items]
  editForm.chapters = streamingUI.chapters.items.map(chapter => ({
    order: chapter.order,
    title: chapter.title,
    description: chapter.description,
    duration: chapter.duration,
    content: chapter.content
  }))
  
  editDialogVisible.value = true
}

const cancelEdit = () => {
  editDialogVisible.value = false
}

const saveEdit = async () => {
  if (!editFormRef.value) return
  
  try {
    await editFormRef.value.validate()
    editSaving.value = true
    
    // 更新显示的数据
    streamingUI.courseInfo.title.content = editForm.title
    streamingUI.courseInfo.description.content = editForm.description
    streamingUI.courseInfo.level.content = editForm.level
    streamingUI.objectives.items = [...editForm.objectives]
    streamingUI.chapters.items = editForm.chapters.map(chapter => ({
      ...chapter,
      isGenerating: false
    }))
    
    // 更新表单数据
    courseForm.value.title = editForm.title
    courseForm.value.description = editForm.description
    courseForm.value.level = editForm.level as CourseLevel
    
    ElMessage.success('课程信息已更新')
    editDialogVisible.value = false
  } catch (error) {
    console.error('表单验证失败:', error)
  } finally {
    editSaving.value = false
  }
}

const addObjective = () => {
  if (editForm.objectives.length < 10) {
    editForm.objectives.push('')
  }
}

const removeObjective = (index: number) => {
  if (editForm.objectives.length > 1) {
    editForm.objectives.splice(index, 1)
  }
}

const addChapter = () => {
  if (editForm.chapters.length < 20) {
    const newOrder = editForm.chapters.length + 1
    editForm.chapters.push({
      order: newOrder,
      title: '',
      description: '',
      duration: 30,
      content: ''
    })
  }
}

const removeChapter = (index: number) => {
  if (editForm.chapters.length > 1) {
    editForm.chapters.splice(index, 1)
    // 重新排序
    editForm.chapters.forEach((chapter, idx) => {
      chapter.order = idx + 1
    })
  }
}
</script>

<style lang="scss" scoped>
.course-create {
  padding: 24px;
  max-width: 800px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
  padding-bottom: 24px;
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
}

.create-steps {
  margin-bottom: 32px;
}

.step-content {
  margin-bottom: 32px;
}

.step-panel {
  .el-card {
    border-radius: var(--brand-radius-lg);
  }
}

.step-hint {
  margin: 8px 0 0 0;
  color: #67c23a;
  font-size: 14px;
  font-weight: 500;
}

.upload-section {
  .upload-area {
    padding: 40px;
    text-align: center;
    border: 2px dashed var(--brand-border);
    border-radius: var(--brand-radius-base);
    background: var(--brand-bg-secondary);

    .upload-icon {
      font-size: 48px;
      color: var(--brand-primary);
      margin-bottom: 16px;
    }

    .upload-text {
      p {
        margin: 0 0 8px 0;
        color: var(--brand-text-primary);
        font-size: 16px;
      }

      .upload-tip {
        color: var(--brand-text-secondary);
        font-size: 14px;
      }
    }
  }

  .file-info {
    margin-top: 16px;

    .file-item {
      display: flex;
      align-items: center;
      padding: 12px;
      background: var(--brand-bg-secondary);
      border-radius: var(--brand-radius-base);
      border: 1px solid var(--brand-border);

      .file-icon {
        font-size: 24px;
        color: var(--brand-primary);
        margin-right: 12px;
      }

      .file-details {
        flex: 1;

        .file-name {
          font-weight: 500;
          color: var(--brand-text-primary);
          margin-bottom: 4px;
        }

        .file-size {
          font-size: 14px;
          color: var(--brand-text-secondary);
        }
      }
    }
  }
}

.parsing-status {
  margin-bottom: 24px;
}

.course-outline {
  .outline-header {
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--brand-border);

    h4 {
      font-size: 20px;
      font-weight: 600;
      color: var(--brand-text-primary);
      margin: 0 0 8px 0;
    }

    p {
      color: var(--brand-text-secondary);
      margin: 0;
      line-height: 1.5;
    }
  }

  .outline-sections {
    .section {
      margin-bottom: 24px;

      h5 {
        font-size: 16px;
        font-weight: 600;
        color: var(--brand-text-primary);
        margin: 0 0 12px 0;
      }

      ul {
        margin: 0;
        padding-left: 20px;

        li {
          color: var(--brand-text-secondary);
          margin-bottom: 8px;
          line-height: 1.5;
        }
      }
    }

    .chapters-list {
      .chapter-item {
        margin-bottom: 16px;
        padding: 16px;
        background: var(--brand-bg-secondary);
        border-radius: var(--brand-radius-base);
        border: 1px solid var(--brand-border);

        .chapter-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;

          .chapter-order {
            background: var(--brand-primary);
            color: white;
            padding: 4px 8px;
            border-radius: var(--brand-radius-sm);
            font-size: 12px;
            font-weight: 500;
          }

          h6 {
            flex: 1;
            font-size: 16px;
            font-weight: 600;
            color: var(--brand-text-primary);
            margin: 0;
          }

          .chapter-duration {
            color: var(--brand-text-secondary);
            font-size: 14px;
          }
        }

        .chapter-description {
          color: var(--brand-text-secondary);
          margin: 0;
          line-height: 1.5;
        }
      }
    }
  }
}

.completion-info {
  text-align: center;
  padding: 40px 20px;

  .success-icon {
    font-size: 64px;
    color: var(--brand-success);
    margin-bottom: 16px;
  }

  h4 {
    font-size: 24px;
    font-weight: 600;
    color: var(--brand-text-primary);
    margin: 0 0 16px 0;
  }

  p {
    color: var(--brand-text-secondary);
    margin: 0 0 32px 0;
    line-height: 1.5;
  }

  .completion-actions {
    display: flex;
    gap: 12px;
    justify-content: center;
    flex-wrap: wrap;
  }
}

.step-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 24px;
  border-top: 1px solid var(--brand-border);
}

.step-actions .right-buttons {
  display: flex;
  align-items: center;
  gap: 12px;
}

// 编辑按钮样式在 .right-buttons 中通过 gap 控制间距

// 响应式设计
@media (max-width: 768px) {
  .course-create {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .step-actions {
    flex-direction: column;
    gap: 12px;
    
    .el-button {
      width: 100%;
    }
  }

  .completion-actions {
    flex-direction: column;
    
    .el-button {
      width: 100%;
    }
  }
}

// 流式输出样式
.streaming-output {
  min-height: 200px;
  padding: 16px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  background-color: #fafafa;
  margin-bottom: 16px;
  
  .streaming-content {
    position: relative;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 14px;
    line-height: 1.6;
    white-space: pre-wrap;
    word-wrap: break-word;
    color: #333;
    
    .streaming-text {
      min-height: 100px;
    }
    
    .cursor {
      display: inline-block;
      animation: blink 1s infinite;
      color: #409eff;
      font-weight: bold;
      margin-left: 2px;
    }
  }
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

.parsing-status {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
  padding: 12px;
  border-radius: 6px;
  font-size: 14px;
  
  &.info {
    background-color: #f0f9ff;
    color: #1890ff;
    border: 1px solid #bae7ff;
  }
  
  &.success {
    background-color: #f6ffed;
    color: #52c41a;
    border: 1px solid #b7eb8f;
  }
  
  &.error {
    background-color: #fff2f0;
    color: #ff4d4f;
    border: 1px solid #ffccc7;
  }
}

// 流式UI样式
.progress-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
  padding: 12px 16px;
  background-color: #f0f9ff;
  border: 1px solid #bae7ff;
  border-radius: 8px;
  color: #1890ff;
  font-size: 14px;
  font-weight: 500;
}

.streaming-course-info {
  .section-label {
    font-size: 16px;
    font-weight: 600;
    color: var(--brand-text-primary);
    margin: 0 0 12px 0;
    padding-bottom: 8px;
    border-bottom: 2px solid var(--brand-primary);
    display: inline-block;
  }

  .streaming-field {
    margin-bottom: 24px;
    min-height: 40px;
    
    .streaming-text {
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: 14px;
      line-height: 1.6;
      color: #333;
      white-space: pre-wrap;
      word-wrap: break-word;
      
      .cursor {
        display: inline-block;
        animation: blink 1s infinite;
        color: #409eff;
        font-weight: bold;
        margin-left: 2px;
      }
    }
    
    .completed-text {
      font-size: 14px;
      line-height: 1.6;
      color: var(--brand-text-primary);
      white-space: pre-wrap;
      word-wrap: break-word;
    }
    
    .placeholder-text {
      color: var(--brand-text-secondary);
      font-style: italic;
      font-size: 14px;
    }
  }

  .course-title-section {
    .streaming-field {
      .streaming-text, .completed-text {
        font-size: 18px;
        font-weight: 600;
        color: var(--brand-text-primary);
      }
    }
  }

  .course-description-section {
    .streaming-field {
      .streaming-text, .completed-text {
        font-size: 14px;
        line-height: 1.8;
        color: var(--brand-text-secondary);
      }
    }
  }

  .course-level-section {
    .streaming-field {
      .streaming-text, .completed-text {
        font-size: 14px;
        font-weight: 500;
        color: var(--brand-primary);
        background-color: var(--brand-bg-secondary);
        padding: 4px 12px;
        border-radius: 16px;
        display: inline-block;
      }
    }
  }

  .objectives-section {
    .objectives-list {
      margin: 0;
      padding-left: 20px;
      
      .objective-item {
        color: var(--brand-text-secondary);
        margin-bottom: 8px;
        line-height: 1.6;
        font-size: 14px;
      }
    }
  }

  .chapters-section {
    .chapters-list {
      .chapter-item {
        margin-bottom: 16px;
        padding: 16px;
        background: var(--brand-bg-secondary);
        border-radius: var(--brand-radius-base);
        border: 1px solid var(--brand-border);
        transition: all 0.3s ease;
        
        &.streaming {
          border-color: var(--brand-primary);
          box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
        }

        .chapter-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;

          .chapter-order {
            background: var(--brand-primary);
            color: white;
            padding: 4px 8px;
            border-radius: var(--brand-radius-sm);
            font-size: 12px;
            font-weight: 500;
          }

          .chapter-title {
            flex: 1;
            font-size: 16px;
            font-weight: 600;
            color: var(--brand-text-primary);
            margin: 0;
          }

          .chapter-duration {
            color: var(--brand-text-secondary);
            font-size: 14px;
          }
        }

        .chapter-description {
          color: var(--brand-text-secondary);
          margin: 0;
          line-height: 1.5;
          font-size: 14px;
        }
      }
    }
  }
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

// 课程信息展示样式
.course-info-display {
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-top: 24px;

  .course-overview-card {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 16px;
    padding: 32px;
    color: white;
    box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);

    .course-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;

      .course-title-area {
        flex: 1;
        margin-right: 20px;

        .course-title {
          font-size: 28px;
          font-weight: 700;
          margin: 0;
          line-height: 1.3;
          color: white;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .course-title-placeholder {
          height: 36px;
          display: flex;
          align-items: center;
          
          .el-skeleton-item {
            background: rgba(255, 255, 255, 0.2);
          }
        }
      }

      .course-meta {
        .level-tag {
          font-size: 16px;
          font-weight: 600;
          padding: 8px 16px;
          border-radius: 20px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .level-placeholder {
          width: 80px;
          height: 32px;
        }

        .edit-button {
          margin-left: 12px;
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: white;
          
          &:hover {
            background: rgba(255, 255, 255, 0.3);
            border-color: rgba(255, 255, 255, 0.5);
          }
        }
      }
    }

    .course-description-area {
      .course-description {
        font-size: 16px;
        line-height: 1.6;
        margin: 0;
        color: white;
        opacity: 0.95;
      }

      .description-placeholder {
        .el-skeleton-item {
          background: rgba(255, 255, 255, 0.2);
        }
      }
    }
  }

  .objectives-card, .chapters-card {
    background: var(--brand-bg-primary);
    border: 1px solid var(--brand-border);
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--brand-border);

      .card-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 18px;
        font-weight: 600;
        color: var(--brand-text-primary);
        margin: 0;

        .el-icon {
          color: var(--brand-primary);
        }
      }
    }
  }

  .objectives-card {
    .objectives-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 16px;

      .objective-card {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        padding: 16px;
        background: var(--brand-bg-secondary);
        border-radius: 8px;
        border-left: 4px solid var(--brand-primary);
        transition: all 0.2s ease;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .objective-number {
          width: 24px;
          height: 24px;
          background: var(--brand-primary);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 600;
          flex-shrink: 0;
        }

        .objective-text {
          color: var(--brand-text-primary);
          line-height: 1.5;
          font-size: 14px;
        }
      }
    }
  }

  .chapters-card {
    .chapters-timeline {
      position: relative;

      &::before {
        content: '';
        position: absolute;
        left: 20px;
        top: 0;
        bottom: 0;
        width: 2px;
        background: var(--brand-border);
      }

      .chapter-timeline-item {
        position: relative;
        margin-bottom: 24px;
        padding-left: 60px;

        &:last-child {
          margin-bottom: 0;
        }

        .timeline-marker {
          position: absolute;
          left: 0;
          top: 0;
          width: 40px;
          height: 40px;
          background: var(--brand-bg-primary);
          border: 3px solid var(--brand-primary);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1;

          .marker-number {
            font-size: 14px;
            font-weight: 600;
            color: var(--brand-primary);
          }
        }

        .timeline-content {
          .chapter-card {
            background: var(--brand-bg-primary);
            border: 1px solid var(--brand-border);
            border-radius: 8px;
            padding: 20px;
            transition: all 0.2s ease;

            &:hover {
              border-color: var(--brand-primary);
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            }

            .chapter-header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              margin-bottom: 12px;

              .chapter-title {
                font-size: 16px;
                font-weight: 600;
                color: var(--brand-text-primary);
                margin: 0;
                flex: 1;
                margin-right: 12px;
              }
            }

            .chapter-description {
              color: var(--brand-text-secondary);
              line-height: 1.5;
              margin: 0;
              font-size: 14px;
            }
          }
        }
      }
    }
  }

  // 响应式设计
  @media (max-width: 768px) {
    .course-overview-card {
      padding: 20px;
      
      .course-header {
        flex-direction: column;
        gap: 16px;
        
        .course-title-area {
          margin-right: 0;
        }
      }
    }

    .objectives-card .objectives-grid {
      grid-template-columns: 1fr;
    }

    .chapters-card .chapters-timeline {
      .chapter-timeline-item {
        padding-left: 50px;
        
        .timeline-marker {
          width: 32px;
          height: 32px;
          
          .marker-number {
            font-size: 12px;
          }
        }
      }
    }
  }
}

// 编辑对话框样式
.edit-dialog {
  :deep(.el-dialog) {
    border-radius: 24px;
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
    margin: 0 auto;
    top: 80px !important;
    transform: none;
  }

  :deep(.el-dialog__header) {
    display: none !important;
    padding: 0 !important;
    margin: 0 !important;
    height: 0 !important;
  }

  :deep(.el-dialog__body) {
    padding: 0;
  }

  :deep(.el-overlay) {
    background-color: rgba(0, 0, 0, 0.5);
  }
}

.dialog-content {
  display: flex;
  flex-direction: column;
  height: 80vh;
  max-height: 800px;
  background: white;
}

.dialog-header {
  background: white;
  color: var(--brand-text-primary);
  padding: 20px 32px 24px 32px;
  text-align: center;
  border-bottom: 1px solid var(--brand-border);

  .dialog-title {
    font-size: 24px;
    font-weight: 700;
    margin: 0 0 8px 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    color: var(--brand-text-primary);

    .el-icon {
      font-size: 28px;
      color: var(--brand-primary);
    }
  }

  .dialog-subtitle {
    font-size: 14px;
    color: var(--brand-text-secondary);
    margin: 0;
  }
}

.dialog-body {
  flex: 1;
  overflow-y: auto;
  padding: 0;
  background: white;

  .edit-form {
    padding: 32px;
    max-width: 100%;

    .el-form-item {
      margin-bottom: 24px;

      .el-form-item__label {
        font-weight: 600;
        color: var(--brand-text-primary);
        font-size: 14px;
        margin-bottom: 8px;
      }

      .el-input, .el-textarea, .el-select {
        .el-input__wrapper, .el-textarea__inner {
          border-radius: 12px;
          border: 1px solid var(--brand-border);
          transition: all 0.2s ease;

          &:hover {
            border-color: var(--brand-primary);
          }

          &.is-focus {
            border-color: var(--brand-primary);
            box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
          }
        }
      }
    }
  }
}

.dialog-footer {
  background: white;
  border-top: 1px solid var(--brand-border);
  padding: 24px 32px;
  position: sticky;
  bottom: 0;
  z-index: 10;

  .footer-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;

    .el-button {
      min-width: 100px;
      height: 40px;
      border-radius: 12px;
      font-weight: 600;
      transition: all 0.2s ease;

      &.save-button {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border: none;
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);

        &:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
        }
      }
    }
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
  }
}

.objectives-edit, .chapters-edit {
  width: 100%;
  max-width: 100%;

  .objective-edit-item, .chapter-edit-item {
    display: flex;
    align-items: flex-start;
    gap: 20px;
    margin-bottom: 24px;
    padding: 24px;
    background: var(--brand-bg-secondary);
    border-radius: 16px;
    border: 1px solid var(--brand-border);
    transition: all 0.2s ease;
    position: relative;
    overflow: hidden;
    width: 100%;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 4px;
      height: 100%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
      border-color: var(--brand-primary);
    }

    &:last-child {
      margin-bottom: 0;
    }
  }

  .objective-edit-item {
    .el-input {
      flex: 1;
      min-width: 0;
    }

    .el-button {
      flex-shrink: 0;
      width: 48px;
      height: 48px;
    }
  }

  .chapter-edit-item {
    flex-direction: column;
    gap: 24px;

    .chapter-edit-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      padding-bottom: 20px;
      border-bottom: 1px solid var(--brand-border);

      .chapter-number {
        font-weight: 700;
        color: var(--brand-primary);
        font-size: 20px;
        display: flex;
        align-items: center;
        gap: 10px;

        &::before {
          content: '';
          width: 10px;
          height: 10px;
          background: var(--brand-primary);
          border-radius: 50%;
        }
      }
    }

    .chapter-form-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 24px;
      width: 100%;

      .chapter-title-field {
        margin-bottom: 0;
      }

      .chapter-duration-field {
        margin-bottom: 0;
      }
    }

    .chapter-description-field {
      margin-bottom: 0;
      width: 100%;
    }

    .el-form-item {
      margin-bottom: 0;

      .el-form-item__label {
        font-size: 15px;
        font-weight: 600;
        margin-bottom: 10px;
      }
    }
  }

  .add-objective-btn, .add-chapter-btn {
    width: 100%;
    height: 48px;
    border-radius: 12px;
    font-weight: 600;
    font-size: 16px;
    margin-top: 8px;
    transition: all 0.2s ease;

    &:hover {
      transform: translateY(-1px);
    }
  }

  .el-button {
    border-radius: 12px;
    font-weight: 600;
    transition: all 0.2s ease;

    &:hover {
      transform: translateY(-1px);
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .edit-dialog {
    :deep(.el-dialog) {
      width: 95vw !important;
      margin: 0 auto;
    }
  }

  .dialog-content {
    height: 85vh;
  }

  .dialog-header {
    padding: 24px 20px;

    .dialog-title {
      font-size: 20px;
    }

    .dialog-subtitle {
      font-size: 13px;
    }
  }

  .dialog-body {
    .edit-form {
      padding: 20px;
    }
  }

  .dialog-footer {
    padding: 16px 20px;

    .footer-actions {
      flex-direction: column;
      gap: 12px;

      .el-button {
        width: 100%;
        min-width: auto;
      }
    }
  }

  .objectives-edit, .chapters-edit {
    .objective-edit-item, .chapter-edit-item {
      padding: 20px;
      gap: 16px;
    }

    .chapter-edit-item {
      .chapter-form-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      .chapter-edit-header {
        .chapter-number {
          font-size: 18px;
        }
      }
    }

    .add-objective-btn, .add-chapter-btn {
      height: 44px;
      font-size: 15px;
    }
  }
}

// Markdown流式渲染样式
.markdown-streaming-container {
  .markdown-preview {
    .markdown-content {
      max-height: 400px;
      overflow-y: auto;
      padding: 16px;
      background: var(--brand-bg-secondary);
      border-radius: 8px;
      border: 1px solid var(--brand-border);
      font-family: 'Fira Code', 'Consolas', monospace;
      font-size: 14px;
      line-height: 1.6;
      white-space: pre-wrap;
      word-break: break-all;
      
      // 自定义滚动条样式
      &::-webkit-scrollbar {
        width: 6px;
      }
      
      &::-webkit-scrollbar-track {
        background: var(--brand-bg-primary);
        border-radius: 3px;
      }
      
      &::-webkit-scrollbar-thumb {
        background: var(--brand-border);
        border-radius: 3px;
        
        &:hover {
          background: var(--brand-text-tertiary);
        }
      }
    }
  }
}

.markdown-streaming-container {
  .regex-test-area {
    margin-bottom: 24px;
    border: 1px solid var(--brand-border);
    border-radius: var(--brand-radius-base);
    background: var(--brand-bg-primary);
    
    .test-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      background: var(--brand-bg-secondary);
      border-bottom: 1px solid var(--brand-border);
      border-radius: var(--brand-radius-base) var(--brand-radius-base) 0 0;
      
      h4 {
        margin: 0;
        font-size: 14px;
        font-weight: 600;
        color: var(--brand-text-primary);
      }
    }
    
    .test-content {
      padding: 16px;
      
      .test-section {
        margin-bottom: 20px;
        
        h5 {
          margin: 0 0 8px 0;
          font-size: 13px;
          font-weight: 600;
          color: var(--brand-text-primary);
        }
        
        .test-code {
          background: #f5f5f5;
          border: 1px solid #ddd;
          border-radius: 4px;
          padding: 12px;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 12px;
          line-height: 1.4;
          color: #333;
          white-space: pre-wrap;
          word-wrap: break-word;
          max-height: 200px;
          overflow-y: auto;
        }
        
        .parse-results {
          .result-item {
            display: flex;
            align-items: center;
            margin-bottom: 8px;
            padding: 8px 12px;
            background: var(--brand-bg-secondary);
            border-radius: 4px;
            
            strong {
              min-width: 80px;
              font-size: 13px;
              color: var(--brand-text-primary);
            }
            
            .success {
              color: #52c41a;
              font-weight: 500;
            }
            
            .error {
              color: #ff4d4f;
              font-weight: 500;
            }
          }
        }
        
        .regex-tests {
          .regex-test {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 6px;
            padding: 6px 12px;
            background: var(--brand-bg-secondary);
            border-radius: 4px;
            
            code {
              font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
              font-size: 12px;
              color: var(--brand-text-primary);
              background: transparent;
            }
            
            .success {
              color: #52c41a;
              font-weight: 500;
              font-size: 12px;
            }
            
            .error {
              color: #ff4d4f;
              font-weight: 500;
              font-size: 12px;
            }
          }
        }
        
        .debug-info {
          margin-top: 16px;
          padding: 12px;
          background: #f8f9fa;
          border-radius: 4px;
          border: 1px solid #e9ecef;
          
          h6 {
            margin: 0 0 8px 0;
            font-size: 12px;
            font-weight: 600;
            color: var(--brand-text-primary);
          }
          
          .debug-item {
            margin-bottom: 6px;
            font-size: 12px;
            
            strong {
              color: var(--brand-text-primary);
            }
            
            .content-preview {
              background: #fff;
              border: 1px solid #ddd;
              border-radius: 3px;
              padding: 8px;
              font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
              font-size: 11px;
              line-height: 1.3;
              color: #333;
              white-space: pre-wrap;
              word-wrap: break-word;
              max-height: 100px;
              overflow-y: auto;
              margin-top: 4px;
            }
          }
        }
      }
    }
  }

  .markdown-preview {
    margin-bottom: 24px;
    border: 1px solid var(--brand-border);
    border-radius: var(--brand-radius-base);
    background: var(--brand-bg-primary);
    
    .markdown-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      background: var(--brand-bg-secondary);
      border-bottom: 1px solid var(--brand-border);
      border-radius: var(--brand-radius-base) var(--brand-radius-base) 0 0;
      
      h4 {
        margin: 0;
        font-size: 14px;
        font-weight: 600;
        color: var(--brand-text-primary);
      }
      
      .streaming-indicator {
        display: flex;
        align-items: center;
        gap: 6px;
        color: var(--brand-primary);
        font-size: 12px;
        
        .el-icon {
          animation: spin 1s linear infinite;
        }
      }
    }
    
    .markdown-content {
      padding: 16px;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: 13px;
      line-height: 1.6;
      color: var(--brand-text-primary);
      white-space: pre-wrap;
      word-wrap: break-word;
      max-height: 200px;
      overflow-y: auto;
      
      // Markdown样式
      h1 {
        font-size: 18px;
        font-weight: 600;
        margin: 0 0 12px 0;
        color: var(--brand-text-primary);
        border-bottom: 2px solid var(--brand-primary);
        padding-bottom: 4px;
      }
      
      h2 {
        font-size: 16px;
        font-weight: 600;
        margin: 16px 0 8px 0;
        color: var(--brand-text-primary);
      }
      
      h3 {
        font-size: 14px;
        font-weight: 600;
        margin: 12px 0 6px 0;
        color: var(--brand-text-primary);
      }
      
      p {
        margin: 8px 0;
        line-height: 1.6;
      }
      
      ul {
        margin: 8px 0;
        padding-left: 20px;
        
        li {
          margin: 4px 0;
          line-height: 1.5;
        }
      }
      
      strong {
        font-weight: 600;
        color: var(--brand-primary);
      }
    }
    
  }
  
  .structured-display {
    .section-label {
      font-size: 16px;
      font-weight: 600;
      color: var(--brand-text-primary);
      margin: 0 0 16px 0;
      padding-bottom: 8px;
      border-bottom: 2px solid var(--brand-primary);
      display: inline-block;
    }
    
    .field-label {
      font-size: 14px;
      font-weight: 600;
      color: var(--brand-text-primary);
      margin: 0 0 8px 0;
    }
    
    .field-content {
      margin-bottom: 16px;
      min-height: 24px;
      
      .streaming-text {
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        font-size: 14px;
        line-height: 1.6;
        color: var(--brand-text-primary);
        white-space: pre-wrap;
        word-wrap: break-word;
      }
      
      .completed-text {
        font-size: 14px;
        line-height: 1.6;
        color: var(--brand-text-primary);
        white-space: pre-wrap;
        word-wrap: break-word;
      }
      
      .placeholder-text {
        color: var(--brand-text-secondary);
        font-style: italic;
        font-size: 14px;
      }
      
      .level-badge {
        background: var(--brand-primary);
        color: white;
        padding: 4px 12px;
        border-radius: 16px;
        font-size: 12px;
        font-weight: 500;
        display: inline-block;
      }
    }
    
    .course-title-section {
      .field-content {
        .streaming-text, .completed-text {
          font-size: 18px;
          font-weight: 600;
          color: var(--brand-text-primary);
        }
      }
    }
    
    .course-description-section {
      .field-content {
        .streaming-text, .completed-text {
          font-size: 14px;
          line-height: 1.8;
          color: var(--brand-text-secondary);
        }
      }
    }
    
    .objectives-section {
      .objectives-list {
        margin: 0;
        padding-left: 20px;
        
        .objective-item {
          color: var(--brand-text-secondary);
          margin-bottom: 8px;
          line-height: 1.6;
          font-size: 14px;
        }
      }
    }
    
    .chapters-section {
      .chapters-list {
        .chapter-item {
          margin-bottom: 16px;
          padding: 16px;
          background: var(--brand-bg-secondary);
          border-radius: var(--brand-radius-base);
          border: 1px solid var(--brand-border);
          transition: all 0.3s ease;

          .chapter-header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 8px;

            .chapter-order {
              background: var(--brand-primary);
              color: white;
              padding: 4px 8px;
              border-radius: var(--brand-radius-sm);
              font-size: 12px;
              font-weight: 500;
            }

            .chapter-title {
              flex: 1;
              font-size: 16px;
              font-weight: 600;
              color: var(--brand-text-primary);
              margin: 0;
            }

            .chapter-duration {
              color: var(--brand-text-secondary);
              font-size: 14px;
            }
          }

          .chapter-description {
            color: var(--brand-text-secondary);
            margin: 0;
            line-height: 1.5;
            font-size: 14px;
          }
        }
      }
    }
  }
  
  .waiting-state {
    text-align: center;
    padding: 40px 20px;
    
    .waiting-content {
      .waiting-icon {
        font-size: 32px;
        color: var(--brand-primary);
        margin-bottom: 16px;
        animation: spin 2s linear infinite;
      }
      
      p {
        color: var(--brand-text-secondary);
        margin: 0;
        font-size: 14px;
      }
    }
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
