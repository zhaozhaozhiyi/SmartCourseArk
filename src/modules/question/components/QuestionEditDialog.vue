<template>
  <el-dialog
    :model-value="visible"
    :title="isEdit ? '编辑题目' : '添加题目'"
    width="800px"
    top="80px"
    :close-on-click-modal="false"
    :style="{ top: '80px !important' }"
    @update:model-value="$emit('update:visible', $event)"
    @close="handleClose"
  >
    <el-form 
      :model="formData" 
      :rules="rules" 
      ref="formRef" 
      label-width="100px"
      @submit.prevent
    >
      <el-form-item label="题目类型" prop="type">
        <el-select v-model="formData.type" placeholder="请选择题目类型" @change="onTypeChange">
          <el-option label="单选题" value="single" />
          <el-option label="多选题" value="multiple" />
          <el-option label="判断题" value="judge" />
          <el-option label="填空题" value="fill" />
          <el-option label="简答题" value="essay" />
        </el-select>
      </el-form-item>

      <el-form-item label="难度级别" prop="difficulty">
        <el-select v-model="formData.difficulty" placeholder="请选择难度级别">
          <el-option label="简单" value="easy" />
          <el-option label="中等" value="medium" />
          <el-option label="困难" value="hard" />
        </el-select>
      </el-form-item>

      <el-form-item label="题目内容" prop="content">
        <el-input
          v-model="formData.content"
          type="textarea"
          :rows="4"
          placeholder="请输入题目内容"
          maxlength="1000"
          show-word-limit
        />
      </el-form-item>

      <!-- 选择题选项 -->
      <el-form-item 
        v-if="showOptions" 
        label="选项设置" 
        prop="options"
      >
        <div class="options-container">
          <div 
            v-for="(option, index) in formData.options || []" 
            :key="index" 
            class="option-item"
          >
            <span class="option-label">{{ String.fromCharCode(65 + index) }}.</span>
            <el-input 
              v-model="formData.options![index]" 
              :placeholder="`选项 ${String.fromCharCode(65 + index)}`"
              class="option-input"
            />
            <el-button 
              v-if="(formData.options?.length || 0) > 2"
              type="text" 
              size="small" 
              @click="removeOption(index)"
              class="remove-option"
            >
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
          
          <el-button 
            v-if="(formData.options?.length || 0) < 6"
            type="dashed" 
            @click="addOption"
            class="add-option"
          >
            <el-icon><Plus /></el-icon>
            添加选项
          </el-button>
        </div>
      </el-form-item>

      <el-form-item label="正确答案" prop="answer">
        <el-input 
          v-model="formData.answer" 
          :placeholder="getAnswerPlaceholder()"
          maxlength="500"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="详细解析" prop="explanation">
        <el-input
          v-model="formData.explanation"
          type="textarea"
          :rows="3"
          placeholder="请输入详细解析"
          maxlength="1000"
          show-word-limit
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSave" :loading="saving">
          {{ isEdit ? '保存' : '添加' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { Delete, Plus } from '@element-plus/icons-vue'

interface Question {
  type: string
  content: string
  options?: string[]
  answer: string
  explanation: string
  difficulty: string
}

interface Props {
  visible: boolean
  question?: Question | null
  isEdit?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  question: null,
  isEdit: false
})

const emit = defineEmits<{
  'update:visible': [value: boolean]
  'save': [question: Question]
}>()

// 表单引用
const formRef = ref()
const saving = ref(false)

// 表单数据
const formData = ref<Question>({
  type: 'single',
  content: '',
  options: ['', '', '', ''],
  answer: '',
  explanation: '',
  difficulty: 'medium'
})

// 表单验证规则
const rules = {
  type: [
    { required: true, message: '请选择题目类型', trigger: 'change' }
  ],
  content: [
    { required: true, message: '请输入题目内容', trigger: 'blur' },
    { min: 5, message: '题目内容至少5个字符', trigger: 'blur' }
  ],
  answer: [
    { required: true, message: '请输入正确答案', trigger: 'blur' }
  ],
  explanation: [
    { required: true, message: '请输入详细解析', trigger: 'blur' }
  ],
  difficulty: [
    { required: true, message: '请选择难度级别', trigger: 'change' }
  ],
  options: [
    { 
      validator: (_rule: any, value: string[], callback: Function) => {
        if (showOptions.value) {
          const validOptions = value.filter(opt => opt.trim())
          if (validOptions.length < 2) {
            callback(new Error('至少需要2个选项'))
          } else if (validOptions.length !== [...new Set(validOptions)].length) {
            callback(new Error('选项不能重复'))
          } else {
            callback()
          }
        } else {
          callback()
        }
      }, 
      trigger: 'blur' 
    }
  ]
}

// 计算属性
const showOptions = computed(() => {
  return ['single', 'multiple'].includes(formData.value.type)
})

// 监听 visible 变化
watch(() => props.visible, (newVal) => {
  if (newVal) {
    initFormData()
  }
})

// 监听题目变化
watch(() => props.question, (newVal) => {
  if (newVal) {
    initFormData()
  }
})

// 初始化表单数据
const initFormData = () => {
  if (props.question) {
    formData.value = {
      type: props.question.type,
      content: props.question.content,
      options: props.question.options ? [...props.question.options] : ['', '', '', ''],
      answer: props.question.answer,
      explanation: props.question.explanation,
      difficulty: props.question.difficulty
    }
  } else {
    formData.value = {
      type: 'single',
      content: '',
      options: ['', '', '', ''],
      answer: '',
      explanation: '',
      difficulty: 'medium'
    }
  }
}

// 题目类型变化处理
const onTypeChange = (type: string) => {
  if (type === 'judge') {
    formData.value.options = []
    formData.value.answer = ''
  } else if (type === 'fill' || type === 'essay') {
    formData.value.options = []
  } else if (['single', 'multiple'].includes(type)) {
    if (formData.value.options.length === 0) {
      formData.value.options = ['', '', '', '']
    }
  }
}

// 添加选项
const addOption = () => {
  if ((formData.value.options?.length || 0) < 6) {
    if (!formData.value.options) {
      formData.value.options = []
    }
    formData.value.options.push('')
  }
}

// 删除选项
const removeOption = (index: number) => {
  if ((formData.value.options?.length || 0) > 2) {
    formData.value.options?.splice(index, 1)
  }
}

// 获取答案输入框占位符
const getAnswerPlaceholder = () => {
  switch (formData.value.type) {
    case 'single':
    case 'multiple':
      return '请输入选项字母，如：A 或 A,B'
    case 'judge':
      return '请输入"正确"或"错误"'
    case 'fill':
      return '请输入填空答案'
    case 'essay':
      return '请输入参考答案'
    default:
      return '请输入正确答案'
  }
}

// 保存处理
const handleSave = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    saving.value = true
    
    // 处理选项数据
    const questionData = { ...formData.value }
    if (!showOptions.value) {
      delete questionData.options
    } else {
      // 过滤空选项
      questionData.options = questionData.options?.filter(opt => opt.trim()) || []
    }
    
    emit('save', questionData)
    ElMessage.success(props.isEdit ? '题目更新成功' : '题目添加成功')
    handleClose()
  } catch (error) {
    console.error('表单验证失败:', error)
  } finally {
    saving.value = false
  }
}

// 关闭处理
const handleClose = () => {
  emit('update:visible', false)
  // 重置表单
  nextTick(() => {
    if (formRef.value) {
      formRef.value.resetFields()
    }
  })
}
</script>

<style scoped>
/* 强制设置弹窗位置 */
:deep(.el-dialog) {
  top: 80px !important;
  margin-top: 0 !important;
}

.options-container {
  width: 100%;
}

.option-item {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  gap: 8px;
}

.option-label {
  font-weight: bold;
  min-width: 20px;
  color: #409eff;
}

.option-input {
  flex: 1;
}

.remove-option {
  color: #f56c6c;
  padding: 4px;
}

.add-option {
  width: 100%;
  border-style: dashed;
  color: #409eff;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .option-item {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
  
  .option-label {
    text-align: left;
  }
}
</style>
