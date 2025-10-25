<template>
  <div class="question-generate">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">生成题目</h1>
        <p class="page-description">基于课程内容智能生成练习题目</p>
      </div>
      <div class="header-actions">
        <el-button @click="goBack">返回</el-button>
      </div>
    </div>

    <!-- 生成配置 -->
    <div class="generate-config">
      <el-card>
        <template #header>
          <h3>生成配置</h3>
        </template>
        
        <el-form :model="generateConfig" :rules="configRules" ref="configFormRef" label-width="120px">
          <el-form-item label="选择课程" prop="courseId">
            <el-select v-model="generateConfig.courseId" placeholder="请选择课程" @change="onCourseChange">
              <el-option 
                v-for="course in courses" 
                :key="course.id" 
                :label="course.title" 
                :value="course.id" 
              />
            </el-select>
          </el-form-item>
          
          <el-form-item label="选择章节" prop="chapterId" v-if="selectedCourse">
            <el-select v-model="generateConfig.chapterId" placeholder="请选择章节（可选）" clearable>
              <el-option 
                v-for="chapter in selectedCourse.chapters" 
                :key="chapter.id" 
                :label="chapter.title" 
                :value="chapter.id" 
              />
            </el-select>
          </el-form-item>
          
          <el-form-item label="题目数量" prop="questionCount">
            <el-input-number 
              v-model="generateConfig.questionCount" 
              :min="1" 
              :max="50" 
              placeholder="题目数量"
            />
          </el-form-item>
          
          <el-form-item label="题目类型" prop="types">
            <el-checkbox-group v-model="generateConfig.types">
              <el-checkbox label="single">单选题</el-checkbox>
              <el-checkbox label="multiple">多选题</el-checkbox>
              <el-checkbox label="judge">判断题</el-checkbox>
              <el-checkbox label="fill">填空题</el-checkbox>
              <el-checkbox label="essay">简答题</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
          
          <el-form-item label="难度级别" prop="difficulties">
            <el-checkbox-group v-model="generateConfig.difficulties">
              <el-checkbox label="easy">简单</el-checkbox>
              <el-checkbox label="medium">中等</el-checkbox>
              <el-checkbox label="hard">困难</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <!-- 生成进度 -->
    <div v-if="generating" class="generate-progress">
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

    <!-- 生成结果 -->
    <div v-if="generatedQuestions.length > 0" class="generate-results">
      <el-card>
        <template #header>
          <div class="result-header">
            <h3>生成结果</h3>
            <div class="result-actions">
              <el-button @click="saveAllQuestions" type="primary">
                <FontAwesomeIcon :icon="['fas', 'save']" class="mr-2" />
                保存全部题目
              </el-button>
              <el-button @click="regenerateQuestions">
                <FontAwesomeIcon :icon="['fas', 'redo']" class="mr-2" />
                重新生成
              </el-button>
            </div>
          </div>
        </template>
        
        <div class="questions-list">
          <div v-for="(question, index) in generatedQuestions" :key="index" class="question-item">
            <div class="question-header">
              <div class="question-meta">
                <el-tag :type="getTypeColor(question.type)">
                  {{ getTypeText(question.type) }}
                </el-tag>
                <el-tag :type="getDifficultyColor(question.difficulty)" size="small">
                  {{ getDifficultyText(question.difficulty) }}
                </el-tag>
              </div>
              <div class="question-actions">
                <el-button type="text" size="small" @click="editQuestion(question, index)">
                  <FontAwesomeIcon :icon="['fas', 'edit']" />
                </el-button>
                <el-button type="text" size="small" @click="deleteQuestion(index)">
                  <FontAwesomeIcon :icon="['fas', 'trash']" />
                </el-button>
              </div>
            </div>
            
            <div class="question-content">
              <div class="question-text">
                {{ question.content }}
              </div>
              
              <div v-if="question.options && question.options.length > 0" class="question-options">
                <div v-for="(option, optionIndex) in question.options" :key="optionIndex" class="option-item">
                  <span class="option-label">{{ String.fromCharCode(65 + optionIndex) }}.</span>
                  <span class="option-text">{{ option }}</span>
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
        </div>
      </el-card>
    </div>

    <!-- 生成按钮 -->
    <div class="generate-actions">
      <el-button 
        type="primary" 
        size="large"
        @click="generateQuestions"
        :loading="generating"
        :disabled="!canGenerate"
      >
        <FontAwesomeIcon :icon="['fas', 'magic']" class="mr-2" />
        开始生成题目
      </el-button>
    </div>

    <!-- 题目编辑对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      title="编辑题目"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form :model="editingQuestion" label-width="80px">
        <el-form-item label="题目内容">
          <el-input 
            v-model="editingQuestion.content" 
            type="textarea" 
            :rows="3"
            placeholder="请输入题目内容"
          />
        </el-form-item>
        
        <el-form-item label="选项" v-if="editingQuestion.options">
          <div v-for="(option, index) in editingQuestion.options" :key="index" class="option-edit">
            <el-input 
              v-model="editingQuestion.options[index]" 
              :placeholder="`选项 ${String.fromCharCode(65 + index)}`"
            />
          </div>
        </el-form-item>
        
        <el-form-item label="正确答案">
          <el-input v-model="editingQuestion.answer" placeholder="请输入正确答案" />
        </el-form-item>
        
        <el-form-item label="详细解析">
          <el-input 
            v-model="editingQuestion.explanation" 
            type="textarea" 
            :rows="3"
            placeholder="请输入详细解析"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveQuestionEdit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { 
  faSave, faRedo, faMagic, faEdit, faTrash
} from '@fortawesome/free-solid-svg-icons'
import { useQuestionStore } from '@/store/modules/question'
import { useCourseStore } from '@/store/modules/course'
import QuestionGenerator from '@/shared/services/questionGenerator'
import type { QuestionType, QuestionDifficulty } from '@/types/course'

// 添加图标到库
library.add(faSave, faRedo, faMagic, faEdit, faTrash)

const router = useRouter()
const route = useRoute()
const questionStore = useQuestionStore()
const courseStore = useCourseStore()

// 响应式数据
const courses = ref<any[]>([])
const selectedCourse = ref<any>(null)
const generating = ref(false)
const generatedQuestions = ref<any[]>([])
const progressMessage = ref('')
const progressType = ref<'info' | 'success' | 'warning' | 'error'>('info')
const progressPercentage = ref(0)
const editDialogVisible = ref(false)
const editingQuestion = ref<any>(null)
const editingIndex = ref(-1)

const configFormRef = ref()

const generateConfig = ref({
  courseId: '',
  chapterId: '',
  questionCount: 5,
  types: ['single', 'multiple'] as QuestionType[],
  difficulties: ['easy', 'medium'] as QuestionDifficulty[]
})

const configRules = {
  courseId: [
    { required: true, message: '请选择课程', trigger: 'change' }
  ],
  questionCount: [
    { required: true, message: '请输入题目数量', trigger: 'blur' }
  ],
  types: [
    { required: true, message: '请选择题目类型', trigger: 'change' }
  ],
  difficulties: [
    { required: true, message: '请选择难度级别', trigger: 'change' }
  ]
}

// 计算属性
const canGenerate = computed(() => {
  return generateConfig.value.courseId && 
         generateConfig.value.questionCount > 0 && 
         generateConfig.value.types.length > 0 && 
         generateConfig.value.difficulties.length > 0
})

// 生命周期
onMounted(async () => {
  await fetchCourses()
  
  // 如果路由中有 courseId 参数，自动选择该课程
  const courseId = route.params.courseId as string
  if (courseId && courses.value.length > 0) {
    const course = courses.value.find(c => c.id === courseId)
    if (course) {
      generateConfig.value.courseId = courseId
      selectedCourse.value = course
    }
  }
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

const onCourseChange = (courseId: string) => {
  selectedCourse.value = courses.value.find(course => course.id === courseId)
  generateConfig.value.chapterId = ''
}

const generateQuestions = async () => {
  try {
    if (!configFormRef.value) return
    await configFormRef.value.validate()
    
    generating.value = true
    generatedQuestions.value = []
    progressMessage.value = '正在生成题目...'
    progressType.value = 'info'
    progressPercentage.value = 0
    
    const course = courses.value.find(c => c.id === generateConfig.value.courseId)
    if (!course) {
      throw new Error('课程不存在')
    }
    
    const questionGenerator = new QuestionGenerator()
    
    // 模拟生成进度
    const progressInterval = setInterval(() => {
      if (progressPercentage.value < 90) {
        progressPercentage.value += 10
      }
    }, 200)
    
    // 生成题目
    const questions = await questionGenerator.generateQuestions(
      course.uploadedFileId || '',
      generateConfig.value.chapterId ? 
        selectedCourse.value?.chapters?.find((c: any) => c.id === generateConfig.value.chapterId)?.title || '' : 
        course.title,
      generateConfig.value.questionCount,
      {
        types: generateConfig.value.types,
        difficulties: generateConfig.value.difficulties
      }
    )
    
    clearInterval(progressInterval)
    progressPercentage.value = 100
    progressMessage.value = '题目生成完成！'
    progressType.value = 'success'
    
    generatedQuestions.value = questions
    
  } catch (error) {
    console.error('生成题目失败:', error)
    progressMessage.value = `生成题目失败: ${error instanceof Error ? error.message : '未知错误'}`
    progressType.value = 'error'
    ElMessage.error('生成题目失败')
  } finally {
    generating.value = false
  }
}

const editQuestion = (question: any, index: number) => {
  editingQuestion.value = { ...question }
  editingIndex.value = index
  editDialogVisible.value = true
}

const saveQuestionEdit = () => {
  if (editingIndex.value >= 0) {
    generatedQuestions.value[editingIndex.value] = { ...editingQuestion.value }
  }
  editDialogVisible.value = false
  ElMessage.success('题目编辑保存成功')
}

const deleteQuestion = (index: number) => {
  generatedQuestions.value.splice(index, 1)
  ElMessage.success('题目删除成功')
}

const saveAllQuestions = async () => {
  try {
    if (generatedQuestions.value.length === 0) {
      ElMessage.warning('没有题目可保存')
      return
    }
    
    // 创建题库
    const course = courses.value.find(c => c.id === generateConfig.value.courseId)
    const questionBank = await questionStore.createQuestionBank(
      generateConfig.value.courseId,
      `${course?.title} - 练习题库`,
      `基于${course?.title}生成的练习题库`
    )
    
    // 保存题目
    for (const questionData of generatedQuestions.value) {
      await questionStore.createQuestion(questionData, questionBank.id)
    }
    
    ElMessage.success('题目保存成功')
    router.push('/questions')
    
  } catch (error) {
    console.error('保存题目失败:', error)
    ElMessage.error('保存题目失败')
  }
}

const regenerateQuestions = () => {
  generatedQuestions.value = []
  generateQuestions()
}

const goBack = () => {
  router.back()
}

// 工具函数
const getTypeColor = (type: QuestionType): string => {
  switch (type) {
    case 'single': return 'primary'
    case 'multiple': return 'success'
    case 'judge': return 'warning'
    case 'fill': return 'info'
    case 'essay': return 'danger'
    default: return 'info'
  }
}

const getTypeText = (type: QuestionType): string => {
  switch (type) {
    case 'single': return '单选题'
    case 'multiple': return '多选题'
    case 'judge': return '判断题'
    case 'fill': return '填空题'
    case 'essay': return '简答题'
    default: return '未知'
  }
}

const getDifficultyColor = (difficulty: QuestionDifficulty): string => {
  switch (difficulty) {
    case 'easy': return 'success'
    case 'medium': return 'warning'
    case 'hard': return 'danger'
    default: return 'info'
  }
}

const getDifficultyText = (difficulty: QuestionDifficulty): string => {
  switch (difficulty) {
    case 'easy': return '简单'
    case 'medium': return '中等'
    case 'hard': return '困难'
    default: return '未知'
  }
}
</script>

<style lang="scss" scoped>
.question-generate {
  padding: 24px;
  max-width: 1000px;
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

.generate-config {
  margin-bottom: 32px;

  .el-card {
    border-radius: var(--brand-radius-lg);
  }
}

.generate-progress {
  margin-bottom: 32px;

  .progress-content {
    .progress-bar {
      margin-top: 20px;
    }
  }
}

.generate-results {
  margin-bottom: 32px;

  .result-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    h3 {
      margin: 0;
    }

    .result-actions {
      display: flex;
      gap: 12px;
    }
  }

  .questions-list {
    .question-item {
      margin-bottom: 24px;
      padding: 20px;
      background: var(--brand-bg-secondary);
      border-radius: var(--brand-radius-base);
      border: 1px solid var(--brand-border);

      .question-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 16px;

        .question-meta {
          display: flex;
          gap: 8px;
        }

        .question-actions {
          display: flex;
          gap: 8px;

          .el-button {
            padding: 4px;
            color: var(--brand-text-tertiary);
            
            &:hover {
              color: var(--brand-text-primary);
              background: var(--brand-bg-primary);
            }
          }
        }
      }

      .question-content {
        .question-text {
          font-size: 16px;
          font-weight: 500;
          color: var(--brand-text-primary);
          margin-bottom: 12px;
          line-height: 1.5;
        }

        .question-options {
          margin-bottom: 12px;

          .option-item {
            display: flex;
            align-items: flex-start;
            margin-bottom: 8px;
            font-size: 14px;
            color: var(--brand-text-secondary);

            .option-label {
              font-weight: 500;
              margin-right: 8px;
              min-width: 20px;
            }

            .option-text {
              flex: 1;
              line-height: 1.4;
            }
          }
        }

        .question-answer {
          margin-bottom: 8px;
          font-size: 14px;
          color: var(--brand-success);

          strong {
            color: var(--brand-text-primary);
          }
        }

        .question-explanation {
          font-size: 14px;
          color: var(--brand-text-secondary);
          line-height: 1.5;

          strong {
            color: var(--brand-text-primary);
          }
        }
      }
    }
  }
}

.generate-actions {
  text-align: center;
  padding: 32px 0;

  .el-button {
    height: 48px;
    padding: 0 32px;
    font-size: 16px;
  }
}

.option-edit {
  display: flex;
  align-items: center;
  margin-bottom: 8px;

  .el-input {
    flex: 1;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .question-generate {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .result-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;

    .result-actions {
      justify-content: center;
    }
  }
}
</style>
