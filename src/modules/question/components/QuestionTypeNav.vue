<template>
  <div class="question-type-nav">
    <div class="nav-header">
      <h3>题目分类</h3>
      <el-button 
        type="text" 
        size="small" 
        @click="toggleCollapse"
        v-if="isMobile"
      >
        <FontAwesomeIcon :icon="['fas', isCollapsed ? 'chevron-down' : 'chevron-up']" />
      </el-button>
    </div>

    <div class="nav-content" :class="{ collapsed: isCollapsed }">
      <div class="nav-list">
        <!-- 全部题目 -->
        <div 
          class="nav-item"
          :class="{ active: selectedType === 'all' }"
          @click="handleTypeSelect('all')"
        >
          <div class="nav-item-content">
            <div class="nav-icon all">
              <FontAwesomeIcon :icon="['fas', 'list']" />
            </div>
            <span class="nav-label">全部题目</span>
            <el-badge :value="totalCount" :max="999" class="nav-badge" />
          </div>
        </div>

        <!-- 各题型 -->
        <div 
          v-for="(count, type) in typeStats" 
          :key="type"
          class="nav-item"
          :class="{ active: selectedType === type }"
          @click="handleTypeSelect(type)"
        >
          <div class="nav-item-content">
            <div class="nav-icon" :class="type">
              <FontAwesomeIcon :icon="getTypeIcon(type)" />
            </div>
            <span class="nav-label">{{ getTypeText(type) }}</span>
            <el-badge :value="count" :max="999" class="nav-badge" />
          </div>
        </div>
      </div>

      <!-- 分组管理 -->
      <div class="nav-groups" v-if="questionGroups.length > 0">
        <div class="groups-header">
          <h4>题库分组</h4>
          <el-button 
            type="text" 
            size="small" 
            @click="handleCreateGroup"
          >
            <FontAwesomeIcon :icon="['fas', 'plus']" />
          </el-button>
        </div>
        
        <div class="groups-list">
          <div 
            v-for="group in questionGroups" 
            :key="group.id"
            class="nav-item group-item"
            :class="{ active: selectedType === `group_${group.id}` }"
            @click="handleGroupSelect(group.id)"
          >
            <div class="nav-item-content">
              <div class="nav-icon group">
                <FontAwesomeIcon :icon="['fas', 'folder']" />
              </div>
              <span class="nav-label">{{ group.name }}</span>
              <el-badge :value="group.questionCount" :max="999" class="nav-badge" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { 
  faList, faChevronDown, faChevronUp, faPlus, faFolder,
  faCircleDot, faSquareCheck, faQuestion, faPen, faFileAlt
} from '@fortawesome/free-solid-svg-icons'
import { useQuestionStore } from '@/store/modules/question'
import type { QuestionType, QuestionGroup } from '@/types/course'

// 添加图标到库
library.add(
  faList, faChevronDown, faChevronUp, faPlus, faFolder,
  faCircleDot, faSquareCheck, faQuestion, faPen, faFileAlt
)

const questionStore = useQuestionStore()

// Props
const props = defineProps<{
  selectedType?: string
}>()

// 响应式数据
const isCollapsed = ref(false)
const isMobile = ref(false)

// 计算属性
const typeStats = computed(() => questionStore.questionsByType)
const totalCount = computed(() => questionStore.questionCount)
const questionGroups = computed(() => questionStore.questionGroups || [])

// 方法
const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}

const handleTypeSelect = (type: string) => {
  emit('type-select', type)
}

const handleGroupSelect = (groupId: string) => {
  emit('type-select', `group_${groupId}`)
}

const handleCreateGroup = () => {
  emit('create-group')
}

const getTypeIcon = (type: QuestionType) => {
  const icons = {
    single: 'circle-dot',
    multiple: 'square-check', 
    judge: 'question',
    fill: 'pen',
    essay: 'file-alt'
  }
  return icons[type] || 'question'
}

const getTypeText = (type: QuestionType): string => {
  const texts = {
    single: '单选题',
    multiple: '多选题',
    judge: '判断题',
    fill: '填空题', 
    essay: '简答题'
  }
  return texts[type] || '未知'
}

// 检测移动端
const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
  if (isMobile.value) {
    isCollapsed.value = true
  }
}

// 事件
const emit = defineEmits<{
  'type-select': [type: string]
  'create-group': []
}>()

// 生命周期
onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})
</script>

<style lang="scss" scoped>
.question-type-nav {
  width: 240px;
  background: var(--brand-bg-primary);
  border-radius: var(--brand-radius-lg);
  box-shadow: var(--brand-shadow-base);
  border: 1px solid var(--brand-border-light);
  overflow: hidden;

  .nav-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--brand-spacing-lg);
    border-bottom: 1px solid var(--brand-border);

    h3 {
      margin: 0;
      color: var(--brand-text-primary);
      font-size: var(--brand-font-size-lg);
      font-weight: 600;
    }
  }

  .nav-content {
    max-height: calc(100vh - 200px);
    overflow-y: auto;

    &.collapsed {
      max-height: 0;
      overflow: hidden;
    }
  }

  .nav-list {
    padding: var(--brand-spacing-sm) 0;
  }

  .nav-item {
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background: var(--brand-bg-secondary);
    }

    &.active {
      background: var(--brand-primary-bg);
      border-right: 3px solid var(--brand-primary);

      .nav-icon {
        color: var(--brand-primary);
      }

      .nav-label {
        color: var(--brand-primary);
        font-weight: 600;
      }
    }

    .nav-item-content {
      display: flex;
      align-items: center;
      padding: var(--brand-spacing-base) var(--brand-spacing-lg);
      gap: var(--brand-spacing-sm);

      .nav-icon {
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--brand-text-tertiary);
        transition: color 0.2s ease;

        &.all {
          color: var(--brand-text-secondary);
        }

        &.single {
          color: var(--brand-primary);
        }

        &.multiple {
          color: var(--brand-success);
        }

        &.judge {
          color: var(--brand-warning);
        }

        &.fill {
          color: var(--brand-info);
        }

        &.essay {
          color: var(--brand-error);
        }

        &.group {
          color: var(--brand-text-secondary);
        }
      }

      .nav-label {
        flex: 1;
        color: var(--brand-text-primary);
        font-size: var(--brand-font-size-sm);
        transition: all 0.2s ease;
      }

      .nav-badge {
        :deep(.el-badge__content) {
          background: var(--brand-primary);
          border: none;
          font-size: 10px;
          min-width: 16px;
          height: 16px;
          line-height: 16px;
        }
      }
    }
  }

  .nav-groups {
    border-top: 1px solid var(--brand-border);
    padding: var(--brand-spacing-base) 0;

    .groups-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 var(--brand-spacing-lg) var(--brand-spacing-sm);

      h4 {
        margin: 0;
        color: var(--brand-text-secondary);
        font-size: var(--brand-font-size-sm);
        font-weight: 500;
      }
    }

    .groups-list {
      .group-item {
        .nav-item-content {
          padding-left: calc(var(--brand-spacing-lg) + 16px);
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .question-type-nav {
    width: 100%;
    margin-bottom: var(--brand-spacing-lg);

    .nav-content {
      max-height: 200px;
    }
  }
}
</style>
