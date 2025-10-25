import type { Router } from 'vue-router'
import { useUserStore } from '@/store/modules/user'
import { ElMessage } from 'element-plus'

export function setupRouterGuards(router: Router) {
  // 前置守卫：基础验证
  router.beforeEach(async (to, from, next) => {
    const userStore = useUserStore()
    
    // 白名单路由
    const whiteList = ['/login', '/404']
    if (whiteList.includes(to.path)) {
      next()
      return
    }
    
    // 检查登录状态
    if (!userStore.isLoggedIn) {
      ElMessage.warning('请先登录')
      next('/login')
      return
    }
    
    next()
  })
  
  // 后置守卫：页面标题
  router.afterEach((to) => {
    document.title = `${to.meta.title || ''} - 智课方舟`
  })
  
  // 错误处理
  router.onError((error) => {
    console.error('Router error:', error)
    ElMessage.error('页面加载失败')
  })
}