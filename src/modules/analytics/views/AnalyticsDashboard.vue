<template>
  <div class="analytics-dashboard">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">学习分析</h1>
        <p class="page-description">深入了解您的学习情况和进度</p>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <el-row :gutter="24">
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon">
                <FontAwesomeIcon :icon="['fas', 'book-open']" />
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.totalCourses }}</div>
                <div class="stat-label">学习课程</div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon">
                <FontAwesomeIcon :icon="['fas', 'trophy']" />
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.completedCourses }}</div>
                <div class="stat-label">已完成</div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon">
                <FontAwesomeIcon :icon="['fas', 'clock']" />
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ formatDuration(stats.totalStudyTime) }}</div>
                <div class="stat-label">学习时长</div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon">
                <FontAwesomeIcon :icon="['fas', 'chart-line']" />
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.averageScore }}%</div>
                <div class="stat-label">平均分数</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 图表区域 -->
    <div class="charts-section">
      <el-row :gutter="24">
        <!-- 学习时长趋势 -->
        <el-col :span="12">
          <el-card>
            <template #header>
              <h3>学习时长趋势</h3>
            </template>
            
            <div class="chart-container">
              <div ref="studyTimeChart" class="chart"></div>
            </div>
          </el-card>
        </el-col>
        
        <!-- 练习次数统计 -->
        <el-col :span="12">
          <el-card>
            <template #header>
              <h3>练习次数统计</h3>
            </template>
            
            <div class="chart-container">
              <div ref="practiceChart" class="chart"></div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 最近学习记录 -->
    <div class="recent-learning">
      <el-card>
        <template #header>
          <h3>最近学习记录</h3>
        </template>
        
        <div class="learning-list">
          <div v-if="recentLearning.length === 0" class="empty-learning">
            <div class="empty-icon">
              <FontAwesomeIcon :icon="['fas', 'book-open']" />
            </div>
            <p>暂无学习记录</p>
          </div>
          
          <div v-for="record in recentLearning" :key="record.id" class="learning-item">
            <div class="learning-icon">
              <FontAwesomeIcon :icon="getLearningIcon(record.type)" />
            </div>
            <div class="learning-content">
              <div class="learning-title">{{ record.title }}</div>
              <div class="learning-meta">
                <span class="learning-time">{{ formatDate(record.time) }}</span>
                <span class="learning-duration">{{ formatDuration(record.duration) }}</span>
              </div>
            </div>
            <div class="learning-status">
              <el-tag :type="record.status === 'completed' ? 'success' : 'warning'">
                {{ record.status === 'completed' ? '已完成' : '进行中' }}
              </el-tag>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 课程完成度 -->
    <div class="course-progress">
      <el-card>
        <template #header>
          <h3>课程完成度</h3>
        </template>
        
        <div class="progress-list">
          <div v-if="courseProgress.length === 0" class="empty-progress">
            <p>暂无课程进度</p>
          </div>
          
          <div v-for="course in courseProgress" :key="course.id" class="progress-item">
            <div class="progress-info">
              <div class="course-title">{{ course.title }}</div>
              <div class="course-meta">
                <span>{{ course.completedChapters }} / {{ course.totalChapters }} 章节</span>
                <span>{{ formatDuration(course.totalStudyTime) }}</span>
              </div>
            </div>
            <div class="progress-bar">
              <el-progress 
                :percentage="course.progress" 
                :stroke-width="8"
                :show-text="true"
              />
            </div>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { 
  faBookOpen, faTrophy, faClock, faChartLine
} from '@fortawesome/free-solid-svg-icons'
import * as echarts from 'echarts'

// 添加图标到库
library.add(faBookOpen, faTrophy, faClock, faChartLine)

// 响应式数据
const stats = ref({
  totalCourses: 12,
  completedCourses: 8,
  totalStudyTime: 2400, // 分钟
  averageScore: 85
})

const recentLearning = ref([
  {
    id: '1',
    type: 'study',
    title: '完成了《Vue.js基础教程》第三章学习',
    time: new Date().toISOString(),
    duration: 45,
    status: 'completed'
  },
  {
    id: '2',
    type: 'practice',
    title: '完成了《JavaScript进阶》综合练习',
    time: new Date(Date.now() - 86400000).toISOString(),
    duration: 30,
    status: 'completed'
  }
])

const courseProgress = ref([
  {
    id: '1',
    title: 'Vue.js基础教程',
    completedChapters: 8,
    totalChapters: 10,
    progress: 80,
    totalStudyTime: 320
  },
  {
    id: '2',
    title: 'JavaScript进阶',
    completedChapters: 5,
    totalChapters: 8,
    progress: 62,
    totalStudyTime: 280
  }
])

// 图表引用
const studyTimeChart = ref<HTMLElement>()
const practiceChart = ref<HTMLElement>()

// 生命周期
onMounted(async () => {
  await nextTick()
  initCharts()
})

// 方法
const initCharts = () => {
  initStudyTimeChart()
  initPracticeChart()
}

const initStudyTimeChart = () => {
  if (!studyTimeChart.value) return
  
  const chart = echarts.init(studyTimeChart.value)
  
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    },
    yAxis: {
      type: 'value',
      name: '学习时长(分钟)'
    },
    series: [
      {
        name: '学习时长',
        type: 'line',
        data: [45, 60, 30, 80, 120, 90, 75],
        smooth: true,
        itemStyle: {
          color: '#3B82F6'
        }
      }
    ]
  }
  
  chart.setOption(option)
}

const initPracticeChart = () => {
  if (!practiceChart.value) return
  
  const chart = echarts.init(practiceChart.value)
  
  const option = {
    tooltip: {
      trigger: 'item'
    },
    series: [
      {
        name: '练习次数',
        type: 'pie',
        radius: '60%',
        data: [
          { value: 25, name: '章节练习' },
          { value: 15, name: '综合练习' },
          { value: 8, name: '错题练习' },
          { value: 5, name: '模拟考试' }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }
  
  chart.setOption(option)
}

const getLearningIcon = (type: string) => {
  switch (type) {
    case 'study':
      return ['fas', 'book-open']
    case 'practice':
      return ['fas', 'trophy']
    default:
      return ['fas', 'clock']
  }
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatDuration = (minutes: number): string => {
  if (minutes < 60) return `${minutes}分钟`
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return remainingMinutes > 0 ? `${hours}小时${remainingMinutes}分钟` : `${hours}小时`
}
</script>

<style lang="scss" scoped>
.analytics-dashboard {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--brand-border);

  .header-content {
    .page-title {
      font-size: 32px;
      font-weight: 600;
      color: var(--brand-text-primary);
      margin: 0 0 8px 0;
    }

    .page-description {
      font-size: 18px;
      color: var(--brand-text-secondary);
      margin: 0;
    }
  }
}

.stats-cards {
  margin-bottom: 32px;

  .stat-card {
    .stat-content {
      display: flex;
      align-items: center;
      gap: 16px;

      .stat-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 60px;
        height: 60px;
        background: var(--brand-primary-bg);
        color: var(--brand-primary);
        border-radius: 50%;
        font-size: 24px;
      }

      .stat-info {
        .stat-value {
          font-size: 30px;
          font-weight: 700;
          color: var(--brand-text-primary);
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 16px;
          color: var(--brand-text-secondary);
        }
      }
    }
  }
}

.charts-section {
  margin-bottom: 32px;

  .chart-container {
    height: 300px;

    .chart {
      width: 100%;
      height: 100%;
    }
  }
}

.recent-learning {
  margin-bottom: 32px;

  .learning-list {
    .empty-learning {
      text-align: center;
      padding: 40px 20px;
      color: var(--brand-text-secondary);

      .empty-icon {
        font-size: 48px;
        color: var(--brand-text-tertiary);
        margin-bottom: 16px;
      }
    }

    .learning-item {
      display: flex;
      align-items: center;
      padding: 16px;
      margin-bottom: 12px;
      background: var(--brand-bg-secondary);
      border-radius: var(--brand-radius-base);
      border: 1px solid var(--brand-border);

      .learning-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        background: var(--brand-primary-bg);
        color: var(--brand-primary);
        border-radius: 50%;
        margin-right: 16px;
      }

      .learning-content {
        flex: 1;

        .learning-title {
          font-size: 16px;
          font-weight: 500;
          color: var(--brand-text-primary);
          margin-bottom: 4px;
        }

        .learning-meta {
          display: flex;
          gap: 16px;
          font-size: 15px;
          color: var(--brand-text-secondary);

          .learning-time {
            color: var(--brand-text-secondary);
          }

          .learning-duration {
            color: var(--brand-text-tertiary);
          }
        }
      }

      .learning-status {
        margin-left: 16px;
      }
    }
  }
}

.course-progress {
  .progress-list {
    .empty-progress {
      text-align: center;
      padding: 40px 20px;
      color: var(--brand-text-secondary);
    }

    .progress-item {
      display: flex;
      align-items: center;
      padding: 16px;
      margin-bottom: 16px;
      background: var(--brand-bg-secondary);
      border-radius: var(--brand-radius-base);
      border: 1px solid var(--brand-border);

      .progress-info {
        flex: 1;
        margin-right: 24px;

        .course-title {
          font-size: 16px;
          font-weight: 500;
          color: var(--brand-text-primary);
          margin-bottom: 4px;
        }

        .course-meta {
          display: flex;
          gap: 16px;
          font-size: 15px;
          color: var(--brand-text-secondary);
        }
      }

      .progress-bar {
        width: 200px;
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .analytics-dashboard {
    padding: 16px;
  }

  .stats-cards {
    .el-row {
      .el-col {
        margin-bottom: 16px;
      }
    }
  }

  .charts-section {
    .el-row {
      .el-col {
        margin-bottom: 16px;
      }
    }
  }

  .progress-item {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;

    .progress-info {
      margin-right: 0;
    }

    .progress-bar {
      width: 100%;
    }
  }
}
</style>
