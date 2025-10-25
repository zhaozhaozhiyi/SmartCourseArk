<template>
  <div class="question-advanced-filter">
    <!-- 基础搜索 -->
    <div class="basic-search">
      <el-input
        v-model="searchParams.keyword"
        placeholder="搜索题目内容..."
        clearable
        @input="handleSearch"
        class="search-input"
      >
        <template #prefix>
          <FontAwesomeIcon :icon="['fas', 'search']" />
        </template>
      </el-input>
      
      <el-button 
        type="primary" 
        @click="handleSearch"
        class="search-btn"
      >
        搜索
      </el-button>
      
      <el-button 
        @click="toggleAdvanced"
        class="advanced-toggle"
      >
        <FontAwesomeIcon :icon="['fas', isAdvancedOpen ? 'chevron-up' : 'chevron-down']" />
        {{ isAdvancedOpen ? '收起' : '高级筛选' }}
      </el-button>
    </div>

    <!-- 高级筛选面板 -->
    <el-collapse-transition>
      <div v-show="isAdvancedOpen" class="advanced-panel">
        <div class="filter-row">
          <!-- 题型筛选 -->
          <div class="filter-group">
            <label class="filter-label">题型</label>
            <el-checkbox-group v-model="searchParams.types" @change="handleSearch">
              <el-checkbox label="single">单选题</el-checkbox>
              <el-checkbox label="multiple">多选题</el-checkbox>
              <el-checkbox label="judge">判断题</el-checkbox>
              <el-checkbox label="fill">填空题</el-checkbox>
              <el-checkbox label="essay">简答题</el-checkbox>
            </el-checkbox-group>
          </div>

          <!-- 难度筛选 -->
          <div class="filter-group">
            <label class="filter-label">难度</label>
            <el-checkbox-group v-model="searchParams.difficulties" @change="handleSearch">
              <el-checkbox label="easy">简单</el-checkbox>
              <el-checkbox label="medium">中等</el-checkbox>
              <el-checkbox label="hard">困难</el-checkbox>
            </el-checkbox-group>
          </div>
        </div>

        <div class="filter-row">
          <!-- 课程筛选 -->
          <div class="filter-group">
            <label class="filter-label">课程</label>
            <el-select 
              v-model="searchParams.courseId" 
              placeholder="选择课程" 
              clearable 
              @change="handleSearch"
              class="filter-select"
            >
              <el-option 
                v-for="course in courses" 
                :key="course.id" 
                :label="course.title" 
                :value="course.id" 
              />
            </el-select>
          </div>

          <!-- 标签筛选 -->
          <div class="filter-group">
            <label class="filter-label">标签</label>
            <el-select 
              v-model="searchParams.tags" 
              placeholder="选择标签" 
              multiple 
              clearable 
              @change="handleSearch"
              class="filter-select"
            >
              <el-option 
                v-for="tag in availableTags" 
                :key="tag" 
                :label="tag" 
                :value="tag" 
              />
            </el-select>
          </div>
        </div>

        <div class="filter-row">
          <!-- 日期范围 -->
          <div class="filter-group">
            <label class="filter-label">创建时间</label>
            <el-date-picker
              v-model="searchParams.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              @change="handleSearch"
              class="filter-date"
            />
          </div>

          <!-- 排序方式 -->
          <div class="filter-group">
            <label class="filter-label">排序</label>
            <div class="sort-controls">
              <el-select v-model="searchParams.sortBy" @change="handleSearch" class="sort-select">
                <el-option label="创建时间" value="createdAt" />
                <el-option label="更新时间" value="updatedAt" />
                <el-option label="使用次数" value="usageCount" />
                <el-option label="正确率" value="correctRate" />
                <el-option label="质量评分" value="qualityScore" />
              </el-select>
              <el-select v-model="searchParams.sortOrder" @change="handleSearch" class="sort-order">
                <el-option label="升序" value="asc" />
                <el-option label="降序" value="desc" />
              </el-select>
            </div>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="filter-actions">
          <el-button @click="resetFilters">重置筛选</el-button>
          <el-button type="primary" @click="applyFilters">应用筛选</el-button>
        </div>
      </div>
    </el-collapse-transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { 
  faSearch, faChevronDown, faChevronUp
} from '@fortawesome/free-solid-svg-icons'
import { useCourseStore } from '@/store/modules/course'
import { useQuestionStore } from '@/store/modules/question'
import type { QuestionSearchParams } from '@/types/course'

// 添加图标到库
library.add(faSearch, faChevronDown, faChevronUp)

const courseStore = useCourseStore()
const questionStore = useQuestionStore()

// Props
const props = defineProps<{
  modelValue: QuestionSearchParams
}>()

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: QuestionSearchParams]
  'search': [params: QuestionSearchParams]
}>()

// 响应式数据
const isAdvancedOpen = ref(false)
const searchParams = ref<QuestionSearchParams>({
  keyword: '',
  type: undefined,
  difficulty: undefined,
  courseId: undefined,
  page: 1,
  pageSize: 10,
  types: [],
  difficulties: [],
  tags: [],
  dateRange: [],
  sortBy: 'createdAt',
  sortOrder: 'desc'
})

// 计算属性
const courses = computed(() => courseStore.courses)
const availableTags = computed(() => {
  // 从所有题目中提取唯一标签
  const allTags = new Set<string>()
  questionStore.questions.forEach(question => {
    if (question.tags) {
      question.tags.forEach(tag => allTags.add(tag))
    }
  })
  return Array.from(allTags)
})

// 监听props变化
watch(() => props.modelValue, (newValue) => {
  searchParams.value = { ...newValue }
}, { immediate: true, deep: true })

// 监听搜索参数变化
watch(searchParams, (newValue) => {
  emit('update:modelValue', newValue)
}, { deep: true })

// 方法
const toggleAdvanced = () => {
  isAdvancedOpen.value = !isAdvancedOpen.value
}

const handleSearch = () => {
  emit('search', searchParams.value)
}

const applyFilters = () => {
  emit('search', searchParams.value)
}

const resetFilters = () => {
  searchParams.value = {
    keyword: '',
    type: undefined,
    difficulty: undefined,
    courseId: undefined,
    page: 1,
    pageSize: 10,
    types: [],
    difficulties: [],
    tags: [],
    dateRange: [],
    sortBy: 'createdAt',
    sortOrder: 'desc'
  }
  emit('search', searchParams.value)
}
</script>

<style lang="scss" scoped>
.question-advanced-filter {
  .basic-search {
    display: flex;
    gap: 12px;
    align-items: center;
    margin-bottom: 16px;
    
    .search-input {
      flex: 1;
      max-width: 400px;
    }
    
    .search-btn {
      flex-shrink: 0;
    }
    
    .advanced-toggle {
      flex-shrink: 0;
      color: var(--brand-text-secondary);
      
      &:hover {
        color: var(--brand-primary);
      }
    }
  }
  
  .advanced-panel {
    background: var(--brand-bg-light);
    border: 1px solid var(--brand-border-light);
    border-radius: var(--brand-radius-md);
    padding: 20px;
    margin-bottom: 16px;
    
    .filter-row {
      display: flex;
      gap: 24px;
      margin-bottom: 16px;
      
      &:last-child {
        margin-bottom: 0;
      }
    }
    
    .filter-group {
      flex: 1;
      min-width: 200px;
      
      .filter-label {
        display: block;
        font-size: 14px;
        font-weight: 500;
        color: var(--brand-text-primary);
        margin-bottom: 8px;
      }
      
      .filter-select {
        width: 100%;
      }
      
      .filter-date {
        width: 100%;
      }
      
      .sort-controls {
        display: flex;
        gap: 8px;
        
        .sort-select {
          flex: 2;
        }
        
        .sort-order {
          flex: 1;
        }
      }
    }
    
    .filter-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid var(--brand-border-light);
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .question-advanced-filter {
    .basic-search {
      flex-direction: column;
      align-items: stretch;
      
      .search-input {
        max-width: none;
      }
    }
    
    .advanced-panel {
      .filter-row {
        flex-direction: column;
        gap: 16px;
      }
      
      .filter-group {
        min-width: auto;
      }
      
      .filter-actions {
        flex-direction: column;
      }
    }
  }
}
</style>
