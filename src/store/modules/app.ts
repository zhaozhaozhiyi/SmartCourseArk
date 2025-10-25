import { defineStore } from 'pinia'
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { getTheme, setTheme } from '@/shared/utils/storage'

export const useAppStore = defineStore('app', () => {
  // 状态
  const theme = ref<Theme>(getTheme())
  const sidebarCollapsed = ref(false)
  const loading = ref(false)
  const screenSize = ref<'xs' | 'sm' | 'md' | 'lg' | 'xl'>('lg')
  const mobileSidebarVisible = ref(false)

  // 计算属性
  const isDark = computed(() => theme.value === 'dark')
  const isMobile = computed(() => screenSize.value === 'xs')
  const isTablet = computed(() => screenSize.value === 'md')
  const isSmallScreen = computed(() => ['xs', 'sm'].includes(screenSize.value))
  const sidebarMode = computed(() => {
    if (isMobile.value) return 'drawer'
    if (isTablet.value) return 'collapsed'
    return 'expanded'
  })

  // 切换主题
  const toggleTheme = () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
    setTheme(theme.value)
    updateDocumentTheme()
  }

  // 更新文档主题
  const updateDocumentTheme = () => {
    document.documentElement.setAttribute('data-theme', theme.value)
  }

  // 切换侧边栏
  const toggleSidebar = () => {
    if (isSmallScreen.value) {
      mobileSidebarVisible.value = !mobileSidebarVisible.value
    } else {
      sidebarCollapsed.value = !sidebarCollapsed.value
    }
  }

  // 关闭移动端侧边栏
  const closeMobileSidebar = () => {
    mobileSidebarVisible.value = false
  }

  // 检测屏幕尺寸
  const updateScreenSize = () => {
    const width = window.innerWidth
    if (width < 480) {
      screenSize.value = 'xs'
    } else if (width < 768) {
      screenSize.value = 'sm'
    } else if (width < 1024) {
      screenSize.value = 'sm' // 768px-1023px 为小屏幕
    } else if (width < 1280) {
      screenSize.value = 'md' // 1024px-1279px 为平板模式
    } else if (width < 1536) {
      screenSize.value = 'lg' // 1280px-1535px 为大屏幕
    } else {
      screenSize.value = 'xl' // 1536px+ 为超大屏幕
    }
  }

  // 设置加载状态
  const setLoading = (loadingState: boolean) => {
    loading.value = loadingState
  }

  // 初始化
  const init = () => {
    updateDocumentTheme()
    updateScreenSize()
    
    // 监听窗口大小变化
    const handleResize = () => {
      updateScreenSize()
      // 在小屏幕切换到桌面端时关闭移动端侧边栏
      if (!isSmallScreen.value) {
        mobileSidebarVisible.value = false
      }
    }
    
    window.addEventListener('resize', handleResize)
    
    // 清理函数
    onUnmounted(() => {
      window.removeEventListener('resize', handleResize)
    })
  }

  return {
    // 状态
    theme,
    sidebarCollapsed,
    loading,
    screenSize,
    mobileSidebarVisible,
    
    // 计算属性
    isDark,
    isMobile,
    isTablet,
    isSmallScreen,
    sidebarMode,
    
    // 方法
    toggleTheme,
    toggleSidebar,
    closeMobileSidebar,
    setLoading,
    init
  }
})