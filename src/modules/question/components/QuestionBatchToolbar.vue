<template>
  <div class="question-batch-toolbar">
    <div class="toolbar-content">
      <!-- 选中信息 -->
      <div class="selection-info">
        <el-checkbox 
          v-model="selectAll" 
          :indeterminate="isIndeterminate"
          @change="(val: any) => handleSelectAll(val as boolean)"
        >
          已选择 {{ selectedCount }} 道题目
        </el-checkbox>
      </div>

      <!-- 批量操作按钮 -->
      <div class="batch-actions">
        <el-button 
          type="primary" 
          size="small"
          @click="handleBatchExport"
        >
          <FontAwesomeIcon :icon="['fas', 'download']" class="mr-2" />
          批量导出
        </el-button>

        <el-button 
          type="success" 
          size="small"
          @click="handleBatchModify"
        >
          <FontAwesomeIcon :icon="['fas', 'edit']" class="mr-2" />
          批量修改
        </el-button>

        <el-button 
          type="warning" 
          size="small"
          @click="handleBatchMove"
        >
          <FontAwesomeIcon :icon="['fas', 'folder']" class="mr-2" />
          移动到分组
        </el-button>

        <el-button 
          type="danger" 
          size="small"
          @click="handleBatchDelete"
        >
          <FontAwesomeIcon :icon="['fas', 'trash']" class="mr-2" />
          批量删除
        </el-button>

        <el-button 
          type="info" 
          size="small"
          @click="handleClearSelection"
        >
          <FontAwesomeIcon :icon="['fas', 'times']" class="mr-2" />
          取消选择
        </el-button>
      </div>
    </div>

    <!-- 批量修改对话框 -->
    <el-dialog
      v-model="modifyDialogVisible"
      title="批量修改题目"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="modifyForm" label-width="80px">
        <el-form-item label="修改难度">
          <el-select v-model="modifyForm.difficulty" placeholder="选择难度" clearable>
            <el-option label="简单" value="easy" />
            <el-option label="中等" value="medium" />
            <el-option label="困难" value="hard" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="添加标签">
          <el-input 
            v-model="modifyForm.tags" 
            placeholder="输入标签，多个标签用逗号分隔"
          />
        </el-form-item>
        
        <el-form-item label="修改状态">
          <el-select v-model="modifyForm.status" placeholder="选择状态" clearable>
            <el-option label="激活" value="active" />
            <el-option label="归档" value="archived" />
          </el-select>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="modifyDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmBatchModify">确认修改</el-button>
      </template>
    </el-dialog>

    <!-- 移动到分组对话框 -->
    <el-dialog
      v-model="moveDialogVisible"
      title="移动到分组"
      width="400px"
      :close-on-click-modal="false"
    >
      <el-form :model="moveForm" label-width="80px">
        <el-form-item label="选择分组">
          <el-select v-model="moveForm.groupId" placeholder="选择目标分组">
            <el-option 
              v-for="group in questionGroups" 
              :key="group.id" 
              :label="group.name" 
              :value="group.id" 
            />
          </el-select>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="moveDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmBatchMove">确认移动</el-button>
      </template>
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
            <el-radio label="word">Word</el-radio>
            <el-radio label="pdf">PDF</el-radio>
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
        <el-button type="primary" @click="confirmBatchExport">开始导出</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { 
  faDownload, faEdit, faFolder, faTrash, faTimes
} from '@fortawesome/free-solid-svg-icons'
import { useQuestionStore } from '@/store/modules/question'
import { QuestionExporter } from '@/shared/services/questionExporter'

// 添加图标到库
library.add(faDownload, faEdit, faFolder, faTrash, faTimes)

const questionStore = useQuestionStore()

// Props
const props = defineProps<{
  selectedQuestions: string[]
  totalQuestions: number
}>()

// 响应式数据
const selectAll = ref(false)
const modifyDialogVisible = ref(false)
const moveDialogVisible = ref(false)
const exportDialogVisible = ref(false)

const modifyForm = ref({
  difficulty: '',
  tags: '',
  status: ''
})

const moveForm = ref({
  groupId: ''
})

const exportForm = ref({
  format: 'excel',
  include: ['options', 'answer', 'explanation']
})

// 计算属性
const selectedCount = computed(() => props.selectedQuestions.length)
const isIndeterminate = computed(() => 
  selectedCount.value > 0 && selectedCount.value < props.totalQuestions
)

const questionGroups = computed(() => questionStore.questionGroups || [])

// 方法
const handleSelectAll = (checked: boolean) => {
  emit('select-all', checked)
}

const handleBatchExport = () => {
  exportDialogVisible.value = true
}

const handleBatchModify = () => {
  modifyDialogVisible.value = true
}

const handleBatchMove = () => {
  moveDialogVisible.value = true
}

const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      `确认删除选中的 ${selectedCount.value} 道题目吗？此操作不可撤销。`,
      '批量删除',
      {
        confirmButtonText: '确认删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await questionStore.batchDeleteQuestions(props.selectedQuestions)
    ElMessage.success('批量删除成功')
    emit('batch-delete', props.selectedQuestions)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    // 用户取消删除
  }
}

const handleClearSelection = () => {
  emit('clear-selection')
}

const confirmBatchModify = async () => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {}
    
    if (modifyForm.value.difficulty) {
      updateData.difficulty = modifyForm.value.difficulty
    }
    
    if (modifyForm.value.tags) {
      updateData.tags = modifyForm.value.tags.split(',').map(tag => tag.trim())
    }
    
    if (modifyForm.value.status) {
      updateData.status = modifyForm.value.status
    }
    
    await questionStore.batchUpdateQuestions(props.selectedQuestions, updateData)
    ElMessage.success('批量修改成功')
    modifyDialogVisible.value = false
    emit('batch-modify', { questionIds: props.selectedQuestions, updateData })
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    ElMessage.error('批量修改失败')
  }
}

const confirmBatchMove = async () => {
  try {
    await questionStore.addQuestionsToGroup(moveForm.value.groupId, props.selectedQuestions)
    ElMessage.success('移动成功')
    moveDialogVisible.value = false
    emit('batch-move', { questionIds: props.selectedQuestions, groupId: moveForm.value.groupId })
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    ElMessage.error('移动失败')
  }
}

const confirmBatchExport = async () => {
  try {
    const questions = questionStore.questions.filter(q => 
      props.selectedQuestions.includes(q.id)
    )
    
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
    emit('batch-export', { 
      questionIds: props.selectedQuestions, 
      format: exportForm.value.format,
      include: exportForm.value.include
    })
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error(error instanceof Error ? error.message : '导出失败')
  }
}

// 事件
const emit = defineEmits<{
  'select-all': [checked: boolean]
  'batch-delete': [questionIds: string[]]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  'batch-modify': [data: { questionIds: string[], updateData: any }]
  'batch-move': [data: { questionIds: string[], groupId: string }]
  'batch-export': [data: { questionIds: string[], format: string, include: string[] }]
  'clear-selection': []
}>()
</script>

<style lang="scss" scoped>
.question-batch-toolbar {
  background: var(--brand-bg-primary);
  border: 1px solid var(--brand-border);
  border-radius: var(--brand-radius-base);
  padding: var(--brand-spacing-base);
  margin-bottom: var(--brand-spacing-lg);
  box-shadow: var(--brand-shadow-sm);

  .toolbar-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--brand-spacing-lg);

    .selection-info {
      display: flex;
      align-items: center;
      gap: var(--brand-spacing-sm);
      color: var(--brand-text-primary);
      font-size: var(--brand-font-size-sm);
    }

    .batch-actions {
      display: flex;
      gap: var(--brand-spacing-sm);
      flex-wrap: wrap;
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .question-batch-toolbar {
    .toolbar-content {
      flex-direction: column;
      align-items: stretch;
      gap: var(--brand-spacing-base);

      .batch-actions {
        justify-content: center;
        flex-wrap: wrap;
      }
    }
  }
}
</style>
