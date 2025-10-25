<template>
  <div class="header">
    <div class="header-left">
      <!-- 移动端汉堡菜单按钮 -->
      <el-button 
        v-if="appStore.isSmallScreen" 
        :icon="Menu" 
        circle 
        size="small" 
        class="mobile-menu-btn"
        @click="appStore.toggleSidebar"
      />
      
      <!-- 面包屑导航 -->
      <el-breadcrumb separator="/" :class="{ 'mobile-hidden': appStore.isSmallScreen }">
        <el-breadcrumb-item v-for="item in breadcrumbs" :key="item.key">
          {{ item.title }}
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    
    <div class="header-right">
      <!-- 帮助手册 -->
      <el-button 
        :icon="Document" 
        size="small" 
        class="help-doc-btn"
        @click="openHelpDocument"
      >
        帮助手册
      </el-button>
      
      <!-- 用户菜单 -->
      <el-dropdown @command="handleUserCommand">
        <div class="user-info">
          <el-avatar :size="32" :src="userAvatar">
            <el-icon><User /></el-icon>
          </el-avatar>
          <span class="username">{{ username }}</span>
          <el-icon class="dropdown-icon"><ArrowDown /></el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="profile">个人资料</el-dropdown-item>
            <el-dropdown-item command="settings">设置</el-dropdown-item>
            <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { User, ArrowDown, Menu, Document } from '@element-plus/icons-vue'
import { useAppStore } from '@/store/modules/app'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()

// 用户信息
const username = ref('管理员')
const userAvatar = ref('')

// 面包屑导航
const breadcrumbs = computed(() => {
  const matched = route.matched.filter(item => item.meta && item.meta.title)
  return matched.map((item, index) => ({
    path: item.path,
    title: item.meta?.title,
    key: `${item.path}-${String(item.name) || index}` // 确保key唯一性
  }))
})

// 打开帮助文档
const openHelpDocument = () => {
  window.open('/docs', '_blank')
}

// 处理用户菜单命令
const handleUserCommand = (command: string) => {
  switch (command) {
    case 'profile':
      console.log('打开个人资料')
      break
    case 'settings':
      console.log('打开设置')
      break
    case 'logout':
      console.log('退出登录')
      router.push('/login')
      break
  }
}
</script>

<style lang="scss" scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
  padding: 0 20px;
  background-color: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color-light);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
  
  .mobile-menu-btn {
    border: none;
    background: transparent;
    
    &:hover {
      background-color: var(--el-color-primary-light-9);
    }
  }
  
  .el-breadcrumb {
    font-size: 14px;
  }
  
  .mobile-hidden {
    display: none;
  }
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
  
  .help-doc-btn {
    border: 1px solid var(--el-color-primary);
    background: transparent;
    color: var(--el-color-primary);
    
    &:hover {
      background-color: var(--el-color-primary);
      color: white;
    }
  }
  
  .user-info {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-radius: 6px;
    cursor: pointer;
    transition: background-color 0.3s ease;
    
    &:hover {
      background-color: var(--el-color-primary-light-9);
    }
    
    .username {
      font-size: 14px;
      color: var(--el-text-color-primary);
    }
    
    .dropdown-icon {
      font-size: 12px;
      color: var(--el-text-color-regular);
    }
  }
}

:deep(.el-breadcrumb__item) {
  .el-breadcrumb__inner {
    color: var(--el-text-color-regular);
    
    &:hover {
      color: var(--el-color-primary);
    }
  }
  
  &:last-child .el-breadcrumb__inner {
    color: var(--el-text-color-primary);
    font-weight: 500;
  }
}

:deep(.el-dropdown-menu) {
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}


// 移动端响应式样式
@media (max-width: 1023px) {
  .header {
    padding: 0 16px;
    
    .header-right {
      gap: 12px;
      
      .username {
        display: none;
      }
    }
  }
}
</style>