import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getToken, setToken, removeToken, getUserInfo, setUserInfo, removeUserInfo } from '@/shared/utils/storage'
import { request } from '@/shared/utils/request'

export const useUserStore = defineStore('user', () => {
  // 状态
  const token = ref<string>(getToken() || '')
  const userInfo = ref<UserInfo | null>(getUserInfo())

  // 计算属性
  const isLoggedIn = computed(() => !!token.value)

  // 登录
  const login = async (credentials: { username: string; password: string }) => {
    try {
      // 模拟登录验证
      if (credentials.username === 'admin' && credentials.password === '123456') {
        const response = {
          token: 'mock-token-' + Date.now(),
          userInfo: {
            userId: '1',
            username: credentials.username,
            role: 'admin',
            permissions: ['*'],
            email: 'admin@zhikefangzhou.com',
            avatar: '',
            createdAt: new Date().toISOString()
          } as UserInfo
        }
        
        token.value = response.token
        userInfo.value = response.userInfo
        
        setToken(response.token)
        setUserInfo(response.userInfo)
        
        return response
      } else if (credentials.username === 'user' && credentials.password === '123456') {
        const response = {
          token: 'mock-token-' + Date.now(),
          userInfo: {
            userId: '2',
            username: credentials.username,
            role: 'user',
            permissions: ['read', 'write'],
            email: 'user@zhikefangzhou.com',
            avatar: '',
            createdAt: new Date().toISOString()
          } as UserInfo
        }
        
        token.value = response.token
        userInfo.value = response.userInfo
        
        setToken(response.token)
        setUserInfo(response.userInfo)
        
        return response
      } else {
        throw new Error('用户名或密码错误')
      }
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  }

  // 登出
  const logout = () => {
    token.value = ''
    userInfo.value = null
    
    removeToken()
    removeUserInfo()
  }

  return {
    // 状态
    token,
    userInfo,
    
    // 计算属性
    isLoggedIn,
    
    // 方法
    login,
    logout
  }
})