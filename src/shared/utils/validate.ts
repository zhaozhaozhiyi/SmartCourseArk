// 验证工具函数

/**
 * 验证邮箱
 * @param email 邮箱地址
 * @returns 是否为有效邮箱
 */
export const isEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * 验证手机号
 * @param phone 手机号
 * @returns 是否为有效手机号
 */
export const isPhone = (phone: string): boolean => {
  const phoneRegex = /^1[3-9]\d{9}$/
  return phoneRegex.test(phone)
}

/**
 * 验证身份证号
 * @param idCard 身份证号
 * @returns 是否为有效身份证号
 */
export const isIdCard = (idCard: string): boolean => {
  const idCardRegex = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/
  return idCardRegex.test(idCard)
}

/**
 * 验证URL
 * @param url URL地址
 * @returns 是否为有效URL
 */
export const isUrl = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * 验证IP地址
 * @param ip IP地址
 * @returns 是否为有效IP地址
 */
export const isIP = (ip: string): boolean => {
  const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
  return ipRegex.test(ip)
}

/**
 * 验证密码强度
 * @param password 密码
 * @returns 密码强度等级 (0-4)
 */
export const getPasswordStrength = (password: string): number => {
  let strength = 0
  
  // 长度检查
  if (password.length >= 8) strength++
  
  // 包含小写字母
  if (/[a-z]/.test(password)) strength++
  
  // 包含大写字母
  if (/[A-Z]/.test(password)) strength++
  
  // 包含数字
  if (/\d/.test(password)) strength++
  
  // 包含特殊字符
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++
  
  return strength
}

/**
 * 验证密码
 * @param password 密码
 * @param minLength 最小长度，默认8
 * @returns 验证结果
 */
export const validatePassword = (password: string, minLength = 8): { valid: boolean; message: string } => {
  if (!password) {
    return { valid: false, message: '密码不能为空' }
  }
  
  if (password.length < minLength) {
    return { valid: false, message: `密码长度不能少于${minLength}位` }
  }
  
  const strength = getPasswordStrength(password)
  if (strength < 3) {
    return { valid: false, message: '密码强度不够，请包含大小写字母、数字和特殊字符' }
  }
  
  return { valid: true, message: '密码格式正确' }
}

/**
 * 验证用户名
 * @param username 用户名
 * @returns 验证结果
 */
export const validateUsername = (username: string): { valid: boolean; message: string } => {
  if (!username) {
    return { valid: false, message: '用户名不能为空' }
  }
  
  if (username.length < 3) {
    return { valid: false, message: '用户名长度不能少于3位' }
  }
  
  if (username.length > 20) {
    return { valid: false, message: '用户名长度不能超过20位' }
  }
  
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return { valid: false, message: '用户名只能包含字母、数字和下划线' }
  }
  
  return { valid: true, message: '用户名格式正确' }
}

/**
 * 验证必填字段
 * @param value 值
 * @param fieldName 字段名称
 * @returns 验证结果
 */
export const validateRequired = (value: any, fieldName: string): { valid: boolean; message: string } => {
  if (value === null || value === undefined || value === '') {
    return { valid: false, message: `${fieldName}不能为空` }
  }
  
  if (typeof value === 'string' && value.trim() === '') {
    return { valid: false, message: `${fieldName}不能为空` }
  }
  
  return { valid: true, message: '' }
}

/**
 * 验证数字范围
 * @param value 值
 * @param min 最小值
 * @param max 最大值
 * @param fieldName 字段名称
 * @returns 验证结果
 */
export const validateNumberRange = (value: number, min: number, max: number, fieldName: string): { valid: boolean; message: string } => {
  if (isNaN(value)) {
    return { valid: false, message: `${fieldName}必须是数字` }
  }
  
  if (value < min) {
    return { valid: false, message: `${fieldName}不能小于${min}` }
  }
  
  if (value > max) {
    return { valid: false, message: `${fieldName}不能大于${max}` }
  }
  
  return { valid: true, message: '' }
}

/**
 * 验证字符串长度
 * @param value 值
 * @param minLength 最小长度
 * @param maxLength 最大长度
 * @param fieldName 字段名称
 * @returns 验证结果
 */
export const validateStringLength = (value: string, minLength: number, maxLength: number, fieldName: string): { valid: boolean; message: string } => {
  if (typeof value !== 'string') {
    return { valid: false, message: `${fieldName}必须是字符串` }
  }
  
  if (value.length < minLength) {
    return { valid: false, message: `${fieldName}长度不能少于${minLength}位` }
  }
  
  if (value.length > maxLength) {
    return { valid: false, message: `${fieldName}长度不能超过${maxLength}位` }
  }
  
  return { valid: true, message: '' }
}

/**
 * 验证正则表达式
 * @param value 值
 * @param regex 正则表达式
 * @param message 错误消息
 * @returns 验证结果
 */
export const validateRegex = (value: string, regex: RegExp, message: string): { valid: boolean; message: string } => {
  if (!regex.test(value)) {
    return { valid: false, message }
  }
  
  return { valid: true, message: '' }
}

/**
 * 验证文件类型
 * @param file 文件
 * @param allowedTypes 允许的文件类型
 * @returns 验证结果
 */
export const validateFileType = (file: File, allowedTypes: string[]): { valid: boolean; message: string } => {
  if (!file) {
    return { valid: false, message: '请选择文件' }
  }
  
  const fileType = file.type
  const isValidType = allowedTypes.some(type => {
    if (type.startsWith('.')) {
      return file.name.toLowerCase().endsWith(type.toLowerCase())
    }
    return fileType.includes(type)
  })
  
  if (!isValidType) {
    return { valid: false, message: `文件类型不支持，仅支持：${allowedTypes.join(', ')}` }
  }
  
  return { valid: true, message: '' }
}

/**
 * 验证文件大小
 * @param file 文件
 * @param maxSize 最大文件大小（字节）
 * @returns 验证结果
 */
export const validateFileSize = (file: File, maxSize: number): { valid: boolean; message: string } => {
  if (!file) {
    return { valid: false, message: '请选择文件' }
  }
  
  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / 1024 / 1024).toFixed(2)
    return { valid: false, message: `文件大小不能超过${maxSizeMB}MB` }
  }
  
  return { valid: true, message: '' }
}

/**
 * 验证数组长度
 * @param array 数组
 * @param minLength 最小长度
 * @param maxLength 最大长度
 * @param fieldName 字段名称
 * @returns 验证结果
 */
export const validateArrayLength = (array: any[], minLength: number, maxLength: number, fieldName: string): { valid: boolean; message: string } => {
  if (!Array.isArray(array)) {
    return { valid: false, message: `${fieldName}必须是数组` }
  }
  
  if (array.length < minLength) {
    return { valid: false, message: `${fieldName}长度不能少于${minLength}项` }
  }
  
  if (array.length > maxLength) {
    return { valid: false, message: `${fieldName}长度不能超过${maxLength}项` }
  }
  
  return { valid: true, message: '' }
}
