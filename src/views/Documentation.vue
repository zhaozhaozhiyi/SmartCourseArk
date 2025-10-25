<template>
  <div class="documentation-container">
    <div class="documentation-iframe-container">
      <iframe 
        ref="docsIframe"
        :src="docsUrl" 
        frameborder="0"
        class="docs-iframe"
        @load="onIframeLoad"
      ></iframe>
    </div>
    
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p>正在加载文档...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

const docsIframe = ref<HTMLIFrameElement>()
const loading = ref(true)

// 根据环境确定文档URL
const docsUrl = computed(() => {
  if (import.meta.env.DEV) {
    // 开发环境：使用VitePress开发服务器
    return 'http://localhost:5173'
  } else {
    // 生产环境：使用构建后的静态文件
    return '/docs/index.html'
  }
})

const onIframeLoad = () => {
  loading.value = false
}

onMounted(() => {
  // 监听iframe加载完成
  if (docsIframe.value) {
    docsIframe.value.onload = () => {
      loading.value = false
    }
  }
})
</script>

<style scoped>
.documentation-container {
  width: 100%;
  height: 100vh;
  position: relative;
  background: var(--brand-bg-primary);
}

.documentation-iframe-container {
  width: 100%;
  height: 100vh;
  position: relative;
}

.docs-iframe {
  width: 100%;
  height: 100%;
  border: none;
  background: white;
}

.loading-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  z-index: 10;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--brand-border-light);
  border-top: 4px solid var(--brand-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-overlay p {
  color: var(--brand-text-secondary);
  font-size: 0.875rem;
  margin: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .documentation-iframe-container {
    height: 100vh;
  }
}

/* 暗色主题适配 */
.dark .documentation-container {
  background: var(--brand-bg);
}

.dark .docs-iframe {
  background: var(--brand-bg);
}
</style>
