<template>
  <div class="question-stats-cards">
    <div class="stats-grid">
      <!-- 总题数卡片 -->
      <div class="stat-card brand-card">
        <div class="stat-icon total">
          <FontAwesomeIcon :icon="['fas', 'question-circle']" />
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ stats.totalQuestions }}</div>
          <div class="stat-label">总题数</div>
        </div>
        <div class="stat-trend" v-if="stats.todayAdded > 0">
          <FontAwesomeIcon :icon="['fas', 'arrow-up']" />
          <span>+{{ stats.todayAdded }}</span>
        </div>
      </div>

      <!-- 今日新增卡片 -->
      <div class="stat-card brand-card">
        <div class="stat-icon today">
          <FontAwesomeIcon :icon="['fas', 'plus-circle']" />
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ stats.todayAdded }}</div>
          <div class="stat-label">今日新增</div>
        </div>
      </div>

      <!-- 使用次数卡片 -->
      <div class="stat-card brand-card">
        <div class="stat-icon usage">
          <FontAwesomeIcon :icon="['fas', 'chart-line']" />
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ stats.totalUsage }}</div>
          <div class="stat-label">总使用次数</div>
        </div>
      </div>

      <!-- 平均质量卡片 -->
      <div class="stat-card brand-card">
        <div class="stat-icon quality">
          <FontAwesomeIcon :icon="['fas', 'star']" />
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ stats.averageQuality }}%</div>
          <div class="stat-label">平均质量</div>
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
  faQuestionCircle, faPlusCircle, faChartLine, faStar, 
  faArrowUp
} from '@fortawesome/free-solid-svg-icons'
import { useQuestionStore } from '@/store/modules/question'

// 添加图标到库
library.add(
  faQuestionCircle, faPlusCircle, faChartLine, faStar, 
  faArrowUp
)

const questionStore = useQuestionStore()

// 响应式数据

// 计算属性
const stats = computed(() => {
  const questions = questionStore.questions
  const totalQuestions = questions.length
  
  // 计算今日新增
  const today = new Date().toDateString()
  const todayAdded = questions.filter(q => 
    new Date(q.createdAt).toDateString() === today
  ).length
  
  // 计算总使用次数
  const totalUsage = questions.reduce((sum, q) => sum + (q.usageCount || 0), 0)
  
  // 计算平均质量
  const averageQuality = questions.length > 0 
    ? Math.round(questions.reduce((sum, q) => sum + (q.qualityScore || 0), 0) / questions.length)
    : 0
  
  return {
    totalQuestions,
    todayAdded,
    totalUsage,
    averageQuality
  }
})

// 方法

// 事件

// 生命周期
onMounted(() => {
  // 组件挂载时获取最新数据
})
</script>

<style lang="scss" scoped>
.question-stats-cards {
  margin-bottom: var(--brand-spacing-xl);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--brand-spacing-lg);
  margin-bottom: var(--brand-spacing-xl);
}

.stat-card {
  display: flex;
  align-items: center;
  padding: var(--brand-spacing-lg);
  border-radius: var(--brand-radius-lg);
  box-shadow: var(--brand-shadow-base);
  transition: all 0.2s ease;

  &:hover {
    box-shadow: var(--brand-shadow-lg);
    transform: translateY(-2px);
  }

  .stat-icon {
    width: 48px;
    height: 48px;
    border-radius: var(--brand-radius-base);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: var(--brand-spacing-base);
    font-size: 20px;
    color: white;

    &.total {
      background: linear-gradient(135deg, var(--brand-primary), var(--brand-primary-light));
    }

    &.today {
      background: linear-gradient(135deg, var(--brand-success), var(--brand-success-light));
    }

    &.usage {
      background: linear-gradient(135deg, var(--brand-secondary), var(--brand-secondary-light));
    }

    &.quality {
      background: linear-gradient(135deg, var(--brand-warning), var(--brand-warning-light));
    }
  }

  .stat-content {
    flex: 1;

    .stat-number {
      font-size: var(--brand-font-size-2xl);
      font-weight: 600;
      color: var(--brand-text-primary);
      line-height: 1;
      margin-bottom: var(--brand-spacing-xs);
    }

    .stat-label {
      font-size: var(--brand-font-size-sm);
      color: var(--brand-text-secondary);
    }
  }

  .stat-trend {
    display: flex;
    align-items: center;
    gap: var(--brand-spacing-xs);
    color: var(--brand-success);
    font-size: var(--brand-font-size-sm);
    font-weight: 500;
  }
}


// 响应式设计
@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--brand-spacing-base);
  }

  .stat-card {
    padding: var(--brand-spacing-base);

    .stat-icon {
      width: 40px;
      height: 40px;
      font-size: 16px;
    }

    .stat-content .stat-number {
      font-size: var(--brand-font-size-xl);
    }
  }
}
</style>
