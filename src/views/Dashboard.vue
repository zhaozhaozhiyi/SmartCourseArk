<template>
  <div class="dashboard">
    <!-- 欢迎横幅 -->
    <div class="welcome-banner">
      <div class="banner-background">
        <div class="gradient-overlay"></div>
        <div class="pattern-overlay"></div>
      </div>
      <div class="banner-content">
        <div class="welcome-text">
          <div class="welcome-badge">
            <FontAwesomeIcon :icon="['fas', 'star']" />
            <span>AI智能学习平台</span>
          </div>
          <h1 class="welcome-title">欢迎来到智课方舟</h1>
          <p class="welcome-subtitle">让AI助力您的学习之旅，智能课程平台为您提供个性化学习体验</p>
        </div>
        <div class="welcome-illustration">
          <div class="illustration-container">
            <div class="floating-card card-1">
              <FontAwesomeIcon :icon="['fas', 'book']" />
            </div>
            <div class="floating-card card-2">
              <FontAwesomeIcon :icon="['fas', 'graduation-cap']" />
            </div>
            <div class="floating-card card-3">
              <FontAwesomeIcon :icon="['fas', 'lightbulb']" />
            </div>
          </div>
        </div>
      </div>
    </div>

   

    <!-- 快速操作 -->
    <div class="quick-actions">
      <div class="section-header">
        <h3 class="section-title">快速操作</h3>
        <p class="section-subtitle">选择您想要进行的操作，开始您的学习之旅</p>
      </div>
      <div class="action-grid">
        <div class="action-card primary" @click="navigateTo('/courses/create')">
          <div class="card-glow"></div>
          <div class="action-content">
            <div class="action-icon">
              <FontAwesomeIcon :icon="['fas', 'plus-circle']" />
          </div>
            <div class="action-info">
              <h4>创建课程</h4>
              <p>上传文档，AI智能生成课程内容</p>
            </div>
            <div class="action-arrow">
              <FontAwesomeIcon :icon="['fas', 'arrow-right']" />
            </div>
          </div>
        </div>

        <div class="action-card secondary" @click="navigateTo('/courses')">
          <div class="card-glow"></div>
          <div class="action-content">
            <div class="action-icon">
              <FontAwesomeIcon :icon="['fas', 'play-circle']" />
          </div>
            <div class="action-info">
              <h4>继续学习</h4>
              <p>查看您的学习进度，继续未完成的课程</p>
            </div>
            <div class="action-arrow">
              <FontAwesomeIcon :icon="['fas', 'arrow-right']" />
            </div>
          </div>
        </div>

        <div class="action-card tertiary" @click="navigateTo('/practice')">
          <div class="card-glow"></div>
          <div class="action-content">
            <div class="action-icon">
              <FontAwesomeIcon :icon="['fas', 'trophy']" />
          </div>
            <div class="action-info">
              <h4>开始练习</h4>
              <p>通过练习巩固知识点，提升学习效果</p>
            </div>
            <div class="action-arrow">
              <FontAwesomeIcon :icon="['fas', 'arrow-right']" />
            </div>
          </div>
        </div>

        <div class="action-card quaternary" @click="navigateTo('/analytics')">
          <div class="card-glow"></div>
          <div class="action-content">
            <div class="action-icon">
              <FontAwesomeIcon :icon="['fas', 'chart-bar']" />
          </div>
            <div class="action-info">
              <h4>学习分析</h4>
              <p>查看详细的学习数据和进度分析</p>
            </div>
            <div class="action-arrow">
              <FontAwesomeIcon :icon="['fas', 'arrow-right']" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 最近学习 -->
    <div class="recent-learning">
      <div class="section-header">
        <h3 class="section-title">最近学习</h3>
        <p class="section-subtitle">继续您的学习之旅，让知识护航成长</p>
          </div>
      <div class="learning-container">
        <div v-if="recentLearning.length === 0" class="empty-learning">
          <div class="empty-illustration">
            <div class="empty-icon">
              <FontAwesomeIcon :icon="['fas', 'book-open']" />
            </div>
            <div class="empty-decoration">
              <div class="decoration-circle circle-1"></div>
              <div class="decoration-circle circle-2"></div>
              <div class="decoration-circle circle-3"></div>
            </div>
          </div>
          <div class="empty-content">
            <h4 class="empty-title">开始您的学习之旅</h4>
            <p class="empty-description">还没有开始学习任何课程，让我们为您创建第一个课程吧</p>
            <button class="brand-btn-primary empty-action" @click="navigateTo('/courses/create')">
              <FontAwesomeIcon :icon="['fas', 'plus']" />
              <span>创建第一个课程</span>
            </button>
          </div>
        </div>
        
        <div v-else class="learning-list">
          <div v-for="course in recentLearning" :key="course.id" class="learning-item">
            <div class="course-cover">
              <div class="cover-icon">
                <FontAwesomeIcon :icon="['fas', 'book']" />
          </div>
              <div class="cover-progress">
                <div class="progress-ring">
                  <svg class="progress-circle" viewBox="0 0 36 36">
                    <path class="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <path class="circle-progress" :stroke-dasharray="`${course.progress}, 100`" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  </svg>
                  <span class="progress-percentage">{{ course.progress }}%</span>
                </div>
              </div>
            </div>
            <div class="course-info">
              <div class="course-header">
                <h4 class="course-title">{{ course.title }}</h4>
                <div class="course-status">
                  <span v-if="course.progress === 100" class="status-badge completed">
                    <FontAwesomeIcon :icon="['fas', 'check']" />
                    已完成
                  </span>
                  <span v-else-if="course.progress > 0" class="status-badge in-progress">
                    <FontAwesomeIcon :icon="['fas', 'play']" />
                    学习中
                  </span>
                  <span v-else class="status-badge not-started">
                    <FontAwesomeIcon :icon="['fas', 'clock']" />
                    未开始
                  </span>
                </div>
              </div>
              <p class="course-description">{{ course.description }}</p>
              <div class="course-progress">
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: `${course.progress}%` }"></div>
                </div>
                <span class="progress-text">{{ course.progress }}% 完成</span>
              </div>
            </div>
            <div class="course-actions">
              <button class="brand-btn-primary course-btn" @click="continueLearning(course.id)">
                <FontAwesomeIcon :icon="['fas', course.progress > 0 ? 'play' : 'play-circle']" />
                <span>{{ course.progress > 0 ? '继续学习' : '开始学习' }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 学习统计概览 -->
    <div class="stats-overview" v-if="stats.totalCourses > 0">
      <div class="stats-grid">
        <div class="stat-card courses">
          <div class="card-header">
            <div class="stat-icon">
              <FontAwesomeIcon :icon="['fas', 'book']" />
            </div>
            <div class="trend-indicator positive">
              <FontAwesomeIcon :icon="['fas', 'arrow-up']" />
              <span>+2</span>
            </div>
          </div>
          <div class="card-content">
            <div class="stat-value">{{ stats.totalCourses }}</div>
            <div class="stat-label">总课程数</div>
            <div class="stat-description">您已创建的所有课程</div>
          </div>
        </div>

        <div class="stat-card completed">
          <div class="card-header">
            <div class="stat-icon">
              <FontAwesomeIcon :icon="['fas', 'check-circle']" />
            </div>
            <div class="trend-indicator positive">
              <FontAwesomeIcon :icon="['fas', 'arrow-up']" />
              <span>+1</span>
            </div>
          </div>
          <div class="card-content">
            <div class="stat-value">{{ stats.completedCourses }}</div>
            <div class="stat-label">已完成课程</div>
            <div class="stat-description">学习进度达到100%</div>
          </div>
        </div>

        <div class="stat-card time">
          <div class="card-header">
            <div class="stat-icon">
              <FontAwesomeIcon :icon="['fas', 'clock']" />
            </div>
            <div class="trend-indicator positive">
              <FontAwesomeIcon :icon="['fas', 'arrow-up']" />
              <span>+30min</span>
            </div>
          </div>
          <div class="card-content">
            <div class="stat-value">{{ formatStudyTime(stats.totalStudyTime) }}</div>
            <div class="stat-label">总学习时长</div>
            <div class="stat-description">所有课程的总时长</div>
          </div>
        </div>

        <div class="stat-card score">
          <div class="card-header">
            <div class="stat-icon">
              <FontAwesomeIcon :icon="['fas', 'chart-line']" />
            </div>
            <div class="trend-indicator positive">
              <FontAwesomeIcon :icon="['fas', 'arrow-up']" />
              <span>+5%</span>
            </div>
          </div>
          <div class="card-content">
            <div class="stat-value">{{ stats.averageScore }}</div>
            <div class="stat-label">平均分数</div>
            <div class="stat-description">练习和测试平均分</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 学习数据区域 -->
    <div class="learning-data-section">
      <!-- 学习日历 -->
      <div class="learning-calendar">
        <div class="section-header">
          <h3 class="section-title">学习日历</h3>
          <p class="section-subtitle">记录您的学习足迹，见证成长历程</p>
        </div>
        <div class="calendar-container">
          <div class="calendar-header">
            <div class="calendar-stats">
              <div class="stat-item">
                <div class="stat-icon">
                  <FontAwesomeIcon :icon="['fas', 'calendar-check']" />
                </div>
                <div class="stat-content">
                  <span class="stat-value">{{ getStudyDaysCount() }}</span>
                  <span class="stat-label">学习天数</span>
                </div>
              </div>
              <div class="stat-item">
                <div class="stat-icon">
                  <FontAwesomeIcon :icon="['fas', 'fire']" />
                </div>
                <div class="stat-content">
                  <span class="stat-value">{{ getStreakDays() }}</span>
                  <span class="stat-label">连续天数</span>
                </div>
              </div>
            </div>
            <div class="calendar-controls">
              <button class="calendar-btn" @click="previousMonth">
                <FontAwesomeIcon :icon="['fas', 'chevron-left']" />
              </button>
              <span class="current-month">{{ formatMonth(calendarValue) }}</span>
              <button class="calendar-btn" @click="nextMonth">
                <FontAwesomeIcon :icon="['fas', 'chevron-right']" />
              </button>
            </div>
          </div>
          <div class="calendar-grid">
            <div class="calendar-weekdays">
              <div class="weekday" v-for="day in weekdays" :key="day">{{ day }}</div>
            </div>
            <div class="calendar-days">
              <div 
                v-for="day in calendarDays" 
                :key="day.date" 
                class="calendar-day"
                :class="{ 
                  'is-today': isToday(day.date),
                  'has-study': getStudyData(day.date),
                  'is-other-month': !day.isCurrentMonth
                }"
              >
                <span class="day-number">{{ day.day }}</span>
                <div v-if="getStudyData(day.date)" class="study-indicator">
                  <FontAwesomeIcon :icon="['fas', 'check']" />
                </div>
                <div v-if="isToday(day.date)" class="today-indicator"></div>
              </div>
            </div>
          </div>
          <div class="calendar-legend">
            <div class="legend-item">
              <div class="legend-dot today"></div>
              <span>今天</span>
            </div>
            <div class="legend-item">
              <div class="legend-dot study"></div>
              <span>学习日</span>
            </div>
            <div class="legend-item">
              <div class="legend-dot other"></div>
              <span>其他月份</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 学习成就 -->
      <div class="achievements">
        <div class="section-header">
          <h3 class="section-title">学习成就</h3>
          <p class="section-subtitle">解锁成就徽章，见证您的学习里程碑</p>
        </div>
        <div class="achievement-container">
          <div class="achievement-summary">
            <div class="summary-card">
              <div class="summary-icon">
                <FontAwesomeIcon :icon="['fas', 'trophy']" />
              </div>
              <div class="summary-content">
                <span class="summary-value">{{ getUnlockedAchievementsCount() }}</span>
                <span class="summary-label">已获得成就</span>
              </div>
            </div>
            <div class="summary-card">
              <div class="summary-icon">
                <FontAwesomeIcon :icon="['fas', 'star']" />
              </div>
              <div class="summary-content">
                <span class="summary-value">{{ getTotalAchievementsCount() }}</span>
                <span class="summary-label">总成就数</span>
              </div>
            </div>
            <div class="summary-card">
              <div class="summary-icon">
                <FontAwesomeIcon :icon="['fas', 'chart-line']" />
              </div>
              <div class="summary-content">
                <span class="summary-value">{{ getAchievementProgress() }}%</span>
                <span class="summary-label">完成进度</span>
              </div>
            </div>
          </div>
          
          <div class="achievement-list">
            <div v-for="achievement in achievements" :key="achievement.id" class="achievement-item">
              <div class="achievement-icon" :class="{ 
                unlocked: achievement.unlocked,
                locked: !achievement.unlocked
              }">
                <div class="icon-background">
                  <FontAwesomeIcon :icon="['fas', achievement.icon]" />
                </div>
                <div v-if="achievement.unlocked" class="unlock-effect">
                  <div class="sparkle sparkle-1"></div>
                  <div class="sparkle sparkle-2"></div>
                  <div class="sparkle sparkle-3"></div>
                </div>
              </div>
              <div class="achievement-info">
                <div class="achievement-header">
                  <h4 class="achievement-title">{{ achievement.title }}</h4>
                  <div class="achievement-status">
                    <span v-if="achievement.unlocked" class="status-badge unlocked">
                      <FontAwesomeIcon :icon="['fas', 'check']" />
                      已获得
                    </span>
                    <span v-else class="status-badge locked">
                      <FontAwesomeIcon :icon="['fas', 'lock']" />
                      未获得
                    </span>
                  </div>
                </div>
                <p class="achievement-description">{{ achievement.description }}</p>
                <div v-if="achievement.progress !== undefined" class="achievement-progress">
                  <div class="progress-bar">
                    <div class="progress-fill" :style="{ width: `${achievement.progress}%` }"></div>
                  </div>
                  <span class="progress-text">{{ achievement.progress }}%</span>
                </div>
              </div>
              <div class="achievement-reward">
                <div v-if="achievement.unlocked" class="reward-badge">
                  <FontAwesomeIcon :icon="['fas', 'medal']" />
                </div>
                <div v-else class="reward-placeholder">
                  <FontAwesomeIcon :icon="['fas', 'question']" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { 
  faBookOpen, faClock, faTrophy, faGraduationCap,
  faCheckCircle, faChartLine, faPlusCircle, faPlayCircle,
  faChartBar, faBook, faCheck, faCalendarCheck,
  faLightbulb, faArrowUp, faArrowRight, faStar,
  faPlus, faPlay, faChevronLeft, faChevronRight,
  faFire, faLock, faMedal, faQuestion
} from '@fortawesome/free-solid-svg-icons'
import { useCourseStore } from '@/store/modules/course'
// 添加图标到库
library.add(
  faBookOpen, faClock, faTrophy, faGraduationCap,
  faCheckCircle, faChartLine, faPlusCircle, faPlayCircle,
  faChartBar, faBook, faCheck, faCalendarCheck,
  faLightbulb, faArrowUp, faArrowRight, faStar,
  faPlus, faPlay, faChevronLeft, faChevronRight,
  faFire, faLock, faMedal, faQuestion
)

const router = useRouter()
const courseStore = useCourseStore()

// 响应式数据
const calendarValue = ref(new Date())

// 统计数据 - 基于真实课程数据计算
const stats = computed(() => {
  const courses = courseStore.courses
  const totalCourses = courses.length
  const completedCourses = courses.filter(c => c.progress === 100).length
  const totalStudyTime = courses.reduce((total, course) => total + (course.totalDuration || 0), 0)
  const averageScore = 85 // 暂时保持固定值，后续可以从学习记录中计算
  
  return {
    totalCourses,
    completedCourses,
    totalStudyTime,
    averageScore
  }
})

// 日历相关数据
const weekdays = ['日', '一', '二', '三', '四', '五', '六']
const calendarDays = ref<Array<{date: string, day: number, isCurrentMonth: boolean}>>([])

// 最近学习 - 从课程store获取真实数据
const recentLearning = computed(() => {
  // 获取所有课程，按更新时间排序，取前3个
  return courseStore.courses
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 3)
    .map(course => ({
      id: course.id,
      title: course.title,
      description: course.description,
      progress: course.progress || 0
    }))
})

const achievements = ref([
  {
    id: '1',
    title: '学习新手',
    description: '完成第一门课程',
    icon: 'graduation-cap',
    unlocked: true,
    progress: 100
  },
  {
    id: '2',
    title: '坚持不懈',
    description: '连续学习7天',
    icon: 'calendar-check',
    unlocked: true,
    progress: 100
  },
  {
    id: '3',
    title: '学霸',
    description: '平均分达到90分以上',
    icon: 'trophy',
    unlocked: false,
    progress: 85
  },
  {
    id: '4',
    title: '知识探索者',
    description: '完成10门课程',
    icon: 'book-open',
    unlocked: false,
    progress: 50
  },
  {
    id: '5',
    title: '时间管理大师',
    description: '单日学习时长超过4小时',
    icon: 'clock',
    unlocked: false,
    progress: 30
  },
  {
    id: '6',
    title: '完美主义者',
    description: '获得满分成绩',
    icon: 'star',
    unlocked: false,
    progress: 0
  }
])

// 生命周期
onMounted(async () => {
  // 初始化数据
  generateCalendarDays()
  // 加载课程数据
  await courseStore.fetchCourses()
})

// 方法
const navigateTo = (path: string) => {
  router.push(path)
}

// 学习统计相关函数
const getStudyDaysCount = () => {
  // 模拟数据，实际应该从学习记录中计算
  return 15
}

const getStreakDays = () => {
  // 模拟数据，实际应该从学习记录中计算连续学习天数
  return 7
}

const getUnlockedAchievementsCount = () => {
  return achievements.value.filter(a => a.unlocked).length
}

const getTotalAchievementsCount = () => {
  return achievements.value.length
}

const getAchievementProgress = () => {
  const unlocked = getUnlockedAchievementsCount()
  const total = getTotalAchievementsCount()
  return Math.round((unlocked / total) * 100)
}

const continueLearning = (courseId: string) => {
  router.push(`/courses/${courseId}/learn`)
}

const getStudyData = (date: string): boolean => {
  // 模拟学习数据，实际应该从store中获取
  const studyDates = ['2024-01-20', '2024-01-19', '2024-01-18', '2024-01-17', '2024-01-15']
  return studyDates.includes(date)
}

const formatDuration = (minutes: number): string => {
  if (minutes < 60) return `${minutes}分钟`
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return remainingMinutes > 0 ? `${hours}小时${remainingMinutes}分钟` : `${hours}小时`
}

// 格式化学习时长显示
const formatStudyTime = (minutes: number): string => {
  return formatDuration(minutes)
}

// 日历相关方法
const generateCalendarDays = () => {
  const year = calendarValue.value.getFullYear()
  const month = calendarValue.value.getMonth()
  const firstDay = new Date(year, month, 1)
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay())
  
  const days = []
  const currentDate = new Date(startDate)
  
  for (let i = 0; i < 42; i++) {
    days.push({
      date: currentDate.toISOString().split('T')[0],
      day: currentDate.getDate(),
      isCurrentMonth: currentDate.getMonth() === month
    })
    currentDate.setDate(currentDate.getDate() + 1)
  }
  
  calendarDays.value = days
}

const previousMonth = () => {
  calendarValue.value = new Date(calendarValue.value.getFullYear(), calendarValue.value.getMonth() - 1, 1)
  generateCalendarDays()
}

const nextMonth = () => {
  calendarValue.value = new Date(calendarValue.value.getFullYear(), calendarValue.value.getMonth() + 1, 1)
  generateCalendarDays()
}

const formatMonth = (date: Date): string => {
  return `${date.getFullYear()}年${date.getMonth() + 1}月`
}

const isToday = (date: string): boolean => {
  const today = new Date().toISOString().split('T')[0]
  return date === today
}
</script>

<style lang="scss" scoped>
.dashboard {
  padding: 32px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 200px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    opacity: 0.05;
    z-index: 0;
  }
}

.welcome-banner {
  position: relative;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 24px;
  padding: 48px;
  margin-bottom: 40px;
  color: white;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(102, 126, 234, 0.3);

  .banner-background {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1;

    .gradient-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
    }

    .pattern-overlay {
      position: absolute;
      top: 0;
      right: 0;
      width: 300px;
      height: 100%;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
      opacity: 0.3;
    }
  }

  .banner-content {
    position: relative;
    z-index: 2;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .welcome-text {
      flex: 1;
      max-width: 600px;

      .welcome-badge {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        background: rgba(255, 255, 255, 0.2);
        padding: 8px 16px;
        border-radius: 20px;
        font-size: 14px;
        font-weight: 500;
        margin-bottom: 20px;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.3);

        svg {
          font-size: 16px;
          animation: sparkle 2s ease-in-out infinite;
        }
      }

      .welcome-title {
        font-size: 56px;
        font-weight: 800;
        margin: 0 0 20px 0;
        line-height: 1.1;
        background: linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .welcome-subtitle {
        font-size: 24px;
        color: #ffffff;
        margin: 0 0 32px 0;
        line-height: 1.6;
        font-weight: 500;
      }

    }

    .welcome-illustration {
      position: relative;
      width: 300px;
      height: 200px;

      .illustration-container {
        position: relative;
        width: 100%;
        height: 100%;

        .floating-card {
          position: absolute;
          width: 80px;
          height: 80px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          animation: float 3s ease-in-out infinite;

          &.card-1 {
            top: 20px;
            right: 20px;
            animation-delay: 0s;
          }

          &.card-2 {
            top: 60px;
            right: 120px;
            animation-delay: 1s;
          }

          &.card-3 {
            top: 100px;
            right: 50px;
            animation-delay: 2s;
          }
        }
      }
    }
  }
}

.section-title {
    font-size: 32px;
  font-weight: 700;
  color: #1e293b;
    margin: 0 0 8px 0;
  line-height: 1.2;
  }
  
.section-subtitle {
    font-size: 18px;
  color: #64748b;
  margin: 0 0 32px 0;
  font-weight: 400;
  }

.section-header {
  margin-bottom: 32px;
}

.stats-overview {
  margin-bottom: 48px;

.stats-grid {
  display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 24px;
}

.stat-card {
    background: white;
    border-radius: 20px;
    padding: 28px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    border: 1px solid rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
    }

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
    }

    &.courses::before {
      background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
    }

    &.completed::before {
      background: linear-gradient(90deg, #10b981 0%, #059669 100%);
    }

    &.time::before {
      background: linear-gradient(90deg, #8b5cf6 0%, #7c3aed 100%);
    }

    &.score::before {
      background: linear-gradient(90deg, #f59e0b 0%, #d97706 100%);
    }

    .card-header {
    display: flex;
      justify-content: space-between;
    align-items: center;
      margin-bottom: 20px;
    
    .stat-icon {
      display: flex;
      align-items: center;
      justify-content: center;
        width: 56px;
        height: 56px;
        border-radius: 16px;
        font-size: 24px;
        color: white;
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);

        .courses & {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .completed & {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        }

        .time & {
          background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
        }

        .score & {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        }
      }

      .trend-indicator {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 6px 12px;
      border-radius: 12px;
        font-size: 12px;
        font-weight: 600;

        &.positive {
          background: #dcfce7;
          color: #166534;
        }

        &.negative {
          background: #fef2f2;
          color: #dc2626;
        }

        svg {
          font-size: 10px;
        }
      }
    }

    .card-content {
      margin-bottom: 20px;
      
      .stat-value {
        font-size: 36px;
        font-weight: 800;
        color: #1e293b;
        line-height: 1;
        margin-bottom: 8px;
      }
      
      .stat-label {
        font-size: 16px;
        color: #64748b;
        font-weight: 500;
        margin-bottom: 4px;
      }

      .stat-description {
        font-size: 14px;
        color: #94a3b8;
        font-weight: 400;
      }
    }

    .card-footer {
      .progress-bar {
        width: 100%;
        height: 6px;
        background: #f1f5f9;
        border-radius: 3px;
        overflow: hidden;

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
          border-radius: 3px;
          transition: width 0.3s ease;
        }
      }
    }
  }
}

.quick-actions {
  margin-bottom: 48px;

  .action-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 24px;
  }

  .action-card {
    position: relative;
    background: white;
    border-radius: 20px;
    padding: 32px;
    cursor: pointer;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    border: 1px solid rgba(0, 0, 0, 0.05);
    overflow: hidden;

    .card-glow {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
      opacity: 0;
      transition: opacity 0.3s ease;
      border-radius: 20px;
    }

    &:hover {
      transform: translateY(-8px);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);

      .card-glow {
        opacity: 1;
      }

      .action-arrow {
        transform: translateX(4px);
      }
    }

    &.primary {
      border-left: 4px solid #667eea;

      .action-icon {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }
    }

    &.secondary {
      border-left: 4px solid #10b981;

      .action-icon {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      }
    }

    &.tertiary {
      border-left: 4px solid #8b5cf6;

      .action-icon {
        background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
      }
    }

    &.quaternary {
      border-left: 4px solid #f59e0b;

      .action-icon {
        background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      }
    }

    .action-content {
      position: relative;
      z-index: 2;
      display: flex;
      align-items: center;
      gap: 20px;

      .action-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 64px;
        height: 64px;
        border-radius: 18px;
        font-size: 24px;
        color: white;
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
        flex-shrink: 0;
      }

      .action-info {
        flex: 1;

        h4 {
    font-size: 22px;
          font-weight: 700;
          color: #1e293b;
          margin: 0 0 8px 0;
          line-height: 1.3;
        }

        p {
          font-size: 16px;
          color: #64748b;
          margin: 0;
          line-height: 1.5;
          font-weight: 400;
        }
      }

      .action-arrow {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        background: #f8fafc;
        border-radius: 12px;
        color: #64748b;
        font-size: 16px;
        transition: all 0.3s ease;
        flex-shrink: 0;
      }
    }
  }
}

.recent-learning {
  margin-bottom: 48px;

  .learning-container {
    background: var(--brand-bg-primary);
    border-radius: var(--brand-radius-xl);
    box-shadow: var(--brand-shadow-base);
    border: 1px solid var(--brand-border-light);
    overflow: hidden;
  }

  .empty-learning {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 80px 40px;
    text-align: center;

    .empty-illustration {
      position: relative;
      margin-bottom: 32px;

      .empty-icon {
        font-size: 80px;
        color: var(--brand-primary);
        margin-bottom: 16px;
        animation: float 3s ease-in-out infinite;
      }

      .empty-decoration {
        position: absolute;
        top: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 120px;
        height: 120px;

        .decoration-circle {
          position: absolute;
          border-radius: 50%;
          opacity: 0.3;
          animation: pulse 2s ease-in-out infinite;

          &.circle-1 {
            width: 20px;
            height: 20px;
            background: var(--brand-primary);
            top: 20px;
            left: 20px;
            animation-delay: 0s;
          }

          &.circle-2 {
            width: 16px;
            height: 16px;
            background: var(--brand-secondary);
            top: 40px;
            right: 20px;
            animation-delay: 0.5s;
          }

          &.circle-3 {
            width: 12px;
            height: 12px;
            background: var(--brand-accent-green);
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            animation-delay: 1s;
          }
        }
      }
    }

    .empty-content {
      .empty-title {
        font-size: 24px;
        font-weight: 700;
        color: var(--brand-text-primary);
        margin: 0 0 12px 0;
      }

      .empty-description {
        font-size: 16px;
        color: var(--brand-text-secondary);
        margin: 0 0 32px 0;
        line-height: 1.6;
        max-width: 400px;
      }

      .empty-action {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 12px 24px;
        font-size: 16px;
    font-weight: 600;
      }
    }
  }

  .learning-list {
    padding: 24px;

    .learning-item {
      display: flex;
      align-items: center;
      padding: 24px;
      margin-bottom: 16px;
      background: var(--brand-bg-primary);
      border-radius: var(--brand-radius-lg);
      border: 1px solid var(--brand-border-light);
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 4px;
        height: 100%;
        background: var(--brand-primary);
        opacity: 0;
        transition: opacity 0.3s ease;
      }

      &:hover {
        box-shadow: var(--brand-shadow-lg);
        transform: translateY(-2px);
        border-color: var(--brand-primary);

        &::before {
          opacity: 1;
        }
      }

      .course-cover {
        position: relative;
        width: 80px;
        height: 80px;
        margin-right: 24px;
        flex-shrink: 0;

        .cover-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-primary-6) 100%);
          color: white;
          border-radius: var(--brand-radius-lg);
          font-size: 32px;
          box-shadow: var(--brand-shadow-base);
        }

        .cover-progress {
          position: absolute;
          top: -4px;
          right: -4px;
          width: 32px;
          height: 32px;

          .progress-ring {
            position: relative;
            width: 100%;
            height: 100%;

            .progress-circle {
              width: 100%;
              height: 100%;
              transform: rotate(-90deg);

              .circle-bg {
                fill: none;
                stroke: var(--brand-bg-tertiary);
                stroke-width: 3;
              }

              .circle-progress {
                fill: none;
                stroke: var(--brand-accent-green);
                stroke-width: 3;
                stroke-linecap: round;
                transition: stroke-dasharray 0.3s ease;
              }
            }

            .progress-percentage {
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              font-size: 10px;
              font-weight: 600;
              color: var(--brand-accent-green);
            }
          }
        }
      }

      .course-info {
        flex: 1;
        margin-right: 24px;

        .course-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;

          .course-title {
            font-size: 20px;
            font-weight: 700;
            color: var(--brand-text-primary);
            margin: 0;
          }

          .course-status {
            .status-badge {
              display: inline-flex;
              align-items: center;
              gap: 4px;
              padding: 4px 8px;
              border-radius: var(--brand-radius-sm);
              font-size: 12px;
              font-weight: 600;

              &.completed {
                background: var(--brand-success-bg);
                color: var(--brand-success);
              }

              &.in-progress {
                background: var(--brand-warning-bg);
                color: var(--brand-warning);
              }

              &.not-started {
                background: var(--brand-bg-tertiary);
                color: var(--brand-text-tertiary);
              }
            }
          }
        }

        .course-description {
          font-size: 15px;
          color: var(--brand-text-secondary);
    margin: 0 0 16px 0;
          line-height: 1.5;
        }

        .course-progress {
          display: flex;
          align-items: center;
          gap: 12px;

          .progress-bar {
            flex: 1;
            height: 6px;
            background: var(--brand-bg-tertiary);
            border-radius: 3px;
            overflow: hidden;

            .progress-fill {
              height: 100%;
              background: linear-gradient(90deg, var(--brand-primary) 0%, var(--brand-primary-6) 100%);
              border-radius: 3px;
              transition: width 0.3s ease;
            }
          }

          .progress-text {
            font-size: 15px;
            color: var(--brand-text-secondary);
            font-weight: 500;
            min-width: 60px;
            text-align: right;
          }
        }
      }

      .course-actions {
          .course-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          font-size: 15px;
          font-weight: 600;
          border-radius: var(--brand-radius-base);
          transition: all 0.3s ease;

          &:hover {
            transform: translateY(-1px);
            box-shadow: var(--brand-shadow-lg);
          }
        }
      }
    }
  }
}

// 学习数据区域容器
.learning-data-section {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--brand-spacing-xl);
  margin-bottom: var(--brand-spacing-2xl);

  // 大屏幕 (≥1200px) 时并排显示
  @media (min-width: 1200px) {
    grid-template-columns: 1fr 1fr;
    gap: var(--brand-spacing-2xl);
  }

  // 超大屏幕 (≥1400px) 时优化布局
  @media (min-width: 1400px) {
    gap: var(--brand-spacing-3xl);
    max-width: 1400px;
    margin: 0 auto var(--brand-spacing-2xl);
  }
}

// 确保两个组件高度一致
.learning-calendar,
.achievements {
  display: flex;
  flex-direction: column;
  height: fit-content;

  .calendar-container,
  .achievement-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 500px; // 设置最小高度确保视觉平衡
  }
}

.learning-calendar {
  margin-bottom: 0; // 移除原来的margin-bottom，由父容器控制

  .calendar-container {
    background: var(--brand-bg-primary);
    border-radius: var(--brand-radius-xl);
    box-shadow: var(--brand-shadow-base);
    border: 1px solid var(--brand-border-light);
    overflow: hidden;

    .calendar-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 24px;
      background: linear-gradient(135deg, var(--brand-primary-bg) 0%, var(--brand-bg-secondary) 100%);
      border-bottom: 1px solid var(--brand-border-light);

      .calendar-stats {
        display: flex;
        gap: 24px;

        .stat-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: var(--brand-bg-primary);
          border-radius: var(--brand-radius-base);
          box-shadow: var(--brand-shadow-sm);

          .stat-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 40px;
            height: 40px;
            background: var(--brand-primary);
            color: white;
            border-radius: var(--brand-radius-base);
            font-size: 18px;
          }

          .stat-content {
            display: flex;
            flex-direction: column;
            gap: 2px;

            .stat-value {
              font-size: 22px;
              font-weight: 700;
              color: var(--brand-text-primary);
              line-height: 1;
            }

            .stat-label {
              font-size: 14px;
              color: var(--brand-text-secondary);
              font-weight: 500;
            }
          }
        }
      }

      .calendar-controls {
        display: flex;
        align-items: center;
    gap: 16px;

        .calendar-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background: var(--brand-bg-primary);
          border: 1px solid var(--brand-border);
          border-radius: var(--brand-radius-base);
          color: var(--brand-text-primary);
          font-size: 16px;
          cursor: pointer;
          transition: all 0.3s ease;

          &:hover {
            background: var(--brand-primary);
            color: white;
            border-color: var(--brand-primary);
            transform: translateY(-1px);
            box-shadow: var(--brand-shadow-base);
          }
        }

        .current-month {
          font-size: 20px;
          font-weight: 700;
          color: var(--brand-text-primary);
          min-width: 120px;
          text-align: center;
        }
      }
    }

    .calendar-grid {
      padding: 24px;

      .calendar-weekdays {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 8px;
        margin-bottom: 16px;

        .weekday {
          text-align: center;
          font-size: 15px;
          font-weight: 600;
          color: var(--brand-text-secondary);
          padding: 12px 0;
        }
      }

      .calendar-days {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 8px;

        .calendar-day {
          position: relative;
          aspect-ratio: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--brand-radius-base);
    cursor: pointer;
          transition: all 0.3s ease;
          background: var(--brand-bg-primary);
          border: 1px solid var(--brand-border-light);

          &:hover {
            background: var(--brand-primary-bg);
            border-color: var(--brand-primary);
            transform: translateY(-1px);
            box-shadow: var(--brand-shadow-sm);
          }

          &.is-today {
            background: var(--brand-primary);
            color: white;
            border-color: var(--brand-primary);
            font-weight: 700;

            .today-indicator {
              position: absolute;
              top: 4px;
              right: 4px;
              width: 6px;
              height: 6px;
              background: white;
              border-radius: 50%;
            }
          }

          &.has-study {
            background: var(--brand-accent-green);
            color: white;
            border-color: var(--brand-accent-green);

            .study-indicator {
              position: absolute;
              top: 4px;
              right: 4px;
              width: 16px;
              height: 16px;
              background: white;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 10px;
              color: var(--brand-accent-green);
            }
          }

          &.is-other-month {
            color: var(--brand-text-disabled);
            background: var(--brand-bg-tertiary);
            border-color: var(--brand-bg-tertiary);

            &:hover {
              background: var(--brand-bg-tertiary);
              border-color: var(--brand-bg-tertiary);
              transform: none;
              box-shadow: none;
            }
          }

          .day-number {
            font-size: 15px;
            font-weight: 500;
          }
        }
      }
    }

    .calendar-legend {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 24px;
      padding: 16px 24px;
      background: var(--brand-bg-secondary);
      border-top: 1px solid var(--brand-border-light);

        .legend-item {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 15px;
        color: var(--brand-text-secondary);

        .legend-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;

          &.today {
            background: var(--brand-primary);
          }

          &.study {
            background: var(--brand-accent-green);
          }

          &.other {
            background: var(--brand-text-disabled);
          }
        }
      }
    }
  }
}

.achievements {
  margin-bottom: 0; // 移除原来的margin-bottom，由父容器控制

  .achievement-container {
    background: var(--brand-bg-primary);
    border-radius: var(--brand-radius-xl);
    box-shadow: var(--brand-shadow-base);
    border: 1px solid var(--brand-border-light);
    overflow: hidden;

    .achievement-summary {
      display: flex;
      gap: 24px;
      padding: 24px;
      background: linear-gradient(135deg, var(--brand-primary-bg) 0%, var(--brand-bg-secondary) 100%);
      border-bottom: 1px solid var(--brand-border-light);

      .summary-card {
        flex: 1;
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 20px;
        background: var(--brand-bg-primary);
        border-radius: var(--brand-radius-lg);
        box-shadow: var(--brand-shadow-sm);
    transition: all 0.3s ease;
    
    &:hover {
      transform: translateY(-2px);
          box-shadow: var(--brand-shadow-base);
        }

        .summary-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          background: var(--brand-primary);
          color: white;
          border-radius: var(--brand-radius-lg);
          font-size: 20px;
          box-shadow: var(--brand-shadow-sm);
        }

        .summary-content {
      display: flex;
      flex-direction: column;
          gap: 4px;

          .summary-value {
            font-size: 26px;
            font-weight: 800;
            color: var(--brand-text-primary);
            line-height: 1;
          }

          .summary-label {
            font-size: 15px;
            color: var(--brand-text-secondary);
            font-weight: 500;
          }
        }
      }
    }

    .achievement-list {
      padding: 24px;
      flex: 1;
      max-height: 400px;
      overflow-y: auto;
      
      // 自定义滚动条样式
      &::-webkit-scrollbar {
        width: 6px;
      }
      
      &::-webkit-scrollbar-track {
        background: var(--brand-bg-tertiary);
        border-radius: 3px;
      }
      
      &::-webkit-scrollbar-thumb {
        background: var(--brand-border);
        border-radius: 3px;
        
        &:hover {
          background: var(--brand-text-tertiary);
        }
      }

      .achievement-item {
        display: flex;
      align-items: center;
        padding: 24px;
        margin-bottom: 16px;
        background: var(--brand-bg-primary);
        border-radius: var(--brand-radius-lg);
        border: 1px solid var(--brand-border-light);
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;

        &::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 4px;
          height: 100%;
          background: var(--brand-primary);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        &:hover {
          box-shadow: var(--brand-shadow-lg);
          transform: translateY(-2px);
          border-color: var(--brand-primary);

          &::before {
            opacity: 1;
          }
        }

        .achievement-icon {
          position: relative;
          width: 80px;
          height: 80px;
          margin-right: 24px;
          flex-shrink: 0;

          .icon-background {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;
            border-radius: 50%;
            font-size: 32px;
            transition: all 0.3s ease;
            position: relative;
            z-index: 2;
          }

          &.unlocked {
            .icon-background {
              background: linear-gradient(135deg, var(--brand-accent-green) 0%, #059669 100%);
              color: white;
              box-shadow: var(--brand-shadow-base);
            }

            .unlock-effect {
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              pointer-events: none;

              .sparkle {
                position: absolute;
                width: 4px;
                height: 4px;
                background: var(--brand-accent-yellow);
                border-radius: 50%;
                animation: sparkle 2s ease-in-out infinite;

                &.sparkle-1 {
                  top: 20%;
                  left: 20%;
                  animation-delay: 0s;
                }

                &.sparkle-2 {
                  top: 30%;
                  right: 20%;
                  animation-delay: 0.5s;
                }

                &.sparkle-3 {
                  bottom: 20%;
                  left: 50%;
                  transform: translateX(-50%);
                  animation-delay: 1s;
                }
              }
            }
          }

          &.locked {
            .icon-background {
              background: var(--brand-bg-tertiary);
              color: var(--brand-text-disabled);
            }
          }
        }

        .achievement-info {
          flex: 1;
          margin-right: 24px;

          .achievement-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
        margin-bottom: 8px;

            .achievement-title {
              font-size: 20px;
              font-weight: 700;
              color: var(--brand-text-primary);
              margin: 0;
            }

            .achievement-status {
              .status-badge {
                display: inline-flex;
                align-items: center;
                gap: 4px;
                padding: 6px 12px;
                border-radius: var(--brand-radius-base);
                font-size: 12px;
                font-weight: 600;

                &.unlocked {
                  background: var(--brand-success-bg);
                  color: var(--brand-success);
                }

                &.locked {
                  background: var(--brand-bg-tertiary);
                  color: var(--brand-text-tertiary);
                }
              }
            }
          }

          .achievement-description {
            font-size: 15px;
            color: var(--brand-text-secondary);
            margin: 0 0 16px 0;
            line-height: 1.5;
          }

          .achievement-progress {
            display: flex;
            align-items: center;
            gap: 12px;

            .progress-bar {
              flex: 1;
              height: 6px;
              background: var(--brand-bg-tertiary);
              border-radius: 3px;
              overflow: hidden;

              .progress-fill {
                height: 100%;
                background: linear-gradient(90deg, var(--brand-primary) 0%, var(--brand-primary-6) 100%);
                border-radius: 3px;
                transition: width 0.3s ease;
              }
            }

            .progress-text {
              font-size: 15px;
              color: var(--brand-text-secondary);
        font-weight: 500;
              min-width: 40px;
              text-align: right;
            }
          }
        }

        .achievement-reward {
          .reward-badge {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 48px;
            height: 48px;
            background: linear-gradient(135deg, var(--brand-accent-yellow) 0%, #d97706 100%);
            color: white;
            border-radius: 50%;
            font-size: 20px;
            box-shadow: var(--brand-shadow-base);
            animation: pulse 2s ease-in-out infinite;
          }

          .reward-placeholder {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 48px;
            height: 48px;
            background: var(--brand-bg-tertiary);
            color: var(--brand-text-disabled);
            border-radius: 50%;
    font-size: 20px;
          }
        }
      }
    }
  }
}

// 动画效果
@keyframes sparkle {
  0%, 100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
  50% {
    transform: scale(1.1) rotate(180deg);
    opacity: 0.8;
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.8;
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// 平板设备优化 (768px - 1199px)
@media (min-width: 768px) and (max-width: 1199px) {
  .learning-data-section {
    gap: var(--brand-spacing-lg);
  }
  
  .learning-calendar,
  .achievements {
    .calendar-container,
    .achievement-container {
      min-height: 450px;
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .dashboard {
    padding: 20px;
  }

  .welcome-banner {
    padding: 32px 24px;

    .banner-content {
      flex-direction: column;
      gap: 32px;
      text-align: center;

      .welcome-text {
        .welcome-title {
          font-size: 36px;
        }

        .welcome-subtitle {
          font-size: 18px;
        }

        .welcome-stats {
          flex-direction: column;
          gap: 16px;
          align-items: center;

          .stat-item {
            width: 100%;
            max-width: 280px;
          }
        }
      }

      .welcome-illustration {
        width: 200px;
        height: 150px;

        .illustration-container {
          .floating-card {
            width: 60px;
            height: 60px;
            font-size: 24px;

            &.card-1 {
              top: 10px;
              right: 10px;
            }

            &.card-2 {
              top: 40px;
              right: 80px;
            }

            &.card-3 {
              top: 70px;
              right: 30px;
            }
          }
        }
      }
    }
  }

  .stats-overview {
    .stats-grid {
      grid-template-columns: 1fr;
      gap: 16px;
    }
  }

  .quick-actions {
    .action-grid {
      grid-template-columns: 1fr;
      gap: 16px;
    }

    .action-card {
      padding: 24px;

      .action-content {
        gap: 16px;

        .action-icon {
          width: 56px;
          height: 56px;
          font-size: 20px;
        }

        .action-info {
          h4 {
            font-size: 18px;
      }
      
      p {
        font-size: 14px;
          }
        }
      }
    }
  }

  .recent-learning {
    .learning-list {
      padding: 16px;

      .learning-item {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
        padding: 20px;

        .course-cover {
          margin-right: 0;
          align-self: center;
        }

        .course-info {
          margin-right: 0;
          text-align: center;

          .course-header {
            flex-direction: column;
            gap: 8px;
            align-items: center;
          }
        }

        .course-actions {
          margin-left: 0;
        }
      }
    }
  }

  .learning-data-section {
    gap: var(--brand-spacing-lg);
  }
  
  .learning-calendar,
  .achievements {
    .calendar-container,
    .achievement-container {
      min-height: auto;
    }
  }

  .learning-calendar {
    .calendar-container {
      .calendar-header {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;

        .calendar-stats {
          justify-content: center;
        }

        .calendar-controls {
          justify-content: center;
        }
      }

      .calendar-grid {
        padding: 16px;
      }
    }
  }

  .achievements {
    .achievement-container {
      .achievement-summary {
        flex-direction: column;
        gap: 16px;

        .summary-card {
          padding: 16px;
        }
      }

      .achievement-list {
        padding: 16px;

        .achievement-item {
          flex-direction: column;
          gap: 16px;
          align-items: stretch;
  padding: 20px;

          .achievement-icon {
            margin-right: 0;
            align-self: center;
          }

          .achievement-info {
            margin-right: 0;
            text-align: center;

            .achievement-header {
              flex-direction: column;
              gap: 8px;
              align-items: center;
            }
          }

          .achievement-reward {
            margin-left: 0;
            align-self: center;
          }
        }
      }
    }
  }
}

@media (max-width: 480px) {
  .dashboard {
    padding: 16px;
  }

  .welcome-banner {
    padding: 24px 20px;

    .banner-content {
      .welcome-text {
        .welcome-title {
          font-size: 28px;
        }

        .welcome-subtitle {
          font-size: 16px;
        }
      }
    }
  }

  .section-title {
    font-size: 24px;
  }

  .stats-overview {
    .stat-card {
      padding: 20px;

      .card-content {
        .stat-value {
          font-size: 28px;
        }
      }
    }
  }
}
</style>