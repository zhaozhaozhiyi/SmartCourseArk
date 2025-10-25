import { createPinia } from 'pinia'
import { createPersistedState } from 'pinia-plugin-persistedstate'

const pinia = createPinia()

// 持久化插件配置
pinia.use(createPersistedState({
  storage: localStorage,
  key: (id) => `__persisted__${id}`
}))

export default pinia

// 导出所有store
export { useUserStore } from './modules/user'
export { useAppStore } from './modules/app'
export { useCourseStore } from './modules/course'
export { useQuestionStore } from './modules/question'
export { useLearningStore } from './modules/learning'