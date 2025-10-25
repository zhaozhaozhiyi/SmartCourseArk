<template>
  <div class="question-edit" v-loading="loading">
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">编辑题目</h1>
        <p class="page-description">编辑和优化题目内容</p>
      </div>
      <div class="header-actions">
        <el-button @click="goBack">返回</el-button>
        <el-button type="primary" @click="saveQuestion">保存</el-button>
      </div>
    </div>

    <div class="edit-content">
      <el-card>
        <template #header>
          <h3>题目信息</h3>
        </template>
        
        <el-form :model="questionForm" :rules="formRules" ref="formRef" label-width="120px">
          <el-form-item label="题目类型" prop="type">
            <el-select v-model="questionForm.type" placeholder="请选择题目类型" @change="onTypeChange">
              <el-option label="单选题" value="single" />
              <el-option label="多选题" value="multiple" />
              <el-option label="判断题" value="judge" />
              <el-option label="填空题" value="fill" />
              <el-option label="简答题" value="essay" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="题目内容" prop="content">
            <el-input 
              v-model="questionForm.content" 
              type="textarea" 
              :rows="4"
              placeholder="请输入题目内容"
            />
          </el-form-item>
          
          <el-form-item 
            label="选项" 
            prop="options" 
            v-if="questionForm.type === 'single' || questionForm.type === 'multiple'"
          >
            <div v-for="(option, index) in questionForm.options" :key="index" class="option-item">
              <el-input 
                v-model="questionForm.options[index]" 
                :placeholder="`选项 ${String.fromCharCode(65 + index)}`"
              >
                <template #append>
                  <el-button @click="removeOption(index)" type="danger" plain>
                    <FontAwesomeIcon :icon="['fas', 'trash']" />
                  </el-button>
                </template>
              </el-input>
            </div>
            <el-button @click="addOption" type="primary" plain>
              <FontAwesomeIcon :icon="['fas', 'plus']" class="mr-2" />
              添加选项
            </el-button>
          </el-form-item>
          
          <el-form-item label="正确答案" prop="answer">
            <el-input 
              v-model="questionForm.answer" 
              placeholder="请输入正确答案"
              :type="questionForm.type === 'judge' ? 'select' : 'text'"
            >
              <template #append v-if="questionForm.type === 'judge'">
                <el-select v-model="questionForm.answer" placeholder="选择答案">
                  <el-option label="正确" value="正确" />
                  <el-option label="错误" value="错误" />
                </el-select>
              </template>
            </el-input>
          </el-form-item>
          
          <el-form-item label="详细解析" prop="explanation">
            <el-input 
              v-model="questionForm.explanation" 
              type="textarea" 
              :rows="3"
              placeholder="请输入详细解析"
            />
          </el-form-item>
          
          <el-form-item label="难度级别" prop="difficulty">
            <el-select v-model="questionForm.difficulty" placeholder="请选择难度级别">
              <el-option label="简单" value="easy" />
              <el-option label="中等" value="medium" />
              <el-option label="困难" value="hard" />
            </el-select>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- 题目预览 -->
      <el-card>
        <template #header>
          <h3>题目预览</h3>
        </template>
        
        <div class="question-preview">
          <div class="preview-header">
            <el-tag :type="getTypeColor(questionForm.type)">
              {{ getTypeText(questionForm.type) }}
            </el-tag>
            <el-tag :type="getDifficultyColor(questionForm.difficulty)" size="small">
              {{ getDifficultyText(questionForm.difficulty) }}
            </el-tag>
          </div>
          
          <div class="preview-content">
            <h4>题目内容</h4>
            <p>{{ questionForm.content || '请输入题目内容' }}</p>
            
            <div v-if="questionForm.options && questionForm.options.length > 0">
              <h4>选项</h4>
              <div v-for="(option, index) in questionForm.options" :key="index" class="option-item">
                <span class="option-label">{{ String.fromCharCode(65 + index) }}.</span>
                <span class="option-text">{{ option }}</span>
              </div>
            </div>
            
            <div class="answer-section">
              <h4>正确答案</h4>
              <p class="answer-text">{{ questionForm.answer || '请输入正确答案' }}</p>
            </div>
            
            <div class="explanation-section">
              <h4>详细解析</h4>
              <p class="explanation-text">{{ questionForm.explanation || '请输入详细解析' }}</p>
            </div>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faTrash, faPlus } from '@fortawesome/free-solid-svg-icons'
import { useQuestionStore } from '@/store/modules/question'
import type { QuestionType, QuestionDifficulty } from '@/types/course'

// 添加图标到库
library.add(faTrash, faPlus)

const route = useRoute()
const router = useRouter()
const questionStore = useQuestionStore()

// 响应式数据
const loading = ref(false)
const formRef = ref()

const questionForm = ref({
  type: 'single' as QuestionType,
  content: '',
  options: ['', '', '', ''],
  answer: '',
  explanation: '',
  difficulty: 'medium' as QuestionDifficulty
})

const formRules = {
  type: [
    { required: true, message: '请选择题目类型', trigger: 'change' }
  ],
  content: [
    { required: true, message: '请输入题目内容', trigger: 'blur' }
  ],
  answer: [
    { required: true, message: '请输入正确答案', trigger: 'blur' }
  ],
  explanation: [
    { required: true, message: '请输入详细解析', trigger: 'blur' }
  ],
  difficulty: [
    { required: true, message: '请选择难度级别', trigger: 'change' }
  ]
}

// 生命周期
onMounted(async () => {
  const questionId = route.params.id as string
  if (questionId) {
    await fetchQuestion(questionId)
  }
})

// 方法
const fetchQuestion = async (questionId: string) => {
  try {
    loading.value = true
    const question = await questionStore.fetchQuestion(questionId)
    if (question) {
      questionForm.value = {
        type: question.type,
        content: question.content,
        options: question.options || ['', '', '', ''],
        answer: question.answer,
        explanation: question.explanation,
        difficulty: question.difficulty
      }
    }
  } catch (error) {
    console.error('获取题目信息失败:', error)
    ElMessage.error('获取题目信息失败')
  } finally {
    loading.value = false
  }
}

const onTypeChange = (type: QuestionType) => {
  if (type === 'judge') {
    questionForm.value.options = []
    questionForm.value.answer = '正确'
  } else if (type === 'fill' || type === 'essay') {
    questionForm.value.options = []
  } else {
    if (questionForm.value.options.length === 0) {
      questionForm.value.options = ['', '', '', '']
    }
  }
}

const addOption = () => {
  questionForm.value.options.push('')
}

const removeOption = (index: number) => {
  if (questionForm.value.options.length > 2) {
    questionForm.value.options.splice(index, 1)
  } else {
    ElMessage.warning('至少需要2个选项')
  }
}

const saveQuestion = async () => {
  try {
    if (!formRef.value) return
    await formRef.value.validate()
    
    loading.value = true
    const questionId = route.params.id as string
    
    const updateData = {
      type: questionForm.value.type,
      content: questionForm.value.content,
      options: questionForm.value.options.filter(opt => opt.trim() !== ''),
      answer: questionForm.value.answer,
      explanation: questionForm.value.explanation,
      difficulty: questionForm.value.difficulty
    }
    
    await questionStore.updateQuestion(questionId, updateData)
    ElMessage.success('题目保存成功')
    router.push('/questions')
    
  } catch (error) {
    console.error('保存题目失败:', error)
    ElMessage.error('保存题目失败')
  } finally {
    loading.value = false
  }
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
.question-edit {
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

  .header-actions {
    display: flex;
    gap: 12px;
  }
}

.edit-content {
  .el-card {
    border-radius: var(--brand-radius-lg);
    margin-bottom: 24px;
  }
}

.option-item {
  margin-bottom: 12px;
}

.question-preview {
  .preview-header {
    display: flex;
    gap: 8px;
    margin-bottom: 20px;
  }

  .preview-content {
    h4 {
      font-size: 16px;
      font-weight: 600;
      color: var(--brand-text-primary);
      margin: 16px 0 8px 0;
    }

    p {
      color: var(--brand-text-primary);
      margin: 0 0 16px 0;
      line-height: 1.5;
    }

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
      }
    }

    .answer-section {
      background: var(--brand-success-bg);
      padding: 12px;
      border-radius: var(--brand-radius-base);
      margin: 16px 0;

      .answer-text {
        color: var(--brand-success);
        font-weight: 500;
        margin: 0;
      }
    }

    .explanation-section {
      background: var(--brand-bg-secondary);
      padding: 12px;
      border-radius: var(--brand-radius-base);
      margin: 16px 0;

      .explanation-text {
        color: var(--brand-text-primary);
        margin: 0;
        line-height: 1.5;
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .question-edit {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
}
</style>
