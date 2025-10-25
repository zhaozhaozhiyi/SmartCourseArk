<template>
  <div class="question-generate">

    <!-- 左右分栏布局 -->
    <div class="generate-layout">
      <!-- 左侧：选择生成方式 -->
      <div class="mode-selection">
        <el-card class="mode-card">
          <template #header>
            <h3>选择生成方式</h3>
          </template>
          
          <!-- 内容区域 - 可滚动 -->
          <div class="mode-content-scrollable">
            <el-tabs v-model="activeMode" @tab-change="onModeChange" direction="vertical">
              <!-- 方式1：基于课程章节 -->
              <el-tab-pane label="课程生成" name="course">
                <div class="mode-content">
                  <div class="mode-description">
                    <el-icon><Reading /></el-icon>
                    <div>
                      <h4>基于已有课程内容生成题目</h4>
                      <p>选择现有课程和章节，基于课程内容智能生成相关练习题</p>
                    </div>
                  </div>
                  
                  <el-form :model="courseConfig" :rules="courseRules" ref="courseFormRef" label-width="100px" size="small">
                    <el-form-item label="选择课程" prop="courseId">
                      <el-select v-model="courseConfig.courseId" placeholder="请选择课程" @change="onCourseChange">
                        <el-option 
                          v-for="course in courses" 
                          :key="course.id" 
                          :label="course.title" 
                          :value="course.id" 
                        />
                      </el-select>
                    </el-form-item>
                    
                    <el-form-item label="选择章节" prop="chapterId" v-if="selectedCourse">
                      <el-select v-model="courseConfig.chapterId" placeholder="请选择章节（可选）" clearable>
                        <el-option 
                          v-for="chapter in selectedCourse.chapters" 
                          :key="chapter.id" 
                          :label="chapter.title" 
                          :value="chapter.id" 
                        />
                      </el-select>
                    </el-form-item>
                  </el-form>
                  
                  <!-- 生成设置区域 -->
                  <div class="generation-settings-header">
                    <div class="settings-summary">
                      <h4>生成设置 <span class="total-count">共{{ totalQuestionCount }}题</span></h4>
                    </div>
                    
                    <div class="top-controls">
                      <el-form-item label="语言">
                        <el-select v-model="courseConfig.language" placeholder="选择语言" clearable>
                          <el-option 
                            v-for="lang in languageOptions" 
                            :key="lang.value" 
                            :label="lang.label" 
                            :value="lang.value" 
                          />
                        </el-select>
                      </el-form-item>
                      
                      <el-form-item label="难度">
                        <el-select v-model="courseConfig.difficulty" placeholder="选择难度" clearable>
                          <el-option label="简单" :value="QuestionDifficulty.EASY" />
                          <el-option label="中等" :value="QuestionDifficulty.MEDIUM" />
                          <el-option label="困难" :value="QuestionDifficulty.HARD" />
                        </el-select>
                      </el-form-item>
                    </div>
                  </div>

                  <!-- 题型选择区域 -->
                  <div class="question-types-section">
                    <h4>选择题型和数量</h4>
                    
                    <div class="question-type-list">
                      <div 
                        v-for="typeConfig in questionTypes" 
                        :key="typeConfig.type"
                        class="question-type-item"
                        :class="{ 'is-enabled': typeConfig.enabled }"
                      >
                        <el-checkbox 
                          v-model="typeConfig.enabled"
                          :label="typeConfig.label"
                        />
                        
                        <div class="quantity-control">
                          <el-button 
                            :icon="Minus" 
                            size="small" 
                            circle
                            :disabled="!typeConfig.enabled || typeConfig.count <= typeConfig.min"
                            @click="decreaseCount(typeConfig)"
                          />
                          <el-input-number 
                            v-model="typeConfig.count"
                            :min="typeConfig.min"
                            :max="typeConfig.max"
                            :disabled="!typeConfig.enabled"
                            size="small"
                            controls-position="right"
                          />
                          <el-button 
                            :icon="Plus" 
                            size="small" 
                            circle
                            :disabled="!typeConfig.enabled || typeConfig.count >= typeConfig.max"
                            @click="increaseCount(typeConfig)"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </el-tab-pane>

              <!-- 方式2：基于本地上传文件 -->
              <el-tab-pane label="文件生成" name="upload">
                <div class="mode-content">
                  <div class="mode-description">
                    <el-icon><Upload /></el-icon>
                    <div>
                      <h4>基于上传文件生成题目</h4>
                      <p>上传PDF、TXT等文件，基于文件内容智能生成相关练习题</p>
                    </div>
                  </div>
                  
                  <el-form :model="uploadConfig" :rules="uploadRules" ref="uploadFormRef" size="small">
                    <el-form-item label="上传文件" prop="file">
                      <el-upload
                        ref="uploadRef"
                        :auto-upload="false"
                        :on-change="handleFileChange"
                        :before-upload="beforeUpload"
                        accept=".pdf,.txt"
                        drag
                      >
                        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
                        <div class="el-upload__text">
                          将文件拖到此处，或<em>点击上传</em>
                        </div>
                        <template #tip>
                          <div class="el-upload__tip">
                            只能上传 PDF/TXT 文件，且不超过 10MB
                          </div>
                        </template>
                      </el-upload>
                    </el-form-item>
                    
                    <el-form-item label="文件主题" prop="topic">
                      <el-input v-model="uploadConfig.topic" placeholder="请输入文件主题或课程名称" />
                    </el-form-item>
                  </el-form>
                  
                  <!-- 生成设置区域 -->
                  <div class="generation-settings-header">
                    <div class="settings-summary">
                      <h4>生成设置 <span class="total-count">共{{ totalQuestionCount }}题</span></h4>
                    </div>
                    
                    <div class="top-controls">
                      <el-form-item label="语言">
                        <el-select v-model="uploadConfig.language" placeholder="选择语言" clearable>
                          <el-option 
                            v-for="lang in languageOptions" 
                            :key="lang.value" 
                            :label="lang.label" 
                            :value="lang.value" 
                          />
                        </el-select>
                      </el-form-item>
                      
                      <el-form-item label="难度">
                        <el-select v-model="uploadConfig.difficulty" placeholder="选择难度" clearable>
                          <el-option label="简单" :value="QuestionDifficulty.EASY" />
                          <el-option label="中等" :value="QuestionDifficulty.MEDIUM" />
                          <el-option label="困难" :value="QuestionDifficulty.HARD" />
                        </el-select>
                      </el-form-item>
                    </div>
                  </div>

                  <!-- 题型选择区域 -->
                  <div class="question-types-section">
                    <h4>选择题型和数量</h4>
                    
                    <div class="question-type-list">
                      <div 
                        v-for="typeConfig in questionTypes" 
                        :key="typeConfig.type"
                        class="question-type-item"
                        :class="{ 'is-enabled': typeConfig.enabled }"
                      >
                        <el-checkbox 
                          v-model="typeConfig.enabled"
                          :label="typeConfig.label"
                        />
                        
                        <div class="quantity-control">
                          <el-button 
                            :icon="Minus" 
                            size="small" 
                            circle
                            :disabled="!typeConfig.enabled || typeConfig.count <= typeConfig.min"
                            @click="decreaseCount(typeConfig)"
                          />
                          <el-input-number 
                            v-model="typeConfig.count"
                            :min="typeConfig.min"
                            :max="typeConfig.max"
                            :disabled="!typeConfig.enabled"
                            size="small"
                            controls-position="right"
                          />
                          <el-button 
                            :icon="Plus" 
                            size="small" 
                            circle
                            :disabled="!typeConfig.enabled || typeConfig.count >= typeConfig.max"
                            @click="increaseCount(typeConfig)"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </el-tab-pane>

              <!-- 方式3：基于用户输入 -->
              <el-tab-pane label="文本生成" name="text">
                <div class="mode-content">
                  <div class="mode-description">
                    <el-icon><Edit /></el-icon>
                    <div>
                      <h4>基于文本描述生成题目</h4>
                      <p>输入课程内容或知识点描述，基于文本内容智能生成相关练习题</p>
                    </div>
                  </div>
                  
                  <el-form :model="textConfig" :rules="textRules" ref="textFormRef" label-width="100px" size="small">
                    <el-form-item label="领域主题" prop="topic">
                      <el-input v-model="textConfig.topic" placeholder="请输入领域主题" />
                    </el-form-item>
                    
                    <el-form-item label="内容描述" prop="content">
                      <el-input
                        v-model="textConfig.content"
                        type="textarea"
                        :rows="4"
                        placeholder="请输入课程内容、知识点或学习材料..."
                      />
                    </el-form-item>
                  </el-form>
                  
                  <!-- 生成设置区域 -->
                  <div class="generation-settings-header">
                    <div class="settings-summary">
                      <h4>生成设置 <span class="total-count">共{{ totalQuestionCount }}题</span></h4>
                    </div>
                    
                    <div class="top-controls">
                      <el-form-item label="语言">
                        <el-select v-model="textConfig.language" placeholder="选择语言" clearable>
                          <el-option 
                            v-for="lang in languageOptions" 
                            :key="lang.value" 
                            :label="lang.label" 
                            :value="lang.value" 
                          />
                        </el-select>
                      </el-form-item>
                      
                      <el-form-item label="难度">
                        <el-select v-model="textConfig.difficulty" placeholder="选择难度" clearable>
                          <el-option label="简单" :value="QuestionDifficulty.EASY" />
                          <el-option label="中等" :value="QuestionDifficulty.MEDIUM" />
                          <el-option label="困难" :value="QuestionDifficulty.HARD" />
                        </el-select>
                      </el-form-item>
                    </div>
                  </div>

                  <!-- 题型选择区域 -->
                  <div class="question-types-section">
                    <h4>选择题型和数量</h4>
                    
                    <div class="question-type-list">
                      <div 
                        v-for="typeConfig in questionTypes" 
                        :key="typeConfig.type"
                        class="question-type-item"
                        :class="{ 'is-enabled': typeConfig.enabled }"
                      >
                        <el-checkbox 
                          v-model="typeConfig.enabled"
                          :label="typeConfig.label"
                        />
                        
                        <div class="quantity-control">
                          <el-button 
                            :icon="Minus" 
                            size="small" 
                            circle
                            :disabled="!typeConfig.enabled || typeConfig.count <= typeConfig.min"
                            @click="decreaseCount(typeConfig)"
                          />
                          <el-input-number 
                            v-model="typeConfig.count"
                            :min="typeConfig.min"
                            :max="typeConfig.max"
                            :disabled="!typeConfig.enabled"
                            size="small"
                            controls-position="right"
                          />
                          <el-button 
                            :icon="Plus" 
                            size="small" 
                            circle
                            :disabled="!typeConfig.enabled || typeConfig.count >= typeConfig.max"
                            @click="increaseCount(typeConfig)"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </el-tab-pane>
            </el-tabs>
          </div>
        </el-card>
        
        <!-- 按钮固定在左侧面板底部 -->
        <div class="generate-actions-fixed">
          <el-button 
            type="primary" 
            size="large" 
            @click="generateQuestions" 
            :loading="generating"
            :disabled="!canGenerate"
          >
            <el-icon><Edit /></el-icon>
            开始生成题目
          </el-button>
        </div>
      </div>

      <!-- 右侧：生成内容和结果 -->
      <div class="content-area">
        <!-- 右侧区域头部 -->
        <div class="content-header">
          <el-button @click="goBack">返回题库</el-button>
        </div>
        
        <!-- 空状态 -->
        <div v-if="!generating && generatedQuestions.length === 0" class="empty-state">
          <el-empty description="这个区域是生成的试题">
            <template #image>
              <el-icon :size="100"><Document /></el-icon>
            </template>
          </el-empty>
        </div>
        
        <!-- 流式生成进度 -->
        <div v-if="streamingState.isStreaming" class="streaming-progress">
          <el-card>
            <template #header>
              <div class="streaming-header">
                <h3>正在生成题目</h3>
                <div class="header-actions">
                  <span class="progress-text">{{ streamingState.currentQuestionIndex + 1 }} / {{ streamingState.totalCount }}</span>
                  <el-button 
                    type="text" 
                    size="small" 
                    @click="toggleStreamingWindow"
                  >
                    <el-icon v-if="streamingWindowExpanded"><ArrowDown /></el-icon>
                    <el-icon v-else><ArrowUp /></el-icon>
                    {{ streamingWindowExpanded ? '收起' : '展开' }}
                  </el-button>
                </div>
              </div>
            </template>
            
            <div class="phase-indicator">
              <el-icon class="rotating"><Loading /></el-icon>
              <span>{{ streamingState.currentPhase }}</span>
            </div>
            
            <el-progress 
              :percentage="Math.round(((streamingState.currentQuestionIndex + 1) / streamingState.totalCount) * 100)" 
              :stroke-width="8"
            />
            
            <!-- 流式输出窗口 -->
            <div class="streaming-output-window" :class="{ 'expanded': streamingWindowExpanded }">
              <div class="streaming-content" ref="streamingContentRef">
                <div class="streaming-json" v-html="streamingState.rawOutput"></div>
              </div>
            </div>
          </el-card>
        </div>

        <!-- 生成进度（备用） -->
        <div v-if="generating && !streamingState.isStreaming" class="generate-progress">
          <el-card>
            <template #header>
              <h3>生成进度</h3>
            </template>
            
            <div class="progress-content">
              <el-alert
                :title="progressMessage"
                :type="progressType"
                :closable="false"
                show-icon
              />
              
              <div class="progress-bar">
                <el-progress 
                  :percentage="progressPercentage" 
                  :stroke-width="8"
                  :show-text="true"
                />
              </div>
            </div>
          </el-card>
        </div>

        <!-- 流式显示题目列表 -->
        <div v-if="streamingState.questions.length > 0" class="questions-list streaming">
          <el-card>
            <template #header>
              <h3>正在生成的题目</h3>
            </template>
            
            <div class="streaming-questions">
              <div 
                v-for="(question, index) in streamingState.questions" 
                :key="index" 
                class="question-item"
                :class="{ 'is-generating': question.isGenerating }"
              >
                <!-- 题目内容逐步显示 -->
                <div v-if="question.content" class="question-content">{{ question.content }}</div>
                <div v-if="question.options" class="question-options">
                  <div v-for="(option, optIndex) in question.options" :key="optIndex" class="option">
                    {{ String.fromCharCode(65 + optIndex) }}. {{ option }}
                  </div>
                </div>
                <div v-if="question.answer" class="question-answer">
                  <strong>答案：</strong>{{ question.answer }}
                </div>
                <div v-if="question.explanation" class="question-explanation">
                  <strong>解析：</strong>{{ question.explanation }}
                </div>
                
                <!-- 生成中指示器 -->
                <div v-if="question.isGenerating" class="generating-indicator">
                  <el-icon class="rotating"><Loading /></el-icon>
                  <span>正在生成{{ getGeneratingFieldName(question.generatingField) }}...</span>
                </div>
              </div>
            </div>
          </el-card>
        </div>

        <!-- 生成结果 -->
        <div v-if="generatedQuestions.length > 0" class="generate-results">
          <el-card>
            <template #header>
              <div class="results-header">
                <h3>生成结果</h3>
                <div class="results-actions">
                  <el-button @click="exportQuestions">
                    <el-icon><Download /></el-icon>
                    导出题目
                  </el-button>
                  <el-button type="primary" @click="saveToBank">
                    <el-icon><Plus /></el-icon>
                    保存到题库
                  </el-button>
                  <el-button @click="previewQuestions">
                    <el-icon><View /></el-icon>
                    预览测试
                  </el-button>
                </div>
              </div>
            </template>
            
            <div class="questions-list">
              <div v-for="(question, index) in generatedQuestions" :key="index" class="question-item">
                <div class="question-header">
                  <span class="question-number">{{ index + 1 }}.</span>
                  <span class="question-type">{{ getQuestionTypeName(question.type) }}</span>
                  <span class="question-difficulty">{{ getDifficultyName(question.difficulty) }}</span>
                  <div class="question-actions">
                    <el-button type="text" size="small" @click="editQuestion(question, index)">
                      <el-icon><Edit /></el-icon>
                    </el-button>
                    <el-button type="text" size="small" @click="deleteQuestion(index)">
                      <el-icon><Delete /></el-icon>
                    </el-button>
                  </div>
                </div>
                <div class="question-content">{{ question.content }}</div>
                <div v-if="question.options" class="question-options">
                  <div v-for="(option, optIndex) in question.options" :key="optIndex" class="option">
                    {{ String.fromCharCode(65 + optIndex) }}. {{ option }}
                  </div>
                </div>
                <div class="question-answer">
                  <strong>答案：</strong>{{ question.answer }}
                </div>
                <div class="question-explanation">
                  <strong>解析：</strong>{{ question.explanation }}
                </div>
              </div>
            </div>
          </el-card>
        </div>
      </div>
    </div>

    <!-- 题目编辑对话框 -->
    <QuestionEditDialog
      v-model:visible="editDialogVisible"
      :question="editingQuestion"
      :is-edit="true"
      @save="handleQuestionSave"
    />

    <!-- 题目预览对话框 -->
    <el-dialog
      :model-value="previewDialogVisible"
      title="题目预览测试"
      width="800px"
      :close-on-click-modal="false"
      @update:model-value="previewDialogVisible = $event"
    >
      <QuestionPreview 
        :questions="generatedQuestions" 
        @close="previewDialogVisible = false"
      />
    </el-dialog>

    <!-- 导出选项对话框 -->
    <el-dialog
      v-model="exportDialogVisible"
      title="导出题目"
      width="400px"
      :close-on-click-modal="false"
    >
      <el-form :model="exportForm" label-width="80px">
        <el-form-item label="导出格式">
          <el-radio-group v-model="exportForm.format">
            <el-radio label="excel">Excel</el-radio>
            <el-radio label="csv">CSV</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="包含内容">
          <el-checkbox-group v-model="exportForm.include">
            <el-checkbox label="options">选项</el-checkbox>
            <el-checkbox label="answer">答案</el-checkbox>
            <el-checkbox label="explanation">解析</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="exportDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmExport">开始导出</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { 
  Reading, 
  Upload, 
  Edit, 
  Download, 
  Plus,
  View,
  UploadFilled,
  Delete,
  Document,
  Minus,
  Loading,
  ArrowDown,
  ArrowUp
} from '@element-plus/icons-vue'
import QuestionGenerator from '@/shared/services/questionGenerator'
import { QuestionExporter } from '@/shared/services/questionExporter'
import { useCourseStore } from '@/store/modules/course'
import { useQuestionStore } from '@/store/modules/question'
import QuestionPreview from '../components/QuestionPreview.vue'
import QuestionEditDialog from '@/modules/question/components/QuestionEditDialog.vue'
import { QuestionType, QuestionDifficulty } from '@/types/course'

// 新增题型配置接口
interface QuestionTypeConfig {
  type: QuestionType
  label: string
  enabled: boolean
  count: number
  min: number
  max: number
}

// 新增流式生成状态
interface StreamingState {
  isStreaming: boolean
  currentPhase: string
  currentQuestionIndex: number
  totalCount: number
  rawOutput: string
  questions: Array<{
    type?: QuestionType
    content?: string
    options?: string[]
    answer?: string
    explanation?: string
    difficulty?: QuestionDifficulty
    isGenerating: boolean
    generatingField: 'content' | 'options' | 'answer' | 'explanation' | 'complete'
  }>
}

const router = useRouter()
const courseStore = useCourseStore()
const questionStore = useQuestionStore()

// 当前激活的生成方式
const activeMode = ref('course')

// 课程数据
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const courses = ref<any[]>([])
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const selectedCourse = ref<any>(null)

// 生成状态
const generating = ref(false)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const generatedQuestions = ref<any[]>([])
const progressMessage = ref('')
const progressType = ref<'info' | 'success' | 'warning' | 'error'>('info')
const progressPercentage = ref(0)

// 编辑和预览状态
const editDialogVisible = ref(false)
const previewDialogVisible = ref(false)
const editingQuestion = ref<any>(null)
const editingIndex = ref(-1)

// 导出状态
const exportDialogVisible = ref(false)
const exportForm = ref({
  format: 'excel',
  include: ['options', 'answer', 'explanation'] as string[]
})

// 语言配置
const languageOptions = [
  { value: 'zh-CN', label: '简体中文' },
  { value: 'zh-TW', label: '繁体中文' },
  { value: 'en', label: 'English' }
]

// 题型配置
const questionTypes = ref<QuestionTypeConfig[]>([
  { type: QuestionType.SINGLE, label: '单选题', enabled: false, count: 1, min: 1, max: 20 },
  { type: QuestionType.MULTIPLE, label: '多选题', enabled: false, count: 1, min: 1, max: 20 },
  { type: QuestionType.JUDGE, label: '判断题', enabled: false, count: 1, min: 1, max: 20 },
  { type: QuestionType.FILL, label: '填空题', enabled: false, count: 1, min: 1, max: 20 },
  { type: QuestionType.ESSAY, label: '简答题', enabled: false, count: 1, min: 1, max: 20 }
])

// 流式生成状态
const streamingState = ref<StreamingState>({
  isStreaming: false,
  currentPhase: '',
  currentQuestionIndex: -1,
  totalCount: 0,
  rawOutput: '',
  questions: []
})

// 流式窗口状态
const streamingWindowExpanded = ref(false)
const streamingContentRef = ref<HTMLElement>()

// 表单引用
const courseFormRef = ref()
const uploadFormRef = ref()
const textFormRef = ref()
const uploadRef = ref()

// 基于课程章节的配置
const courseConfig = ref({
  courseId: '',
  chapterId: '',
  language: 'zh-CN',
  difficulty: QuestionDifficulty.MEDIUM
})

// 基于上传文件的配置
const uploadConfig = ref({
  file: null as File | null,
  topic: '',
  language: 'zh-CN',
  difficulty: QuestionDifficulty.MEDIUM
})

// 基于文本输入的配置
const textConfig = ref({
  topic: '',
  content: '',
  language: 'zh-CN',
  difficulty: QuestionDifficulty.MEDIUM
})

// 表单验证规则
const courseRules = {
  courseId: [
    { required: true, message: '请选择课程', trigger: 'change' }
  ]
}

const uploadRules = {
  file: [
    { required: true, message: '请上传文件', trigger: 'change' }
  ],
  topic: [
    { required: true, message: '请输入文件主题', trigger: 'blur' }
  ]
}

const textRules = {
  topic: [
    { required: true, message: '请输入课程主题', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入内容描述', trigger: 'blur' }
  ]
}

// 计算属性
const canGenerate = computed(() => {
  const hasEnabledTypes = questionTypes.value.some(t => t.enabled)
  const totalCount = totalQuestionCount.value > 0
  
  switch (activeMode.value) {
    case 'course':
      return courseConfig.value.courseId && hasEnabledTypes && totalCount
    case 'upload':
      return uploadConfig.value.file && 
             uploadConfig.value.topic && 
             hasEnabledTypes && 
             totalCount
    case 'text':
      return textConfig.value.topic && 
             textConfig.value.content && 
             hasEnabledTypes && 
             totalCount
    default:
      return false
  }
})

// 计算总题目数
const totalQuestionCount = computed(() => {
  return questionTypes.value
    .filter(t => t.enabled)
    .reduce((sum, t) => sum + t.count, 0)
})

// 获取当前配置（暂时保留，可能用于未来功能）
// const currentConfig = computed(() => {
//   switch (activeMode.value) {
//     case 'course':
//       return courseConfig.value
//     case 'upload':
//       return uploadConfig.value
//     case 'text':
//       return textConfig.value
//     default:
//       return courseConfig.value
//   }
// })

// 生命周期
onMounted(async () => {
  await fetchCourses()
})

// 方法
const fetchCourses = async () => {
  try {
    const response = await courseStore.fetchCourses()
    courses.value = response.courses
  } catch (error) {
    console.error('获取课程列表失败:', error)
    ElMessage.error('获取课程列表失败')
  }
}

const onModeChange = (_mode: string | number) => {
  // 切换模式时重置生成结果
  generatedQuestions.value = []
}

const onCourseChange = (courseId: string) => {
  selectedCourse.value = courses.value.find(course => course.id === courseId)
  courseConfig.value.chapterId = ''
}

const handleFileChange = (file: any) => {
  uploadConfig.value.file = file.raw
}

const beforeUpload = (file: File) => {
  const isValidType = file.type === 'application/pdf' || file.type === 'text/plain'
  const isValidSize = file.size / 1024 / 1024 < 10

  if (!isValidType) {
    ElMessage.error('只能上传 PDF 或 TXT 文件!')
    return false
  }
  if (!isValidSize) {
    ElMessage.error('文件大小不能超过 10MB!')
    return false
  }
  return true
}

const generateQuestions = async () => {
  try {
    // 验证表单
    let formRef
    switch (activeMode.value) {
      case 'course':
        formRef = courseFormRef.value
        break
      case 'upload':
        formRef = uploadFormRef.value
        break
      case 'text':
        formRef = textFormRef.value
        break
    }
    
    if (formRef) {
      await formRef.validate()
    }
    
    // 重置流式状态
    streamingState.value = {
      isStreaming: true,
      currentPhase: '正在准备生成题目...',
      currentQuestionIndex: -1,
      totalCount: totalQuestionCount.value,
      rawOutput: '',
      questions: []
    }
    
    // 重置窗口状态
    streamingWindowExpanded.value = false
    
    generating.value = true
    generatedQuestions.value = []
    
    const questionGenerator = new QuestionGenerator()
    
    // 获取启用的题型配置
    const enabledTypes = questionTypes.value
      .filter(t => t.enabled)
      .map(t => ({ type: t.type, count: t.count }))
    
    // 根据不同模式调用流式生成
    streamingState.value.currentPhase = '正在生成题目内容...'
    
    let questions: any[] = []
    
    switch (activeMode.value) {
      case 'course':
        questions = await generateFromCourseStream(questionGenerator, enabledTypes)
        break
      case 'upload':
        questions = await generateFromUploadStream(questionGenerator, enabledTypes)
        break
      case 'text':
        questions = await generateFromTextStream(questionGenerator, enabledTypes)
        break
    }
    
    streamingState.value.isStreaming = false
    streamingState.value.currentPhase = '生成完成！'
    generatedQuestions.value = questions
    
    ElMessage.success(`成功生成 ${questions.length} 道题目！`)
    
  } catch (error) {
    console.error('生成题目失败:', error)
    ElMessage.error('生成题目失败，请重试')
    streamingState.value.isStreaming = false
  } finally {
    generating.value = false
  }
}

// 流式生成方法
const generateFromCourseStream = async (
  generator: QuestionGenerator, 
  typeConfigs: Array<{ type: QuestionType; count: number }>
) => {
  const course = courses.value.find(c => c.id === courseConfig.value.courseId)
  if (!course) throw new Error('课程不存在')
  
  const chapterTitle = courseConfig.value.chapterId ? 
    selectedCourse.value?.chapters?.find((c: any) => c.id === courseConfig.value.chapterId)?.title || '' : 
    course.title
  
  return await generator.generateQuestionsStream(
    course.uploadedFileId || '',
    chapterTitle,
    typeConfigs,
    {
      language: courseConfig.value.language,
      difficulty: courseConfig.value.difficulty
    },
    (jsonStr, isComplete) => {
      if (isComplete) {
        streamingState.value.isStreaming = false
      }
      parseStreamingJson(jsonStr)
    }
  )
}

const generateFromUploadStream = async (
  generator: QuestionGenerator, 
  typeConfigs: Array<{ type: QuestionType; count: number }>
) => {
  if (!uploadConfig.value.file) {
    throw new Error('请先上传文件')
  }
  
  return await generator.generateQuestionsFromFileStream(
    uploadConfig.value.file,
    uploadConfig.value.topic,
    typeConfigs,
    {
      language: uploadConfig.value.language,
      difficulty: uploadConfig.value.difficulty
    },
    (jsonStr, isComplete) => {
      if (isComplete) {
        streamingState.value.isStreaming = false
      }
      parseStreamingJson(jsonStr)
    }
  )
}

const generateFromTextStream = async (
  generator: QuestionGenerator, 
  typeConfigs: Array<{ type: QuestionType; count: number }>
) => {
  return await generator.generateQuestionsFromTextStream(
    textConfig.value.content,
    textConfig.value.topic,
    typeConfigs,
    {
      language: textConfig.value.language,
      difficulty: textConfig.value.difficulty
    },
    (jsonStr, isComplete) => {
      if (isComplete) {
        streamingState.value.isStreaming = false
      }
      parseStreamingJson(jsonStr)
    }
  )
}

// 保留原有的非流式方法作为备用（暂时注释，避免未使用警告）
// const generateFromCourse = async (questionGenerator: QuestionGenerator) => {
//   const course = courses.value.find(c => c.id === courseConfig.value.courseId)
//   if (!course) {
//     throw new Error('课程不存在')
//   }
//   
//   const chapterTitle = courseConfig.value.chapterId ? 
//     selectedCourse.value?.chapters?.find((c: any) => c.id === courseConfig.value.chapterId)?.title || '' : 
//     course.title
//   
//   const enabledTypes = questionTypes.value
//     .filter(t => t.enabled)
//     .map(t => ({ type: t.type, count: t.count }))
//   
//   return await questionGenerator.generateQuestions(
//     course.uploadedFileId || '',
//     chapterTitle,
//     totalQuestionCount.value,
//     {
//       types: enabledTypes.map(t => t.type),
//       difficulties: [courseConfig.value.difficulty]
//     }
//   )
// }

// const generateFromUpload = async (questionGenerator: QuestionGenerator) => {
//   if (!uploadConfig.value.file) {
//     throw new Error('请先上传文件')
//   }
//   
//   const enabledTypes = questionTypes.value
//     .filter(t => t.enabled)
//     .map(t => ({ type: t.type, count: t.count }))
//   
//   return await questionGenerator.generateQuestionsFromFile(
//     uploadConfig.value.file,
//     uploadConfig.value.topic,
//     totalQuestionCount.value,
//     {
//       types: enabledTypes.map(t => t.type),
//       difficulties: [uploadConfig.value.difficulty]
//     }
//   )
// }

// const generateFromText = async (questionGenerator: QuestionGenerator) => {
//   const enabledTypes = questionTypes.value
//     .filter(t => t.enabled)
//     .map(t => ({ type: t.type, count: t.count }))
//   
//   return await questionGenerator.generateQuestionsFromText(
//     textConfig.value.content,
//     textConfig.value.topic,
//     totalQuestionCount.value,
//     {
//       types: enabledTypes.map(t => t.type),
//       difficulties: [textConfig.value.difficulty]
//     }
//   )
// }

// 编辑题目
const editQuestion = (question: any, index: number) => {
  editingQuestion.value = { ...question }
  editingIndex.value = index
  editDialogVisible.value = true
}

const handleQuestionSave = (question: any) => {
  if (editingIndex.value >= 0) {
    generatedQuestions.value[editingIndex.value] = { ...question }
  }
  editDialogVisible.value = false
  ElMessage.success('题目编辑保存成功')
}

const deleteQuestion = (index: number) => {
  generatedQuestions.value.splice(index, 1)
  ElMessage.success('题目删除成功')
}

// 导出题目
const exportQuestions = () => {
  if (generatedQuestions.value.length === 0) {
    ElMessage.warning('暂无题目可导出')
    return
  }
  exportDialogVisible.value = true
}

// 确认导出
const confirmExport = async () => {
  try {
    const questions = generatedQuestions.value.map((q, index) => ({
      id: `generated-${index}`,
      bankId: '',
      courseId: '',
      type: q.type,
      content: q.content,
      options: q.options,
      answer: q.answer,
      explanation: q.explanation,
      difficulty: q.difficulty,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: '',
      tags: [],
      status: 'active' as const
    }))
    
    const exportOptions = {
      format: exportForm.value.format as 'excel' | 'word' | 'pdf' | 'csv',
      includeAnswers: exportForm.value.include.includes('answer'),
      includeExplanations: exportForm.value.include.includes('explanation'),
      includeMetadata: exportForm.value.include.includes('options')
    }
    
    // 根据格式调用相应的导出方法
    switch (exportOptions.format) {
      case 'excel':
        await QuestionExporter.exportToExcel(questions, exportOptions)
        break
      case 'word':
        await QuestionExporter.exportToWord(questions, exportOptions)
        break
      case 'pdf':
        await QuestionExporter.exportToPDF(questions, exportOptions)
        break
      case 'csv':
        await QuestionExporter.exportToCSV(questions, exportOptions)
        break
    }
    
    ElMessage.success('导出成功')
    exportDialogVisible.value = false
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error(error instanceof Error ? error.message : '导出失败')
  }
}

// 保存到题库
const saveToBank = async () => {
  try {
    await questionStore.addQuestions(generatedQuestions.value)
    ElMessage.success('题目已保存到题库！')
  } catch (error) {
    console.error('保存题目失败:', error)
    ElMessage.error('保存题目失败')
  }
}

// 预览题目
const previewQuestions = () => {
  previewDialogVisible.value = true
}

// 工具函数
const getQuestionTypeName = (type: string) => {
  const typeMap: Record<string, string> = {
    single: '单选题',
    multiple: '多选题',
    judge: '判断题',
    fill: '填空题',
    essay: '简答题'
  }
  return typeMap[type] || type
}

const getDifficultyName = (difficulty: string) => {
  const diffMap: Record<string, string> = {
    easy: '简单',
    medium: '中等',
    hard: '困难'
  }
  return diffMap[difficulty] || difficulty
}

const goBack = () => {
  router.push('/questions')
}

// 数量调整方法
const increaseCount = (typeConfig: QuestionTypeConfig) => {
  if (typeConfig.count < typeConfig.max) {
    typeConfig.count++
  }
}

const decreaseCount = (typeConfig: QuestionTypeConfig) => {
  if (typeConfig.count > typeConfig.min) {
    typeConfig.count--
  }
}

const getGeneratingFieldName = (field: string) => {
  const names: Record<string, string> = {
    content: '题目内容',
    options: '选项',
    answer: '答案',
    explanation: '解析'
  }
  return names[field] || ''
}

// 切换流式窗口展开/收起
const toggleStreamingWindow = () => {
  streamingWindowExpanded.value = !streamingWindowExpanded.value
}

// 滚动到底部
const scrollToBottom = () => {
  if (streamingContentRef.value) {
    streamingContentRef.value.scrollTop = streamingContentRef.value.scrollHeight
  }
}

// 简单的JSON语法高亮
const highlightJson = (jsonStr: string) => {
  return jsonStr
    .replace(/"([^"]+)":/g, '<span class="json-key">"$1":</span>')
    .replace(/: "([^"]+)"/g, ': <span class="json-string">"$1"</span>')
    .replace(/: (\d+)/g, ': <span class="json-number">$1</span>')
    .replace(/: (true|false)/g, ': <span class="json-boolean">$1</span>')
    .replace(/: null/g, ': <span class="json-boolean">null</span>')
}

// 解析流式JSON内容
const parseStreamingJson = (jsonStr: string) => {
  // 更新原始输出显示（带语法高亮）
  streamingState.value.rawOutput = highlightJson(jsonStr)
  
  // 自动滚动到底部
  setTimeout(() => {
    scrollToBottom()
  }, 50)
  
  try {
    let cleanJson = jsonStr.trim()
    if (cleanJson.startsWith('```json')) {
      cleanJson = cleanJson.replace(/^```json\s*/, '').replace(/\s*```$/, '')
    } else if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.replace(/^```\s*/, '').replace(/\s*```$/, '')
    }
    
    const result = JSON.parse(cleanJson)
    
    if (result.questions && Array.isArray(result.questions)) {
      // 逐个添加题目，模拟逐步生成效果
      result.questions.forEach((q: any, index: number) => {
        if (!streamingState.value.questions[index]) {
          // 新题目，创建占位
          streamingState.value.questions[index] = {
            isGenerating: true,
            generatingField: 'content'
          }
          streamingState.value.currentQuestionIndex = index
        }
        
        const streamQuestion = streamingState.value.questions[index]
        
        // 逐步填充字段
        if (q.type) streamQuestion.type = q.type
        if (q.difficulty) streamQuestion.difficulty = q.difficulty
        
        if (q.content && !streamQuestion.content) {
          streamQuestion.content = q.content
          streamQuestion.generatingField = 'options'
        }
        
        if (q.options && !streamQuestion.options) {
          streamQuestion.options = q.options
          streamQuestion.generatingField = 'answer'
        }
        
        if (q.answer && !streamQuestion.answer) {
          streamQuestion.answer = q.answer
          streamQuestion.generatingField = 'explanation'
        }
        
        if (q.explanation && !streamQuestion.explanation) {
          streamQuestion.explanation = q.explanation
          streamQuestion.generatingField = 'complete'
          streamQuestion.isGenerating = false
        }
      })
    }
  } catch (error) {
    console.log('JSON解析失败，内容可能不完整:', error)
  }
}
</script>

<style lang="scss" scoped>
.question-generate {
  margin: 0 auto;
  padding: 24px;
  background: var(--brand-bg-primary);
  min-height: 100vh-10;
}

// 左右分栏布局
.generate-layout {
  display: flex;
  gap: 24px;
  height: calc(100vh - 48px);
}

.mode-selection {
  width: 400px;
  flex-shrink: 0;
  height: calc(100vh - 48px);
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 24px;
}

.mode-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.mode-content-scrollable {
  flex: 1;
  overflow-y: auto;
  padding: 0 0 0 20px;
  margin-bottom: 40px; /* 为固定按钮留出空间 */
  max-height: calc(100vh - 200px); /* 确保有滚动条 */
  
  /* 自定义滚动条样式 */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: var(--brand-bg-secondary);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--brand-border);
    border-radius: 3px;
    
    &:hover {
      background: var(--brand-text-secondary);
    }
  }
}

.content-area {
  flex: 1;
  min-width: 0;
  width: 100%;
  height: calc(100vh - 48px);
  overflow-y: auto;
  background: white;
  border-radius: var(--brand-radius-lg);
  border: 1px solid var(--brand-border);
  box-shadow: var(--brand-shadow-sm);
}

.content-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  background: var(--brand-bg-secondary);
  border-radius: var(--brand-radius-lg);
  border: 1px solid var(--brand-border);
}

// 垂直Tab样式
:deep(.el-tabs--vertical) {
  .el-tabs__header {
    width: 100%;
    margin-right: 0;
  }
  
  .el-tabs__nav {
    flex-direction: column;
    width: 100%;
  }
  
  .el-tabs__item {
    text-align: left;
    padding: 16px 20px;
    // margin-bottom: 8px;
    border-radius: var(--brand-radius-base);
    transition: all 0.3s ease;
    
    &:hover {
      background: var(--brand-bg-primary);
      color: var(--brand-primary);
    }
    
    &.is-active {
      background: var(--brand-primary);
      color: white;
      font-weight: 600;
    }
  }
  
  .el-tabs__content {
    padding: 0;
  }
}

// 响应式设计
@media (max-width: 1024px) {
  .generate-layout {
    flex-direction: column;
  }
  
  .mode-selection {
    width: 100%;
  }
  
  :deep(.el-tabs--vertical) {
    .el-tabs__nav {
      flex-direction: row;
      overflow-x: auto;
    }
    
    .el-tabs__item {
      white-space: nowrap;
      margin-bottom: 0;
      margin-right: 8px;
    }
  }
}

.page-header {
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--brand-border);

  .header-content {
    .page-title {
      font-size: 28px;
      font-weight: 600;
      color: var(--brand-text-primary);
      margin: 0 0 8px 0;
      background: linear-gradient(135deg, var(--brand-primary), var(--brand-secondary));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .page-description {
      color: var(--brand-text-secondary);
      margin: 0;
      font-size: 16px;
    }
  }
}

.generate-modes {
  margin-bottom: 32px;

  .el-card {
    border-radius: var(--brand-radius-lg);
    box-shadow: var(--brand-shadow-sm);
    border: 1px solid var(--brand-border);
  }

  .el-card__header {
    background: var(--brand-bg-secondary);
    border-bottom: 1px solid var(--brand-border);
    
    h3 {
      margin: 0;
      color: var(--brand-text-primary);
      font-weight: 600;
    }
  }
}

.mode-tabs {
  margin-top: 20px;

  :deep(.el-tabs__header) {
    margin-bottom: 24px;
  }

  :deep(.el-tabs__nav-wrap) {
    padding: 0 20px;
  }

  :deep(.el-tabs__item) {
    font-weight: 500;
    color: var(--brand-text-secondary);
    
    &.is-active {
      color: var(--brand-primary);
    }
  }

  :deep(.el-tabs__active-bar) {
    background: var(--brand-primary);
  }
}

.mode-content {
  padding: 16px 0;
}

.mode-description {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  padding: 16px;
  background: linear-gradient(135deg, var(--brand-bg-secondary), #f8f9fa);
  border-radius: var(--brand-radius-lg);
  border: 1px solid var(--brand-border);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--brand-shadow-md);
  }

  .el-icon {
    font-size: 2rem;
    color: var(--brand-primary);
    flex-shrink: 0;
  }

  h4 {
    margin: 0 0 4px 0;
    color: var(--brand-text-primary);
    font-size: 16px;
    font-weight: 600;
  }

  p {
    margin: 0;
    color: var(--brand-text-secondary);
    line-height: 1.5;
    font-size: 14px;
  }
}

.generate-actions-fixed {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  padding: 16px 20px;
  border-top: 1px solid var(--brand-border);
  z-index: 10;
  text-align: center;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
  flex-shrink: 0; /* 防止被压缩 */

  .el-button {
    height: 56px;
    padding: 0 48px;
    font-size: 18px;
    font-weight: 600;
    border-radius: var(--brand-radius-lg);
    // background: linear-gradient(135deg, var(--brand-primary), var(--brand-secondary));
    border: none;
    background-color: #0066cc;
    box-shadow: var(--brand-shadow-md);
    transition: all 0.3s ease;
    min-width: 200px; /* 确保按钮有最小宽度 */

    &:hover {
      transform: translateY(-2px);
      box-shadow: var(--brand-shadow-lg);
    }

    &:active {
      transform: translateY(0);
    }
  }
}

.generate-progress {
  margin: 0 0 24px 0;

  .el-card {
    border-radius: var(--brand-radius-lg);
    border: 1px solid var(--brand-border);
  }

  .progress-content {
    padding: 24px 0;
  }

  .progress-bar {
    margin-top: 24px;
  }
}

.generate-results {
  margin: 0;

  .el-card {
    border-radius: var(--brand-radius-lg);
    border: 1px solid var(--brand-border);
    box-shadow: var(--brand-shadow-sm);
  }

  .results-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;

    h3 {
      margin: 0;
      color: var(--brand-text-primary);
      font-weight: 600;
    }

    .results-actions {
      display: flex;
      gap: 12px;
    }
  }

  .questions-list {
    margin-top: 24px;
  }

  .question-item {
    border: 1px solid var(--brand-border);
    border-radius: var(--brand-radius-lg);
    padding: 24px;
    margin-bottom: 24px;
    background: var(--brand-bg-secondary);
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 4px;
      height: 100%;
      background: linear-gradient(135deg, var(--brand-primary), var(--brand-secondary));
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    &:hover {
      transform: translateY(-2px);
      box-shadow: var(--brand-shadow-md);
      border-color: var(--brand-primary);

      &::before {
        opacity: 1;
      }
    }

    .question-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 20px;

      .question-number {
        font-weight: bold;
        color: var(--brand-primary);
        font-size: 18px;
        background: var(--brand-bg-primary);
        padding: 8px 12px;
        border-radius: var(--brand-radius-base);
        border: 1px solid var(--brand-border);
      }

      .question-type, .question-difficulty {
        padding: 6px 12px;
        border-radius: var(--brand-radius-base);
        font-size: 12px;
        font-weight: 500;
        color: white;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .question-type {
        background: linear-gradient(135deg, #67c23a, #85ce61);
      }

      .question-difficulty {
        background: linear-gradient(135deg, #e6a23c, #f0c78a);
      }

      .question-actions {
        margin-left: auto;
        display: flex;
        gap: 8px;

        .el-button {
          padding: 8px;
          border-radius: var(--brand-radius-base);
          transition: all 0.3s ease;

          &:hover {
            background: var(--brand-primary);
            color: white;
            transform: scale(1.1);
          }
        }
      }
    }

    .question-content {
      font-size: 16px;
      line-height: 1.7;
      margin-bottom: 20px;
      color: var(--brand-text-primary);
      font-weight: 500;
    }

    .question-options {
      margin: 20px 0;

      .option {
        margin: 12px 0;
        padding: 12px 16px;
        background: white;
        border-radius: var(--brand-radius-base);
        border-left: 4px solid var(--brand-primary);
        transition: all 0.3s ease;

        &:hover {
          background: var(--brand-bg-primary);
          transform: translateX(4px);
        }
      }
    }

    .question-answer, .question-explanation {
      margin: 16px 0;
      padding: 16px;
      background: linear-gradient(135deg, #f0f9ff, #e6f7ff);
      border-radius: var(--brand-radius-base);
      border-left: 4px solid var(--brand-primary);
      border: 1px solid #b3d8ff;

      strong {
        color: var(--brand-text-primary);
        font-weight: 600;
      }
    }

    .question-answer {
      color: var(--brand-success);
    }

    .question-explanation {
      color: var(--brand-text-secondary);
      line-height: 1.6;
    }
  }
}

// 生成设置样式
.generation-settings-header {
  margin-bottom: 16px;
  padding: 16px;
  background: var(--brand-bg-secondary);
  border-radius: var(--brand-radius-lg);
  border: 1px solid var(--brand-border);
  flex-shrink: 0; /* 防止被压缩 */

  .settings-summary {
    margin-bottom: 12px;
    
    h4 {
      font-size: 15px;
      font-weight: 600;
      color: var(--brand-text-primary);
      
      .total-count {
        color: var(--brand-primary);
        font-size: 16px;
        margin-left: 6px;
      }
    }
  }

  .top-controls {
    display: flex;
    gap: 16px;
    flex-wrap: wrap; /* 在小屏幕上换行 */
    
    .el-form-item {
      margin-bottom: 0;
      min-width: 150px; /* 增加最小宽度 */
      flex: 1; /* 让选择器平均分配空间 */
      
      :deep(.el-form-item__label) {
        font-size: 13px;
        padding-bottom: 4px;
      }
      
      :deep(.el-select) {
        width: 100%;
      }
    }
  }
}

.question-types-section {
  margin-top: 16px;
  flex-shrink: 0; /* 防止被压缩 */
  
  h4 {
    font-size: 13px;
    color: var(--brand-text-secondary);
    margin-bottom: 12px;
  }
}

.question-type-list {
  .question-type-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    margin-bottom: 8px;
    background: white;
    border: 1px solid var(--brand-border);
    border-radius: var(--brand-radius-base);
    transition: all 0.3s ease;
    flex-shrink: 0; /* 防止被压缩 */
    
    &.is-enabled {
      border-color: var(--brand-primary);
      background: rgba(64, 158, 255, 0.05);
    }
    
    .quantity-control {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-shrink: 0; /* 防止数量控制区域被压缩 */
      
      .el-input-number {
        width: 70px;
      }
      
      .el-button {
        width: 24px;
        height: 24px;
        padding: 0;
      }
    }
    
    :deep(.el-checkbox) {
      .el-checkbox__label {
        font-size: 14px;
      }
    }
  }
}

.streaming-progress {
  margin-bottom: 24px;
  
  .streaming-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .header-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .progress-text {
      color: var(--brand-primary);
      font-weight: 600;
    }
  }
  
  .phase-indicator {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
    color: var(--brand-text-secondary);
    
    .rotating {
      animation: rotate 1s linear infinite;
    }
  }
  
  .streaming-output-window {
    margin-top: 16px;
    border: 1px solid var(--brand-border);
    border-radius: var(--brand-radius-base);
    background: #f8f9fa;
    overflow: hidden;
    transition: all 0.3s ease;
    height: 120px; /* 固定高度 */
    
    &.expanded {
      height: 300px; /* 展开时的高度 */
    }
    
    .streaming-content {
      height: 100%;
      overflow-y: auto;
      padding: 12px;
      
      /* 自定义滚动条 */
      &::-webkit-scrollbar {
        width: 6px;
      }
      
      &::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 3px;
      }
      
      &::-webkit-scrollbar-thumb {
        background: #c1c1c1;
        border-radius: 3px;
        
        &:hover {
          background: #a8a8a8;
        }
      }
    }
    
    .streaming-json {
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: 12px;
      line-height: 1.4;
      color: #333;
      white-space: pre-wrap;
      word-break: break-all;
      
      /* 高亮JSON语法 */
      :deep(.json-key) {
        color: #0066cc;
        font-weight: bold;
      }
      
      :deep(.json-string) {
        color: #008000;
      }
      
      :deep(.json-number) {
        color: #cc6600;
      }
      
      :deep(.json-boolean) {
        color: #cc0066;
      }
    }
  }
}

.questions-list.streaming {
  margin-bottom: 24px;
  
  .question-item.is-generating {
    opacity: 0.8;
    
    .generating-indicator {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 12px;
      color: var(--brand-primary);
      
      .rotating {
        animation: rotate 1s linear infinite;
      }
    }
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

// 动画效果
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.question-item {
  animation: fadeInUp 0.6s ease-out;
}

// 响应式设计
@media (max-width: 768px) {
  .question-generate {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;
    gap: 20px;
    align-items: stretch;
    text-align: center;
  }

  .mode-description {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }

  .results-header {
    flex-direction: column;
    gap: 20px;
    align-items: stretch;

    .results-actions {
      justify-content: center;
      flex-wrap: wrap;
    }
  }

  .question-item {
    padding: 20px;

    .question-header {
      flex-direction: column;
      align-items: stretch;
      gap: 12px;

      .question-actions {
        margin-left: 0;
        justify-content: center;
      }
    }
  }

  .generate-actions .el-button {
    width: 100%;
    max-width: 300px;
  }
}

@media (max-width: 480px) {
  .question-generate {
    padding: 12px;
  }

  .mode-description {
    padding: 16px;
  }

  .question-item {
    padding: 16px;
  }
}
</style>