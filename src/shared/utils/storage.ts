// 本地存储工具

const TOKEN_KEY = 'token'
const USER_INFO_KEY = 'userInfo'
const SPACE_INFO_KEY = 'spaceInfo'
const THEME_KEY = 'theme'
const LAYOUT_KEY = 'layout'

// Token相关
export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY)
}

export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token)
}

export const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY)
}

// 用户信息相关
export const getUserInfo = (): UserInfo | null => {
  const userInfo = localStorage.getItem(USER_INFO_KEY)
  return userInfo ? JSON.parse(userInfo) : null
}

export const setUserInfo = (userInfo: UserInfo): void => {
  localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo))
}

export const removeUserInfo = (): void => {
  localStorage.removeItem(USER_INFO_KEY)
}

// 空间信息相关
export const getSpaceInfo = (): SpaceInfo | null => {
  const spaceInfo = localStorage.getItem(SPACE_INFO_KEY)
  return spaceInfo ? JSON.parse(spaceInfo) : null
}

export const setSpaceInfo = (spaceInfo: SpaceInfo): void => {
  localStorage.setItem(SPACE_INFO_KEY, JSON.stringify(spaceInfo))
}

export const removeSpaceInfo = (): void => {
  localStorage.removeItem(SPACE_INFO_KEY)
}

// 主题相关
export const getTheme = (): Theme => {
  return (localStorage.getItem(THEME_KEY) as Theme) || 'light'
}

export const setTheme = (theme: Theme): void => {
  localStorage.setItem(THEME_KEY, theme)
}

// 布局相关
export const getLayout = (): Layout => {
  return (localStorage.getItem(LAYOUT_KEY) as Layout) || 'vertical'
}

export const setLayout = (layout: Layout): void => {
  localStorage.setItem(LAYOUT_KEY, layout)
}

// 通用存储方法
export const getStorage = <T = any>(key: string): T | null => {
  const value = localStorage.getItem(key)
  return value ? JSON.parse(value) : null
}

export const setStorage = <T = any>(key: string, value: T): void => {
  localStorage.setItem(key, JSON.stringify(value))
}

export const removeStorage = (key: string): void => {
  localStorage.removeItem(key)
}

// 清空所有存储
export const clearStorage = (): void => {
  localStorage.clear()
}

// 会话存储相关
export const getSessionStorage = <T = any>(key: string): T | null => {
  const value = sessionStorage.getItem(key)
  return value ? JSON.parse(value) : null
}

export const setSessionStorage = <T = any>(key: string, value: T): void => {
  sessionStorage.setItem(key, JSON.stringify(value))
}

export const removeSessionStorage = (key: string): void => {
  sessionStorage.removeItem(key)
}

// 清空会话存储
export const clearSessionStorage = (): void => {
  sessionStorage.clear()
}
