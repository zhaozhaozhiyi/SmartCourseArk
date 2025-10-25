<template>
  <div class="course-analytics">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">课程分析</h1>
        <p class="page-description">{{ course?.title || '课程学习情况分析' }}</p>
      </div>
      <div class="header-actions">
        <el-button @click="goBack">返回</el-button>
      </div>
    </div>

    <!-- 课程概览 -->
    <div class="course-overview" v-if="course">
      <el-card>
        <template #header>
          <h3>课程概览</h3>
        </template>
        
        <div class="overview-content">
          <div class="course-info">
            <h4>{{ course.title }}</h4>
            <p class="course-description">{{ course.description }}</p>
            <div class="course-meta">
              <span class="meta-item">
                <FontAwesomeIcon :icon="['fas', 'list']" />
                {{ course.chapters?.length || 0 }} 章节
              </span>
              <span class="meta-item">
                <FontAwesomeIcon :icon="['fas', 'clock']" />
                {{ formatDuration(course.totalDuration) }}
              </span>
              <span class="meta-item">
                <FontAwesomeIcon :icon="['fas', 'chart-line']" />
                {{ course.progress || 0 }}% 完成
              </span>
            </div>
          </div>
          
          <div class="progress-overview">
            <div class="progress-circle">
              <el-progress 
                type="circle" 
                :percentage="course.progress || 0" 
                :width="120"
                :stroke-width="8"
              />
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 学习进度分析 -->
    <div class="progress-analysis">
      <el-card>
        <template #header>
          <h3>学习进度分析</h3>
        </template>
        
        <div class="progress-chart">
          <div ref="progressChart" class="chart"></div>
        </div>
      </el-card>
    </div>

    <!-- 章节掌握度 -->
    <div class="chapter-mastery">
      <el-card>
        <template #header>
          <h3>章节掌握度</h3>
        </template>
        
        <div class="mastery-content">
          <div class="mastery-chart">
            <div ref="masteryChart" class="chart"></div>
          </div>
          
          <div class="mastery-list">
            <div v-for="chapter in chapters" :key="chapter.id" class="chapter-item">
              <div class="chapter-info">
                <div class="chapter-title">{{ chapter.title }}</div>
                <div class="chapter-meta">
                  <span>{{ formatDuration(chapter.duration) }}</span>
                  <span>{{ chapter.completed ? '已完成' : '未完成' }}</span>
                </div>
              </div>
              <div class="chapter-progress">
                <el-progress 
                  :percentage="chapter.mastery" 
                  :stroke-width="8"
                  :show-text="true"
                />
              </div>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 练习统计 -->
    <div class="practice-stats">
      <el-row :gutter="24">
        <el-col :span="12">
          <el-card>
            <template #header>
              <h3>练习正确率</h3>
            </template>
            
            <div class="accuracy-chart">
              <div ref="accuracyChart" class="chart"></div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="12">
          <el-card>
            <template #header>
              <h3>错题知识点分布</h3>
            </template>
            
            <div class="knowledge-chart">
              <div ref="knowledgeChart" class="chart"></div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 学习时间分布 -->
    <div class="time-distribution">
      <el-card>
        <template #header>
          <h3>学习时间分布</h3>
        </template>
        
        <div class="time-chart">
          <div ref="timeChart" class="chart"></div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faList, faClock, faChartLine } from '@fortawesome/free-solid-svg-icons'
import * as echarts from 'echarts'

// 添加图标到库
library.add(faList, faClock, faChartLine)

const route = useRoute()
const router = useRouter()

// 响应式数据
const course = ref<any>(null)
const chapters = ref([
  {
    id: '1',
    title: '第一章：基础概念',
    duration: 45,
    completed: true,
    mastery: 85
  },
  {
    id: '2',
    title: '第二章：核心功能',
    duration: 60,
    completed: true,
    mastery: 92
  },
  {
    id: '3',
    title: '第三章：进阶应用',
    duration: 75,
    completed: false,
    mastery: 65
  }
])

// 图表引用
const progressChart = ref<HTMLElement>()
const masteryChart = ref<HTMLElement>()
const accuracyChart = ref<HTMLElement>()
const knowledgeChart = ref<HTMLElement>()
const timeChart = ref<HTMLElement>()

// 生命周期
onMounted(async () => {
  await nextTick()
  initCharts()
})

// 方法
const initCharts = () => {
  initProgressChart()
  initMasteryChart()
  initAccuracyChart()
  initKnowledgeChart()
  initTimeChart()
}

const initProgressChart = () => {
  if (!progressChart.value) return
  
  const chart = echarts.init(progressChart.value)
  
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: ['第1章', '第2章', '第3章', '第4章', '第5章']
    },
    yAxis: {
      type: 'value',
      name: '完成度(%)'
    },
    series: [
      {
        name: '完成度',
        type: 'bar',
        data: [85, 92, 65, 78, 88],
        itemStyle: {
          color: '#3B82F6'
        }
      }
    ]
  }
  
  chart.setOption(option)
}

const initMasteryChart = () => {
  if (!masteryChart.value) return
  
  const chart = echarts.init(masteryChart.value)
  
  const option = {
    tooltip: {
      trigger: 'item'
    },
    series: [
      {
        name: '掌握度',
        type: 'pie',
        radius: ['40%', '70%'],
        data: [
          { value: 85, name: '已掌握' },
          { value: 15, name: '需加强' }
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

const initAccuracyChart = () => {
  if (!accuracyChart.value) return
  
  const chart = echarts.init(accuracyChart.value)
  
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: ['单选题', '多选题', '判断题', '填空题', '简答题']
    },
    yAxis: {
      type: 'value',
      name: '正确率(%)'
    },
    series: [
      {
        name: '正确率',
        type: 'line',
        data: [85, 78, 92, 65, 70],
        smooth: true,
        itemStyle: {
          color: '#10B981'
        }
      }
    ]
  }
  
  chart.setOption(option)
}

const initKnowledgeChart = () => {
  if (!knowledgeChart.value) return
  
  const chart = echarts.init(knowledgeChart.value)
  
  const option = {
    tooltip: {
      trigger: 'item'
    },
    series: [
      {
        name: '错题分布',
        type: 'pie',
        radius: '60%',
        data: [
          { value: 35, name: '基础概念' },
          { value: 25, name: '语法规则' },
          { value: 20, name: '实践应用' },
          { value: 20, name: '进阶技巧' }
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

const initTimeChart = () => {
  if (!timeChart.value) return
  
  const chart = echarts.init(timeChart.value)
  
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
        type: 'bar',
        data: [45, 60, 30, 80, 120, 90, 75],
        itemStyle: {
          color: '#8B5CF6'
        }
      }
    ]
  }
  
  chart.setOption(option)
}

const goBack = () => {
  router.back()
}

const formatDuration = (minutes: number): string => {
  if (minutes < 60) return `${minutes}分钟`
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return remainingMinutes > 0 ? `${hours}小时${remainingMinutes}分钟` : `${hours}小时`
}
</script>

<style lang="scss" scoped>
.course-analytics {
  padding: 24px;
  max-width: 1200px;
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

.course-overview {
  margin-bottom: 32px;

  .overview-content {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .course-info {
      flex: 1;
      margin-right: 32px;

      h4 {
        font-size: 20px;
        font-weight: 600;
        color: var(--brand-text-primary);
        margin: 0 0 12px 0;
      }

      .course-description {
        color: var(--brand-text-secondary);
        margin: 0 0 16px 0;
        line-height: 1.5;
      }

      .course-meta {
        display: flex;
        gap: 24px;
        flex-wrap: wrap;

        .meta-item {
          display: flex;
          align-items: center;
          gap: 6px;
          color: var(--brand-text-secondary);
          font-size: 14px;

          svg {
            color: var(--brand-text-tertiary);
          }
        }
      }
    }

    .progress-overview {
      .progress-circle {
        text-align: center;
      }
    }
  }
}

.progress-analysis {
  margin-bottom: 32px;

  .progress-chart {
    height: 300px;

    .chart {
      width: 100%;
      height: 100%;
    }
  }
}

.chapter-mastery {
  margin-bottom: 32px;

  .mastery-content {
    display: flex;
    gap: 32px;

    .mastery-chart {
      width: 300px;
      height: 300px;

      .chart {
        width: 100%;
        height: 100%;
      }
    }

    .mastery-list {
      flex: 1;

      .chapter-item {
        display: flex;
        align-items: center;
        padding: 16px;
        margin-bottom: 16px;
        background: var(--brand-bg-secondary);
        border-radius: var(--brand-radius-base);
        border: 1px solid var(--brand-border);

        .chapter-info {
          flex: 1;
          margin-right: 24px;

          .chapter-title {
            font-weight: 500;
            color: var(--brand-text-primary);
            margin-bottom: 4px;
          }

          .chapter-meta {
            display: flex;
            gap: 16px;
            font-size: 14px;
            color: var(--brand-text-secondary);
          }
        }

        .chapter-progress {
          width: 200px;
        }
      }
    }
  }
}

.practice-stats {
  margin-bottom: 32px;

  .accuracy-chart, .knowledge-chart {
    height: 300px;

    .chart {
      width: 100%;
      height: 100%;
    }
  }
}

.time-distribution {
  .time-chart {
    height: 300px;

    .chart {
      width: 100%;
      height: 100%;
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .course-analytics {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .overview-content {
    flex-direction: column;
    gap: 24px;
    align-items: stretch;

    .course-info {
      margin-right: 0;
    }
  }

  .mastery-content {
    flex-direction: column;
    gap: 24px;

    .mastery-chart {
      width: 100%;
    }
  }

  .chapter-item {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;

    .chapter-info {
      margin-right: 0;
    }

    .chapter-progress {
      width: 100%;
    }
  }
}
</style>
