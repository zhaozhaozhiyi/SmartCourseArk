import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import App from './App.vue'
import router from './router'
import pinia from './store'
import { useAppStore } from './store/modules/app'

// 导入全局样式
import '@/shared/styles/variables.scss'
import '@/shared/styles/common.scss'
import '@/assets/css/brand.css'

const app = createApp(App)

// 注册Element Plus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 使用插件
app.use(pinia)
app.use(router)
app.use(ElementPlus, {
  size: 'default',
  zIndex: 3000
})

// 初始化应用状态
const appStore = useAppStore()
appStore.init()

// 挂载应用
app.mount('#app')