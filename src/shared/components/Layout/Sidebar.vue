<template>
  <!-- 移动端遮罩层 -->
  <div 
    v-if="appStore.isSmallScreen && appStore.mobileSidebarVisible" 
    class="mobile-overlay"
    @click="appStore.closeMobileSidebar"
  ></div>
  
  <!-- 侧边栏 -->
  <div 
    class="sidebar" 
    :class="{
      collapsed: appStore.sidebarCollapsed,
      'mobile-open': appStore.isSmallScreen && appStore.mobileSidebarVisible,
      'tablet-mode': appStore.isTablet
    }"
  >
    <!-- Logo -->
    <div class="sidebar-logo">
      <div class="logo-icon">
        <FontAwesomeIcon :icon="['fas', 'graduation-cap']" />
      </div>
      <span v-if="shouldShowLogoText" class="logo-text">智课方舟</span>
    </div>

    <!-- 菜单 -->
    <el-scrollbar class="sidebar-menu">
      <el-menu
        :default-active="activeMenu"
        :collapse="shouldCollapseMenu"
        :unique-opened="false"
        :router="true"
        background-color="var(--el-menu-bg-color)"
        text-color="var(--el-menu-text-color)"
        active-text-color="var(--el-color-primary)"
      >
        <!-- 仪表盘 -->
        <el-menu-item index="/dashboard">
          <FontAwesomeIcon :icon="['fas', 'chart-line']" class="font-awesome-icon" />
          <template #title>仪表盘</template>
        </el-menu-item>

        <!-- 课程管理 -->
        <el-menu-item index="/courses">
          <FontAwesomeIcon :icon="['fas', 'book-open']" class="font-awesome-icon" />
          <template #title>课程管理</template>
        </el-menu-item>


        <!-- 题库管理 -->
        <el-menu-item index="/questions">
          <FontAwesomeIcon :icon="['fas', 'question-circle']" class="font-awesome-icon" />
          <template #title>题库管理</template>
        </el-menu-item>

        <!-- 练习系统 -->
        <el-menu-item index="/practice">
          <FontAwesomeIcon :icon="['fas', 'trophy']" class="font-awesome-icon" />
          <template #title>练习系统</template>
        </el-menu-item>

        <!-- 学习分析 -->
        <el-menu-item index="/analytics">
          <FontAwesomeIcon :icon="['fas', 'chart-bar']" class="font-awesome-icon" />
          <template #title>学习分析</template>
        </el-menu-item>

        <!-- 文档中心 -->
        <el-menu-item @click="openDocsInNewTab">
          <FontAwesomeIcon :icon="['fas', 'book']" class="font-awesome-icon" />
          <template #title>文档中心</template>
        </el-menu-item>
      </el-menu>
    </el-scrollbar>

    <!-- 折叠按钮 -->
    <div class="sidebar-footer">
      <el-button
        type="text"
        @click="appStore.toggleSidebar"
        class="collapse-btn"
      >
        <FontAwesomeIcon :icon="['fas', appStore.sidebarCollapsed ? 'chevron-right' : 'chevron-left']" />
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '@/store/modules/app'
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import {
  faGraduationCap,
  faChartLine,
  faBookOpen,
  faQuestionCircle,
  faTrophy,
  faChartBar,
  faBook,
  faChevronLeft,
  faChevronRight
} from '@fortawesome/free-solid-svg-icons'

// 添加图标到库
library.add(
  faGraduationCap,
  faChartLine,
  faBookOpen,
  faQuestionCircle,
  faTrophy,
  faChartBar,
  faBook,
  faChevronLeft,
  faChevronRight
)

const route = useRoute()
const appStore = useAppStore()

// 当前激活的菜单
const activeMenu = computed(() => route.path)

// 在新页签中打开文档中心
const openDocsInNewTab = () => {
  window.open('/docs', '_blank')
}

// 是否显示Logo文字
const shouldShowLogoText = computed(() => {
  if (appStore.isSmallScreen) return false
  if (appStore.isTablet) return false
  return !appStore.sidebarCollapsed
})

// 是否折叠菜单
const shouldCollapseMenu = computed(() => {
  if (appStore.isSmallScreen) return false
  if (appStore.isTablet) return true
  return appStore.sidebarCollapsed
})
</script>

<style lang="scss" scoped>
// 移动端遮罩层
.mobile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
  transition: opacity 0.3s ease;
}

.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 240px;
  height: 100vh;
  background: #ffffff;
  border-right: 1px solid #e5e7eb;
  transition: all 0.3s ease;
  z-index: 1000;

  &.collapsed {
    width: 64px;
  }

  // 移动端 - 抽屉模式
  @media (max-width: 1023px) {
    transform: translateX(-100%);
    width: 280px;
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
    
    &.mobile-open {
      transform: translateX(0);
    }
  }
}

// 平板模式 - 自动折叠 (在移动端媒体查询之外)
.sidebar.tablet-mode {
  width: 64px;
}

.sidebar-logo {
  display: flex;
  align-items: center;
  height: 64px;
  padding: 0 16px;
  border-bottom: 1px solid #e5e7eb;

  .logo-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    margin-right: 16px;
    color: #3b82f6;
    font-size: 20px;
  }

  .logo-text {
    font-size: 17px;
    font-weight: 600;
    color: #1f2937;
    white-space: nowrap;
    transition: opacity 0.15s ease, transform 0.15s ease;
  }
}

.sidebar-menu {
  height: calc(100vh - 128px);
  padding: 8px 0;
}

.sidebar-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-top: 1px solid #e5e7eb;

  .collapse-btn {
    width: 32px;
    height: 32px;
    border-radius: 6px;
    transition: background-color 0.15s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #6b7280;

    &:hover {
      background-color: #f3f4f6;
      color: #374151;
    }
  }
}

// 菜单样式覆盖
:deep(.el-menu) {
  border-right: none;
  background: transparent;
}

:deep(.el-menu-item) {
  height: 48px;
  line-height: 48px;
  margin: 4px 8px;
  border-radius: 6px;
  transition: background-color 0.15s ease;
  color: #374151;
  font-size: 15px;
  font-weight: 500;

  &:hover {
    background-color: #f3f4f6;
    color: #1f2937;
  }

  &.is-active {
    background-color: #dbeafe;
    color: #1d4ed8;
    font-weight: 600;
  }

  .el-icon {
    margin-right: 24px;
    color: #6b7280;
    font-size: 18px;
  }

  // FontAwesome 图标间距
  .font-awesome-icon {
    margin-right: 10px;
    color: #6b7280;
    font-size: 18px;
  }

  // 展开状态下的文字显示动画
  .el-menu-item__title {
    opacity: 1;
    transform: translateX(0);
    transition: opacity 0.2s ease, transform 0.2s ease;
    white-space: nowrap;
    width: auto;
    visibility: visible;
  }

  &.is-active .el-icon,
  &.is-active .font-awesome-icon {
    color: #1d4ed8;
  }
}

// 折叠状态下的样式调整
.sidebar.collapsed,
.sidebar.tablet-mode {
  .sidebar-logo {
    .logo-text {
      opacity: 0;
      transform: translateX(-10px);
      transition: opacity 0.15s ease, transform 0.15s ease;
    }
  }

  :deep(.el-menu-item) {
    margin: 4px 8px;
    justify-content: center;
    padding: 0;
    display: flex;
    align-items: center;
    overflow: hidden;

    .el-icon,
    .font-awesome-icon {
      margin: 0;
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      transition: all 0.15s ease;
    }

    // 文字立即隐藏，避免重叠
    .el-menu-item__title {
      opacity: 0 !important;
      transform: translateX(-20px) !important;
      transition: none !important;
      white-space: nowrap;
      width: 0 !important;
      overflow: hidden;
      visibility: hidden;
    }
  }
}

// 移动端特殊样式
@media (max-width: 1023px) {
  .sidebar {
    // 移动端菜单项样式调整
    :deep(.el-menu-item) {
      height: 56px;
      line-height: 56px;
      margin: 2px 12px;
      font-size: 16px;
      
      .font-awesome-icon {
        margin-right: 12px;
        font-size: 20px;
      }
    }
  }
}

// 滚动条样式
:deep(.el-scrollbar__bar) {
  &.is-vertical {
    right: 2px;
    width: 4px;
  }
}

:deep(.el-scrollbar__thumb) {
  background-color: #d1d5db;
  border-radius: 2px;
  
  &:hover {
    background-color: #9ca3af;
  }
}
</style>