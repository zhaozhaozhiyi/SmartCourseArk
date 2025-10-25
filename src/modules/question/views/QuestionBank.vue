<template>
  <div class="question-bank-layout">
    <!-- 顶部统计卡片 -->
    <QuestionStatsCards />

    <div class="main-content">
      <!-- 左侧导航 -->
      <div class="left-nav">
        <!-- 题型导航 -->
        <QuestionTypeNav 
          :selected-type="selectedType"
          @type-select="handleTypeSelect"
          @create-group="handleCreateGroup"
        />
        
        <!-- 分组管理 -->
        <div class="group-section">
          <QuestionGroupManager
            :selected-group-id="selectedGroupId"
            @group-select="handleGroupSelect"
            @group-created="handleGroupCreated"
            @group-updated="handleGroupUpdated"
            @group-deleted="handleGroupDeleted"
          />
        </div>
      </div>
      
      <!-- 中间题目列表区域 -->
      <div class="question-list-area">
        <!-- 页面头部 -->
        <div class="page-header">
          <div class="header-content">
            <h1 class="page-title">题库管理</h1>
            <p class="page-description">管理您的所有题目，生成和编辑练习题目</p>
          </div>
          <div class="header-actions">
            <el-button type="primary" @click="goToGenerate">
              <FontAwesomeIcon :icon="['fas', 'plus']" class="mr-2" />
              生成题目
            </el-button>
          </div>
        </div>

        <!-- 高级搜索筛选 -->
        <QuestionAdvancedFilter 
          v-model="searchParams"
          @search="handleSearch"
        />

        <!-- 批量操作工具栏 -->
        <QuestionBatchToolbar
          v-if="selectedQuestions.length > 0"
          :selected-questions="selectedQuestions"
          :total-questions="total"
          @select-all="handleSelectAll"
          @batch-delete="handleBatchDelete"
          @batch-modify="handleBatchModify"
          @batch-move="handleBatchMove"
          @batch-export="handleBatchExport"
          @clear-selection="handleClearSelection"
        />

        <!-- 题目列表 -->
        <div class="questions-grid" v-loading="loading">
          <div v-if="questions.length === 0 && !loading" class="empty-state">
            <div class="empty-icon">
              <FontAwesomeIcon :icon="['fas', 'question-circle']" />
            </div>
            <h3>暂无题目</h3>
            <p>开始生成您的第一道题目吧！</p>
            <el-button type="primary" @click="goToGenerate">
              <FontAwesomeIcon :icon="['fas', 'plus']" class="mr-2" />
              生成题目
            </el-button>
          </div>
          
          <div v-for="question in questions" :key="question.id" class="question-card">
            <div class="question-header">
              <div class="question-checkbox">
                <el-checkbox 
                  :model-value="selectedQuestions.includes(question.id)"
                  @change="handleSelectQuestion(question.id)"
                />
              </div>
              <div class="question-meta">
            <el-tag :type="getTypeColor(question.type) as any">
              {{ getTypeText(question.type) }}
            </el-tag>
            <el-tag :type="getDifficultyColor(question.difficulty) as any" size="small">
              {{ getDifficultyText(question.difficulty) }}
            </el-tag>
            <el-tag v-if="question.tags && question.tags.length > 0" size="small" type="info">
              {{ question.tags[0] }}
            </el-tag>
              </div>
              <div class="question-actions">
                <el-dropdown trigger="click" @click.stop>
                  <el-button type="text" size="small">
                    <FontAwesomeIcon :icon="['fas', 'ellipsis-v']" />
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item @click="editQuestion(question.id)">
                        <FontAwesomeIcon :icon="['fas', 'edit']" class="mr-2" />
                        编辑题目
                      </el-dropdown-item>
                      <el-dropdown-item @click="handlePreviewQuestion(question)">
                        <FontAwesomeIcon :icon="['fas', 'eye']" class="mr-2" />
                        预览题目
                      </el-dropdown-item>
                      <el-dropdown-item @click="deleteQuestion(question)" divided>
                        <FontAwesomeIcon :icon="['fas', 'trash']" class="mr-2" />
                        删除题目
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </div>
          
            <div class="question-content">
              <div class="question-text">
                {{ question.content }}
              </div>
              
              <div v-if="question.options && question.options.length > 0" class="question-options">
                <div v-for="(option, index) in question.options" :key="index" class="option-item">
                  <span class="option-label">{{ String.fromCharCode(65 + index) }}.</span>
                  <span class="option-text">{{ option }}</span>
                </div>
              </div>
            </div>
            
            <div class="question-footer">
              <div class="question-stats">
                <span class="stat-item">
                  <FontAwesomeIcon :icon="['fas', 'chart-line']" />
                  {{ question.correctCount || 0 }}/{{ question.totalCount || 0 }}
                </span>
                <span class="stat-item">
                  <FontAwesomeIcon :icon="['fas', 'clock']" />
                  {{ formatDate(question.createdAt) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- 分页 -->
        <div class="pagination" v-if="total > 0">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :total="total"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </div>

    <!-- 题目预览对话框 -->
    <el-dialog
      v-model="previewVisible"
      title="题目预览"
      width="600px"
      :close-on-click-modal="false"
    >
      <div v-if="previewQuestion" class="question-preview">
        <div class="preview-header">
          <el-tag :type="getTypeColor(previewQuestion.type)">
            {{ getTypeText(previewQuestion.type) }}
          </el-tag>
          <el-tag :type="getDifficultyColor(previewQuestion.difficulty)" size="small">
            {{ getDifficultyText(previewQuestion.difficulty) }}
          </el-tag>
        </div>
        
        <div class="preview-content">
          <h4>题目内容</h4>
          <p>{{ previewQuestion.content }}</p>
          
          <div v-if="previewQuestion.options && previewQuestion.options.length > 0">
            <h4>选项</h4>
            <div v-for="(option, index) in previewQuestion.options" :key="index" class="option-item">
              <span class="option-label">{{ String.fromCharCode(65 + index) }}.</span>
              <span class="option-text">{{ option }}</span>
            </div>
          </div>
          
          <div class="answer-section">
            <h4>正确答案</h4>
            <p class="answer-text">{{ previewQuestion.answer }}</p>
          </div>
          
          <div class="explanation-section">
            <h4>详细解析</h4>
            <p class="explanation-text">{{ previewQuestion.explanation }}</p>
          </div>
        </div>
      </div>
      
      <template #footer>
        <el-button @click="previewVisible = false">关闭</el-button>
        <el-button type="primary" @click="previewQuestion && editQuestion(previewQuestion.id)">
          编辑题目
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { 
  faPlus, faSearch, faQuestionCircle, faEllipsisV, faEdit, 
  faEye, faTrash, faChartLine, faClock
} from '@fortawesome/free-solid-svg-icons'
import { useQuestionStore } from '@/store/modules/question'
import { useCourseStore } from '@/store/modules/course'
import QuestionStatsCards from '../components/QuestionStatsCards.vue'
import QuestionTypeNav from '../components/QuestionTypeNav.vue'
import QuestionBatchToolbar from '../components/QuestionBatchToolbar.vue'
import QuestionGroupManager from '../components/QuestionGroupManager.vue'
import QuestionAdvancedFilter from '../components/QuestionAdvancedFilter.vue'
import type { Question, QuestionType, QuestionDifficulty, QuestionSearchParams } from '@/types/course'

// 添加图标到库
library.add(
  faPlus, faSearch, faQuestionCircle, faEllipsisV, faEdit, 
  faEye, faTrash, faChartLine, faClock
)

const router = useRouter()
const questionStore = useQuestionStore()
const courseStore = useCourseStore()

// 响应式数据
const loading = ref(false)
const questions = ref<Question[]>([])
const courses = ref<any[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const previewVisible = ref(false)
const previewQuestion = ref<Question | null>(null)
const selectedQuestions = ref<string[]>([])
const selectedType = ref<string>('all')
const selectedGroupId = ref<string>('')

const searchParams = ref<QuestionSearchParams>({
  keyword: '',
  type: undefined,
  difficulty: undefined,
  courseId: undefined,
  page: 1,
  pageSize: 10
})

// 生命周期
onMounted(() => {
  fetchQuestions()
  fetchCourses()
})

// 方法
const fetchQuestions = async () => {
  try {
    loading.value = true
    searchParams.value.page = currentPage.value
    searchParams.value.pageSize = pageSize.value
    
    const response = await questionStore.fetchQuestions(searchParams.value)
    questions.value = response.questions
    total.value = response.total
  } catch (error) {
    console.error('获取题目列表失败:', error)
    ElMessage.error('获取题目列表失败')
  } finally {
    loading.value = false
  }
}

const fetchCourses = async () => {
  try {
    const courseList = await courseStore.fetchCourses()
    courses.value = courseList.courses
  } catch (error) {
    console.error('获取课程列表失败:', error)
  }
}

const handleSearch = () => {
  currentPage.value = 1
  fetchQuestions()
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  fetchQuestions()
}

const handleCurrentChange = (page: number) => {
  currentPage.value = page
  fetchQuestions()
}

const goToGenerate = () => {
  router.push('/questions/generate')
}

const editQuestion = (questionId: string) => {
  router.push(`/questions/edit/${questionId}`)
}

// 新增方法
const handleTypeSelect = (type: string) => {
  selectedType.value = type
  if (type === 'all') {
    searchParams.value.type = undefined
  } else if (type.startsWith('group_')) {
    // 处理分组筛选
    // 这里需要实现按分组筛选的逻辑
  } else {
    searchParams.value.type = type as QuestionType
  }
  handleSearch()
}


const handleCreateGroup = () => {
  // 创建分组逻辑
  ElMessage.info('创建分组功能待实现')
}

const handleGroupSelect = (groupId: string) => {
  selectedGroupId.value = groupId
  // 根据分组筛选题目
  if (groupId) {
    // 这里需要实现根据分组筛选题目的逻辑
    console.log('选择分组:', groupId)
  } else {
    // 显示所有题目
    fetchQuestions()
  }
}

const handleGroupCreated = (_group: any) => {
  ElMessage.success('分组创建成功')
  // 刷新分组列表
  questionStore.fetchQuestionGroups()
}

const handleGroupUpdated = (_group: any) => {
  ElMessage.success('分组更新成功')
  // 刷新分组列表
  questionStore.fetchQuestionGroups()
}

const handleGroupDeleted = (groupId: string) => {
  ElMessage.success('分组删除成功')
  // 如果删除的是当前选中的分组，清空选择
  if (selectedGroupId.value === groupId) {
    selectedGroupId.value = ''
    fetchQuestions()
  }
}

const handleSelectQuestion = (questionId: string) => {
  const index = selectedQuestions.value.indexOf(questionId)
  if (index > -1) {
    selectedQuestions.value.splice(index, 1)
  } else {
    selectedQuestions.value.push(questionId)
  }
}

const handleSelectAll = (checked: boolean) => {
  if (checked) {
    selectedQuestions.value = questions.value.map(q => q.id)
  } else {
    selectedQuestions.value = []
  }
}

const handleClearSelection = () => {
  selectedQuestions.value = []
}

const handleBatchDelete = async (questionIds: string[]) => {
  try {
    // 逐个删除题目
    for (const id of questionIds) {
      await questionStore.deleteQuestion(id)
    }
    ElMessage.success('批量删除成功')
    selectedQuestions.value = []
    fetchQuestions()
  } catch (error) {
    ElMessage.error('批量删除失败')
  }
}

const handleBatchModify = () => {
  // 批量修改逻辑
  ElMessage.success('批量修改成功')
  selectedQuestions.value = []
  fetchQuestions()
}

const handleBatchMove = () => {
  // 批量移动逻辑
  ElMessage.success('移动成功')
  selectedQuestions.value = []
  fetchQuestions()
}

const handleBatchExport = () => {
  // 批量导出逻辑
  ElMessage.success('导出任务已开始')
  selectedQuestions.value = []
}

const handlePreviewQuestion = (question: Question) => {
  previewQuestion.value = question
  previewVisible.value = true
}

const deleteQuestion = async (question: Question) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除这道题目吗？此操作不可撤销。',
      '删除确认',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await questionStore.deleteQuestion(question.id)
    ElMessage.success('题目删除成功')
    fetchQuestions()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除题目失败:', error)
      ElMessage.error('删除题目失败')
    }
  }
}

// 工具函数
const getTypeColor = (type: QuestionType): 'primary' | 'success' | 'warning' | 'info' | 'danger' => {
  switch (type) {
    case 'single':
      return 'primary'
    case 'multiple':
      return 'success'
    case 'judge':
      return 'warning'
    case 'fill':
      return 'info'
    case 'essay':
      return 'danger'
    default:
      return 'info'
  }
}

const getTypeText = (type: QuestionType): string => {
  switch (type) {
    case 'single':
      return '单选题'
    case 'multiple':
      return '多选题'
    case 'judge':
      return '判断题'
    case 'fill':
      return '填空题'
    case 'essay':
      return '简答题'
    default:
      return '未知'
  }
}

const getDifficultyColor = (difficulty: QuestionDifficulty): 'primary' | 'success' | 'warning' | 'info' | 'danger' => {
  switch (difficulty) {
    case 'easy':
      return 'success'
    case 'medium':
      return 'warning'
    case 'hard':
      return 'danger'
    default:
      return 'info'
  }
}

const getDifficultyText = (difficulty: QuestionDifficulty): string => {
  switch (difficulty) {
    case 'easy':
      return '简单'
    case 'medium':
      return '中等'
    case 'hard':
      return '困难'
    default:
      return '未知'
  }
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
</script>

<style lang="scss" scoped>
.question-bank-layout {
  padding: var(--brand-spacing-lg);
  max-width: 1400px;
  margin: 0 auto;

  .main-content {
    display: flex;
    gap: var(--brand-spacing-lg);
    margin-top: var(--brand-spacing-lg);

    .left-nav {
      width: 280px;
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      gap: var(--brand-spacing-lg);
    }

    .group-section {
      background: var(--brand-bg-white);
      border: 1px solid var(--brand-border-light);
      border-radius: var(--brand-radius-lg);
      padding: 16px;
    }

    .question-list-area {
      flex: 1;
      min-width: 0;
    }
  }
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
    .el-button {
      height: 40px;
      padding: 0 20px;
    }
  }
}

.search-section {
  margin-bottom: 32px;

  .search-bar {
    margin-bottom: 16px;
    
    .el-input {
      max-width: 400px;
    }
  }

  .filter-bar {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
    
    .el-select {
      width: 150px;
    }
  }
}

.questions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.question-card {
  background: var(--brand-bg-primary);
  border: 1px solid var(--brand-border);
  border-radius: var(--brand-radius-lg);
  padding: 20px;
  transition: all 0.2s ease;
  box-shadow: var(--brand-shadow-sm);

  &:hover {
    box-shadow: var(--brand-shadow-lg);
    transform: translateY(-2px);
    border-color: var(--brand-primary);
  }

  .question-header {
    display: flex;
    align-items: flex-start;
    gap: var(--brand-spacing-sm);
    margin-bottom: var(--brand-spacing-base);

    .question-checkbox {
      margin-top: 2px;
    }

    .question-meta {
      display: flex;
      gap: var(--brand-spacing-sm);
      flex: 1;
      flex-wrap: wrap;
    }

    .question-actions {
      .el-button {
        padding: 4px;
        color: var(--brand-text-tertiary);
        
        &:hover {
          color: var(--brand-text-primary);
          background: var(--brand-bg-secondary);
        }
      }
    }
  }

  .question-content {
    margin-bottom: 16px;

    .question-text {
      font-size: 16px;
      font-weight: 500;
      color: var(--brand-text-primary);
      margin-bottom: 12px;
      line-height: 1.5;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .question-options {
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
  }

  .question-footer {
    .question-stats {
      display: flex;
      gap: 16px;
      font-size: 14px;
      color: var(--brand-text-secondary);

      .stat-item {
        display: flex;
        align-items: center;
        gap: 4px;

        svg {
          color: var(--brand-text-tertiary);
        }
      }
    }
  }
}

.empty-state {
  grid-column: 1 / -1;
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

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 32px;
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
  .question-bank {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .search-section {
    .filter-bar {
      flex-direction: column;
      gap: 12px;
      
      .el-select {
        width: 100%;
      }
    }
  }

  .questions-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .question-card {
    padding: 16px;
  }
}
</style>
