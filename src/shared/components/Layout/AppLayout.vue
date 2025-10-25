<template>
  <div 
    class="app-layout" 
    :class="{ 
      'sidebar-collapsed': appStore.sidebarCollapsed,
      'tablet-mode': appStore.isTablet,
      'mobile-mode': appStore.isSmallScreen
    }"
  >
    <!-- 侧边栏 -->
    <Sidebar />
    
    <!-- 主内容区 -->
    <div class="main-container">
      <!-- 顶部导航栏 -->
      <Header />
      
      <!-- 页面内容 -->
      <div class="content-wrapper">
        <router-view v-slot="{ Component }">
          <transition name="fade-slide" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAppStore } from '@/store/modules/app'
import Sidebar from './Sidebar.vue'
import Header from './Header.vue'

const appStore = useAppStore()
</script>

<style lang="scss" scoped>
.app-layout {
  display: flex;
  height: 100vh;
  background-color: var(--el-bg-color-page);

  &.sidebar-collapsed {
    .main-container {
      margin-left: 64px;
    }
  }
}

.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: 240px;
  transition: margin-left 0.3s ease;

  // 平板模式 - 侧边栏折叠
  .app-layout.tablet-mode & {
    margin-left: 64px;
  }

  // 移动端模式 - 无侧边栏边距
  .app-layout.mobile-mode & {
    margin-left: 0;
  }
}

.content-wrapper {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background-color: var(--el-bg-color-page);
}

// 页面切换动画
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
</style>