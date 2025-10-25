import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { setupRouterGuards } from './guards'

// 基础路由
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: {
      title: '登录',
      hidden: true,
      requiresAuth: false
    }
  },
  // 仪表盘
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/shared/components/Layout/AppLayout.vue'),
    meta: {
      title: '仪表盘',
      icon: 'House'
    },
    children: [
      {
        path: '',
        name: 'DashboardHome',
        component: () => import('@/views/Dashboard.vue'),
        meta: {
          title: '系统概览'
        }
      }
    ]
  },
  // 课程管理
  {
    path: '/courses',
    name: 'CourseManagement',
    component: () => import('@/shared/components/Layout/AppLayout.vue'),
    meta: {
      title: '课程管理',
      icon: 'Reading'
    },
    children: [
      {
        path: '',
        name: 'CourseList',
        component: () => import('@/modules/course/views/CourseList.vue'),
        meta: {
          title: '课程列表'
        }
      },
      {
        path: 'create',
        name: 'CourseCreate',
        component: () => import('@/modules/course/views/CourseCreate.vue'),
        meta: {
          title: '创建课程'
        }
      },
      {
        path: ':id',
        name: 'CourseDetail',
        component: () => import('@/modules/course/views/CourseDetail.vue'),
        meta: {
          title: '课程详情'
        }
      },
      {
        path: ':id/edit',
        name: 'CourseEdit',
        component: () => import('@/modules/course/views/CourseEdit.vue'),
        meta: {
          title: '编辑课程'
        }
      },
      {
        path: ':id/learn',
        name: 'CourseLearning',
        component: () => import('@/modules/course/views/learning/CourseLearning.vue'),
        meta: {
          title: '课程学习'
        }
      }
    ]
  },
  // 题库管理
  {
    path: '/questions',
    name: 'QuestionManagement',
    component: () => import('@/shared/components/Layout/AppLayout.vue'),
    meta: {
      title: '题库管理',
      icon: 'EditPen'
    },
    children: [
      {
        path: '',
        name: 'QuestionBank',
        component: () => import('@/modules/question/views/QuestionBank.vue'),
        meta: {
          title: '题库列表'
        }
      },
      {
        path: 'generate',
        name: 'QuestionGenerate',
        component: () => import('@/modules/question/views/QuestionGenerate.vue'),
        meta: {
          title: '生成题目'
        }
      },
      {
        path: 'generate/:courseId',
        name: 'QuestionGenerateWithCourse',
        component: () => import('@/modules/question/views/QuestionGenerate.vue'),
        meta: {
          title: '生成题目'
        }
      },
      {
        path: 'edit/:id',
        name: 'QuestionEdit',
        component: () => import('@/modules/question/views/QuestionEdit.vue'),
        meta: {
          title: '编辑题目'
        }
      }
    ]
  },
  // 练习系统
  {
    path: '/practice',
    name: 'Practice',
    component: () => import('@/shared/components/Layout/AppLayout.vue'),
    meta: {
      title: '练习系统',
      icon: 'Trophy'
    },
    children: [
      {
        path: '',
        name: 'PracticeList',
        component: () => import('@/modules/practice/views/PracticeList.vue'),
        meta: {
          title: '练习列表'
        }
      },
      {
        path: 'history',
        name: 'PracticeHistory',
        component: () => import('@/modules/practice/views/PracticeHistory.vue'),
        meta: {
          title: '练习历史'
        }
      },
      {
        path: ':courseId',
        name: 'PracticeConfig',
        component: () => import('@/modules/practice/views/PracticeConfig.vue'),
        meta: {
          title: '练习配置'
        }
      },
      {
        path: ':courseId/session/:sessionId',
        name: 'PracticeSession',
        component: () => import('@/modules/practice/views/PracticeSession.vue'),
        meta: {
          title: '练习会话'
        }
      },
      {
        path: ':courseId/result/:sessionId',
        name: 'PracticeResult',
        component: () => import('@/modules/practice/views/PracticeResult.vue'),
        meta: {
          title: '练习结果'
        }
      }
    ]
  },
  // 学习分析
  {
    path: '/analytics',
    name: 'Analytics',
    component: () => import('@/shared/components/Layout/AppLayout.vue'),
    meta: {
      title: '学习分析',
      icon: 'TrendCharts'
    },
    children: [
      {
        path: '',
        name: 'AnalyticsDashboard',
        component: () => import('@/modules/analytics/views/AnalyticsDashboard.vue'),
        meta: {
          title: '学习概览'
        }
      },
      {
        path: ':courseId',
        name: 'CourseAnalytics',
        component: () => import('@/modules/analytics/views/CourseAnalytics.vue'),
        meta: {
          title: '课程分析'
        }
      }
    ]
  },
  // 文档中心
  {
    path: '/docs',
    name: 'Documentation',
    component: () => import('@/views/Documentation.vue'),
    meta: {
      title: '文档中心',
      icon: 'Document',
      hidden: false
    }
  },
  // 404页面
  {
    path: '/404',
    name: 'NotFound',
    component: () => import('@/views/404.vue'),
    meta: {
      title: '页面不存在',
      hidden: true
    }
  },
  // 404页面必须放在最后
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 })
})

// 设置路由守卫
setupRouterGuards(router)

export default router